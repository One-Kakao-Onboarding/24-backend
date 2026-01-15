import { supabase } from '../config/supabase.js';

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert new user with plain password (INSECURE!)
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password_hash: password }])
      .select('id, username, created_at');

    if (error) {
      console.error('Error signing up:', error);
      return res.status(500).json({ error: 'Could not create user' });
    }

    res.status(201).json({ success: true, user: data[0] });

  } catch (error) {
    console.error('Exception in signup:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password (plain text comparison - INSECURE!)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Login successful
    res.json({
      success: true,
      userId: user.username,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
