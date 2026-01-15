import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse friends from data/default_friends.md
const loadFriends = () => {
  try {
    const friendsFilePath = path.join(__dirname, '../../../data/default_friends.md');
    const content = fs.readFileSync(friendsFilePath, 'utf-8');

    const friends = [];
    const lines = content.split('\n');

    let currentFriend = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentFriend) {
          friends.push(currentFriend);
        }
        currentFriend = {
          id: line.replace('## ', '').trim(),
          name: line.replace('## ', '').trim(),
          job: '',
          gender: '',
          company: ''
        };
      } else if (currentFriend && line.includes('- 직군:')) {
        currentFriend.job = line.replace('- 직군:', '').trim();
      } else if (currentFriend && line.includes('- 성별:')) {
        currentFriend.gender = line.replace('- 성별:', '').trim();
      } else if (currentFriend && line.includes('- 계열사:')) {
        currentFriend.company = line.replace('- 계열사:', '').trim();
      }
    }

    if (currentFriend) {
      friends.push(currentFriend);
    }

    return friends;
  } catch (error) {
    console.error('Error loading friends:', error);
    return [];
  }
};

export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query;
    const allFriends = loadFriends();

    // Exclude current user from friend list
    const friends = allFriends.filter(friend => friend.id !== userId);

    res.json({ friends });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

export const getFriendById = async (req, res) => {
  try {
    const { friendId } = req.params;
    const friends = loadFriends();
    const friend = friends.find(f => f.id === friendId);

    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    res.json({ friend });
  } catch (error) {
    console.error('Error in getFriendById:', error);
    res.status(500).json({ error: 'Failed to fetch friend' });
  }
};
