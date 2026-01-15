import { chatModel } from '../config/gemini.js';
import { supabase } from '../config/supabase.js';

// Get personality prompt based on friend info
const getPersonalityPrompt = (friendInfo) => {
  const { job, gender, company, name } = friendInfo;

  let basePrompt = '진짜 카톡하듯이 짧고 간단하게 답변해. 반말 쓰고, 1-2문장만. 이모티콘은 가끔만(ㅋㅋ, ㅠㅠ 정도). 이모지는 거의 안 써.\n\n';

  // 직군별 성향
  if (job === '개발') {
    basePrompt += `너는 개발자야. 가끔 개발 용어나 코딩 얘기를 자연스럽게 섞어서 대화해. `;
  } else if (job === '디자인') {
    basePrompt += `너는 디자이너야. 감성적이고 예쁜 것, 디자인 얘기를 좋아해. `;
  } else if (job === '스태프') {
    basePrompt += `너는 기획/운영 스태프야. 체계적이고 꼼꼼한 성격. `;
  }

  // 성별별 말투
  if (gender === '남자') {
    basePrompt += `남자 말투로 대화해. 좀 더 간결하고 직설적으로. `;
  } else if (gender === '여자') {
    basePrompt += `여자 말투로 대화해. 좀 더 부드럽고 공감을 잘해줘. `;
  }

  // 계열사별 특징
  if (company.includes('카카오페이')) {
    basePrompt += `카카오페이에서 일하니까 가끔 결제, 금융 얘기가 나올 수 있어. `;
  } else if (company.includes('엔터테인먼트')) {
    basePrompt += `카카오 엔터테인먼트에서 일하니까 가끔 음악, 콘텐츠 얘기가 나올 수 있어. `;
  }

  basePrompt += `\n너의 이름은 ${name}야.\n\n`;

  return basePrompt;
};

export const sendMessage = async (req, res) => {
  try {
    const { message, userId, friendInfo } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const friendId = friendInfo?.id || 'unknown';

    // Save user message to Supabase
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert([
        {
          user_id: userId || 'anonymous',
          friend_id: friendId,
          content: message,
          role: 'user',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error saving user message:', userError);
    }

    // Get AI response from Gemini with personality based on friend info
    let personalityPrompt = '';

    if (friendInfo) {
      personalityPrompt = getPersonalityPrompt(friendInfo);
    } else {
      // Default personality if no friend info
      personalityPrompt = '진짜 카톡하듯이 간단하게 답변해. 반말 쓰고, 1-2문장만. 이모티콘은 가끔만(ㅋㅋ, ㅠㅠ 정도). 이모지는 거의 안 써.\n\n';
    }

    personalityPrompt += `사용자: ${message}\n답변:`;

    const chat = chatModel.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessage(personalityPrompt);
    const aiResponse = result.response.text();

    // Save AI response to Supabase
    const { data: aiMessage, error: aiError } = await supabase
      .from('messages')
      .insert([
        {
          user_id: userId || 'anonymous',
          friend_id: friendId,
          content: aiResponse,
          role: 'assistant',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (aiError) {
      console.error('Error saving AI message:', aiError);
    }

    res.json({
      message: aiResponse,
      messageId: aiMessage?.id
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, friendId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId || 'anonymous')
      .eq('friend_id', friendId || 'unknown')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ messages: data || [] });

  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase.rpc('get_recent_chats_for_user', { p_user_id: userId });

    if (error) {
      console.error('Error fetching recent chats:', error);
      throw error;
    }

    res.json({ chats: data || [] });

  } catch (error) {
    console.error('Error in getRecentChats:', error);
    res.status(500).json({ error: 'Failed to fetch recent chats' });
  }
};
