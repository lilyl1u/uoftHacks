import { Request, Response } from 'express';
import { pool } from '../config/database';

export const likeReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify review exists
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existingLike.rows.length > 0) {
      return res.status(400).json({ error: 'Review already liked' });
    }

    await pool.query(
      'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)',
      [reviewId, userId]
    );

    // Get updated like count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1',
      [reviewId]
    );

    res.json({
      message: 'Review liked successfully',
      liked: true,
      like_count: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlikeReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Get updated like count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1',
      [reviewId]
    );

    res.json({
      message: 'Review unliked successfully',
      liked: false,
      like_count: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Unlike review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1',
      [reviewId]
    );

    res.json({ like_count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get like count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkIfLiked = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error('Check if liked error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLikesForReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const result = await pool.query(
      `SELECT 
        l.id,
        l.created_at,
        u.id as user_id,
        u.username,
        u.avatar
      FROM review_likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.review_id = $1
      ORDER BY l.created_at DESC`,
      [reviewId]
    );

    res.json({ likes: result.rows });
  } catch (error) {
    console.error('Get likes for review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
