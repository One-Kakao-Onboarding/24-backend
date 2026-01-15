import { imageModel } from '../config/gemini.js';
import { supabase } from '../config/supabase.js';

export const generateDiary = async (req, res) => {
  try {
    const { userId } = req.body;
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

    // Summarize messages for image prompt
    const messageContents = messages.map(m => m.content).join('\n');
    const summaryPrompt = `다음은 오늘 하루 동안 나눈 대화입니다. 이 대화의 핵심 내용을 바탕으로 그림일기에 그릴 장면을 한 문장으로 요약해주세요. 따뜻하고 일기 같은 느낌으로 작성해주세요:\n\n${messageContents}`;

    const summaryResult = await imageModel.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();

    // Generate image prompt in English for better results
    const imagePromptText = `Create a warm, diary-style illustration based on this summary: ${summary}. Style: cute, hand-drawn, watercolor, suitable for a personal diary.`;

    // Note: Nanobanana (Imagen 3) is accessed through generateContent with image generation
    // According to the docs, we use generateImages method
    const imageResult = await imageModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: imagePromptText }]
      }],
      generationConfig: {
        responseModalities: ['image'],
      }
    });

    // Extract image data
    let imageUrl = null;
    if (imageResult.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const imageData = imageResult.response.candidates[0].content.parts[0].inlineData;
      imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;
    }

    // Save diary entry
    const { data: diary, error: diaryError } = await supabase
      .from('diaries')
      .insert([
        {
          user_id: userId || 'anonymous',
          summary: summary,
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
        summary: summary,
        imageUrl: imageUrl,
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
