import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get washroom visits
    const visitsResult = await pool.query(
      `SELECT 
        w.id, 
        w.name, 
        w.building,
        uwv.visit_count,
        uwv.last_visited
      FROM user_washroom_visits uwv
      JOIN washrooms w ON uwv.washroom_id = w.id
      WHERE uwv.user_id = $1
      ORDER BY uwv.last_visited DESC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      washroom_visits: visitsResult.rows,
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
