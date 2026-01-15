import { imageModel, generationModel } from '../config/gemini.js';
import { supabase } from '../config/supabase.js';

export const generateDiary = async (req, res) => {
  try {
    const { userId, tone, style } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId || 'anonymous')
      .eq('role', 'user')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages found for today' });
    }

    // Validate tone
    const validTones = ['basic', 'k-worker', 'fact-bomber', 'midnight-insta'];
    const selectedTone = validTones.includes(tone) ? tone : 'basic';

    const toneDescription = getToneDescription(selectedTone);
    const styleDescription = style || '심플';

    // Get message contents
    const messageContents = messages.map(m => m.content).join('\n');

    const summaryPrompt = `다음은 오늘 하루 동안 나눈 대화입니다. 이 대화의 핵심 내용을 바탕으로 4~5문장의 일기로 작성해주세요. 일기이므로 markdown에 들어가는 기호는 절대 포함하면 안됩니다.
말투: ${toneDescription}
그림체: ${styleDescription}
따뜻하고 일기 같은 느낌으로 작성해주세요:\n\n${messageContents}`;

    const summaryResult = await imageModel.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();

    // Generate short title
    const titlePrompt = `다음 일기의 핵심을 담은 짧은 제목을 5-10글자로 생성해주세요. 마침표나 특수문자는 빼고 한 줄의 문구만 작성해주세요:\n\n${summary}`;
    const titleResult = await imageModel.generateContent(titlePrompt);
    const title = titleResult.response.text().trim();

    // Infer emotion from diary content
    const emotionPrompt = `다음 일기의 감정을 다음 중 하나로 분류해주세요: joy(기쁨), peace(평온), sad(슬픔), angry(화남), anxiety(불안), excitement(흥분).
분류 결과만 영문으로 한 단어만 답변해주세요:\n\n${summary}`;
    const emotionResult = await imageModel.generateContent(emotionPrompt);
    const emotion = emotionResult.response.text().trim().toLowerCase();

    // Validate emotion is one of the allowed values
    const validEmotions = ['joy', 'peace', 'sad', 'angry', 'anxiety', 'excitement'];
    const detectedEmotion = validEmotions.includes(emotion) ? emotion : 'joy';

    // Generate image for the diary using Gemini
    let imageUrl = null;
    try {
      const imagePrompt = `A warm, simple, charming ${styleDescription} style illustration for a diary entry.
Mood: ${toneDescription}
Scene: ${summary}
Title: ${title}
Emotion: ${detectedEmotion}

Create a 386x386 pixel square illustration suitable for a picture diary. Soft colors, gentle style. No text in the image.`;

      console.log('📸 Starting image generation with Gemini...');

      const imageResponse = await generationModel.generateContent({
        contents: [{
          parts: [{
            text: imagePrompt
          }]
        }]
      });

      console.log('📸 Gemini response received');

      // Gemini returns image in the response
      if (imageResponse && imageResponse.response) {
        const candidates = imageResponse.response.candidates;
        if (candidates && candidates.length > 0) {
          const content = candidates[0].content;
          if (content && content.parts) {
            for (const part of content.parts) {
              if (part.inlineData && part.inlineData.data) {
                // Convert base64 to data URL
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                console.log('✅ Image generated successfully');
                break;
              }
            }
          }
        }
      }

      if (!imageUrl) {
        console.log('⚠️ No image data received from Gemini');
      }
    } catch (imageError) {
      console.error('❌ Image generation error:', imageError.message);
      console.error('Full error:', imageError);
      // Continue without image if generation fails
    }

    // Save diary entry
    const { data: diary, error: diaryError } = await supabase
      .from('diaries')
      .insert([
        {
          user_id: userId || 'anonymous',
          title: title,
          summary: summary,
          emotion: detectedEmotion,
          tone: selectedTone,
          image_url: imageUrl,
          message_count: messages.length,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (diaryError) {
      throw diaryError;
    }

    res.json({
      diary: {
        id: diary.id,
        title: title,
        summary: summary,
        emotion: detectedEmotion,
        tone: selectedTone,
        style: style,
        image_url: imageUrl,
        messageCount: messages.length,
        createdAt: diary.created_at
      }
    });

  } catch (error) {
    console.error('Error in generateDiary:', error);
    res.status(500).json({
      error: 'Failed to generate diary',
      details: error.message
    });
  }
};

const getToneDescription = (tone) => {
  const toneMap = {
    'basic': '기본적이고 따뜻한',
    'k-worker': '영혼 가출한 K-직장인처럼',
    'fact-bomber': '팩트 폭격기처럼',
    'midnight-insta': '새벽 2시 인스타 감성으로'
  };
  return toneMap[tone] || '기본적이고 따뜻한';
};

export const getDiaries = async (req, res) => {
  try {
    const { userId } = req.query;

    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId || 'anonymous')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      throw error;
    }

    res.json({ diaries: data || [] });

  } catch (error) {
    console.error('Error in getDiaries:', error);
    res.status(500).json({ error: 'Failed to fetch diaries' });
  }
};

export const getDiariesByMonth = async (req, res) => {
  try {
    const { userId, year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId || 'anonymous')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group diaries by day
    const diariesByDay = {};
    if (data) {
      data.forEach(diary => {
        const day = new Date(diary.created_at).getDate();
        diariesByDay[day] = diary;
      });
    }

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      diariesByDay
    });

  } catch (error) {
    console.error('Error in getDiariesByMonth:', error);
    res.status(500).json({ error: 'Failed to fetch monthly diaries' });
  }
};
