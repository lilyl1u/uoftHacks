import { Request, Response } from 'express';
import { pool } from '../config/database';

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { reviewId } = req.params;
    const { comment_text } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Verify review exists
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const result = await pool.query(
      `INSERT INTO review_comments (review_id, user_id, comment_text)
       VALUES ($1, $2, $3)
       RETURNING id, review_id, user_id, comment_text, created_at, updated_at`,
      [reviewId, userId, comment_text.trim()]
    );

    // Get user info for the comment
    const userResult = await pool.query(
      'SELECT id, username, avatar FROM users WHERE id = $1',
      [userId]
    );

    // Return comment in the same format as getCommentsByReview
    const comment = {
      id: result.rows[0].id,
      review_id: result.rows[0].review_id,
      comment_text: result.rows[0].comment_text,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      user_id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      avatar: userResult.rows[0].avatar,
    };

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommentsByReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.review_id,
        c.comment_text,
        c.created_at,
        c.updated_at,
        u.id as user_id,
        u.username,
        u.avatar
      FROM review_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.review_id = $1
      ORDER BY c.created_at ASC`,
      [reviewId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments by review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { commentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if comment belongs to user
    const commentCheck = await pool.query(
      'SELECT id FROM review_comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    await pool.query('DELETE FROM review_comments WHERE id = $1 AND user_id = $2', [
      commentId,
      userId,
    ]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
