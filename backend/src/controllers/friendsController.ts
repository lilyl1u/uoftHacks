import { Request, Response } from 'express';
import { pool } from '../config/database';

// Follow a user (create mutual friendship - both directions)
export const followUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id: friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (userId === parseInt(friendId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if friend exists
    const friendCheck = await pool.query('SELECT id FROM users WHERE id = $1', [friendId]);
    if (friendCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const existingCheck = await pool.query(
      'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
      [userId, friendId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Already friends with this user' });
    }

    // Create mutual friendship (both directions)
    await pool.query('BEGIN');
    try {
      await pool.query(
        'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)',
        [userId, friendId]
      );
      await pool.query(
        'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)',
        [friendId, userId]
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    res.json({ message: 'Successfully followed user', friendId: parseInt(friendId) });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unfollow a user (remove mutual friendship - both directions)
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id: friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Remove mutual friendship (both directions)
    await pool.query('BEGIN');
    try {
      await pool.query(
        'DELETE FROM friends WHERE user_id = $1 AND friend_id = $2',
        [userId, friendId]
      );
      await pool.query(
        'DELETE FROM friends WHERE user_id = $1 AND friend_id = $2',
        [friendId, userId]
      );
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    res.json({ message: 'Successfully unfollowed user', friendId: parseInt(friendId) });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all friends for a user
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { userId: targetUserId } = req.query;

    const queryUserId = targetUserId ? parseInt(targetUserId as string) : userId;

    if (!queryUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
        u.personality_type,
        f.created_at
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC`,
      [queryUserId]
    );

    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check friendship status between two users
export const getFriendshipStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id: otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (userId === parseInt(otherUserId)) {
      return res.json({ isFriend: false, isOwnProfile: true });
    }

    const result = await pool.query(
      'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
      [userId, otherUserId]
    );

    res.json({ 
      isFriend: result.rows.length > 0,
      isOwnProfile: false
    });
  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search users by username
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { q } = req.query;

    console.log('Search request - userId:', userId, 'query:', q);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = `%${q}%`;
    console.log('Searching with pattern:', searchQuery);

    // Try to query with friends table, fallback to simple query if table doesn't exist
    let result;
    try {
      result = await pool.query(
        `SELECT 
          u.id,
          u.username,
          u.avatar,
          u.personality_type,
          CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_friend
        FROM users u
        LEFT JOIN friends f ON f.friend_id = u.id AND f.user_id = $1
        WHERE u.username ILIKE $2 AND u.id != $1
        ORDER BY u.username
        LIMIT 20`,
        [userId, searchQuery]
      );
    } catch (dbError: any) {
      // If friends table doesn't exist, use simpler query
      if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
        console.warn('Friends table not found, using simple search query');
        result = await pool.query(
          `SELECT 
            u.id,
            u.username,
            u.avatar,
            u.personality_type,
            false as is_friend
          FROM users u
          WHERE u.username ILIKE $1 AND u.id != $2
          ORDER BY u.username
          LIMIT 20`,
          [searchQuery, userId]
        );
      } else {
        throw dbError;
      }
    }

    console.log('Search results:', result.rows.length, 'users found');
    console.log('Results:', result.rows.map(r => r.username));

    res.json({ users: result.rows });
  } catch (error: any) {
    console.error('Search users error:', error);
    console.error('Error details:', error.message, error.code);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
};
