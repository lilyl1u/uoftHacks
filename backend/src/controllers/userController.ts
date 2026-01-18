import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const viewerId = (req as any).user?.userId;
    const profileUserId = parseInt(id);

    if (!viewerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT 
        id, 
        username, 
        avatar, 
        personality_type, 
        badges, 
        washrooms_visited,
        created_at
      FROM users 
      WHERE id = $1`,
      [profileUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isOwnProfile = viewerId === profileUserId;

    // Check if viewer and profile owner are friends (if not own profile)
    let isFriend = false;
    if (!isOwnProfile) {
      const friendshipCheck = await pool.query(
        'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
        [viewerId, profileUserId]
      );
      isFriend = friendshipCheck.rows.length > 0;
    }

    // If not own profile and not friends, return limited profile
    if (!isOwnProfile && !isFriend) {
      return res.json({
        id: result.rows[0].id,
        username: result.rows[0].username,
        avatar: result.rows[0].avatar,
        isLimited: true,
        message: 'Follow this user to see their full profile',
      });
    }

    // Get washroom visits (only for full profile) with user's rating
    const visitsResult = await pool.query(
      `SELECT 
        w.id, 
        w.name, 
        w.building,
        uwv.visit_count,
        uwv.last_visited,
        r.overall_rating
      FROM user_washroom_visits uwv
      JOIN washrooms w ON uwv.washroom_id = w.id
      LEFT JOIN reviews r ON r.user_id = $1 AND r.washroom_id = w.id
      WHERE uwv.user_id = $1
      ORDER BY uwv.last_visited DESC`,
      [profileUserId]
    );

    res.json({
      ...result.rows[0],
      washroom_visits: visitsResult.rows,
      isLimited: false,
      isOwnProfile,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { avatar, personality_type, badges } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (avatar !== undefined) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(avatar);
    }

    if (personality_type !== undefined) {
      updates.push(`personality_type = $${paramCount++}`);
      values.push(personality_type);
    }

    if (badges !== undefined) {
      updates.push(`badges = $${paramCount++}`);
      values.push(badges);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, username, avatar, personality_type, badges`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT badges FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ badges: result.rows[0].badges || [] });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const result = await pool.query(
      `SELECT 
        id,
        username,
        avatar,
        personality_type,
        washrooms_visited,
        badges
      FROM users
      WHERE washrooms_visited > 0
      ORDER BY washrooms_visited DESC, created_at ASC
      LIMIT $1`,
      [parseInt(limit as string)]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
