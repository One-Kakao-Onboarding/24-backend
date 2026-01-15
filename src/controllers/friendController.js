import { supabase } from '../config/supabase.js';

export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query;

    // Fetch friends from Supabase based on current user
    const { data: friends, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId || 'anonymous');

    if (error) {
      throw error;
    }

    res.json({ friends: friends || [] });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

export const getFriendById = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Fetch friend from Supabase
    const { data: friend, error } = await supabase
      .from('friends')
      .select('*')
      .eq('id', friendId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Friend not found' });
      }
      throw error;
    }

    res.json({ friend });
  } catch (error) {
    console.error('Error in getFriendById:', error);
    res.status(500).json({ error: 'Failed to fetch friend' });
  }
};
