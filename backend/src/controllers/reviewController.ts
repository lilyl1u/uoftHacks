import { Request, Response } from 'express';
import { pool } from '../config/database';

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const {
      washroom_id,
      cleanliness_rating,
      privacy_rating,
      wait_time_rating,
      accessibility_rating,
      ease_of_access_rating,
      comment,
      toiletries_available,
    } = req.body;

    if (!washroom_id || !cleanliness_rating || !privacy_rating || !wait_time_rating) {
      return res.status(400).json({ error: 'Missing required rating fields' });
    }

    // Calculate overall rating (average of all ratings)
    const ratings = [
      cleanliness_rating,
      privacy_rating,
      wait_time_rating,
      accessibility_rating || 3,
      ease_of_access_rating || 3,
    ].filter(r => r !== undefined && r !== null);
    
    const overall_rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // Check if user already reviewed this washroom
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND washroom_id = $2',
      [userId, washroom_id]
    );

    let reviewResult;
    if (existingReview.rows.length > 0) {
      // Update existing review
      reviewResult = await pool.query(
        `UPDATE reviews 
        SET cleanliness_rating = $1, 
            privacy_rating = $2, 
            wait_time_rating = $3,
            accessibility_rating = $4,
            ease_of_access_rating = $5,
            overall_rating = $6,
            comment = $7,
            toiletries_available = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9 AND washroom_id = $10
        RETURNING *`,
        [
          cleanliness_rating,
          privacy_rating,
          wait_time_rating,
          accessibility_rating || null,
          ease_of_access_rating || null,
          overall_rating,
          comment || null,
          toiletries_available ? JSON.stringify(toiletries_available) : null,
          userId,
          washroom_id,
        ]
      );
    } else {
      // Create new review
      reviewResult = await pool.query(
        `INSERT INTO reviews 
        (user_id, washroom_id, cleanliness_rating, privacy_rating, wait_time_rating, 
         accessibility_rating, ease_of_access_rating, overall_rating, comment, toiletries_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          userId,
          washroom_id,
          cleanliness_rating,
          privacy_rating,
          wait_time_rating,
          accessibility_rating || null,
          ease_of_access_rating || null,
          overall_rating,
          comment || null,
          toiletries_available ? JSON.stringify(toiletries_available) : null,
        ]
      );

      // Update user washroom visits
      await pool.query(
        `INSERT INTO user_washroom_visits (user_id, washroom_id, visit_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, washroom_id) 
         DO UPDATE SET visit_count = user_washroom_visits.visit_count + 1,
                       last_visited = CURRENT_TIMESTAMP`,
        [userId, washroom_id]
      );

      // Update user's washrooms_visited count
      await pool.query(
        'UPDATE users SET washrooms_visited = washrooms_visited + 1 WHERE id = $1',
        [userId]
      );
    }

    // Update washroom's average rating and total reviews
    const avgResult = await pool.query(
      `SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total 
       FROM reviews 
       WHERE washroom_id = $1`,
      [washroom_id]
    );

    await pool.query(
      `UPDATE washrooms 
       SET average_rating = $1, 
           total_reviews = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        parseFloat(avgResult.rows[0].avg_rating || 0),
        parseInt(avgResult.rows[0].total || 0),
        washroom_id,
      ]
    );

    res.status(201).json({
      message: 'Review created successfully',
      review: reviewResult.rows[0],
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReviewsByWashroom = async (req: Request, res: Response) => {
  try {
    const { washroomId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.id,
        r.cleanliness_rating,
        r.privacy_rating,
        r.wait_time_rating,
        r.accessibility_rating,
        r.ease_of_access_rating,
        r.overall_rating,
        r.comment,
        r.toiletries_available,
        r.created_at,
        u.id as user_id,
        u.username,
        u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.washroom_id = $1
      ORDER BY r.created_at DESC`,
      [washroomId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get reviews by washroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.id,
        r.washroom_id,
        r.cleanliness_rating,
        r.privacy_rating,
        r.wait_time_rating,
        r.overall_rating,
        r.comment,
        r.created_at,
        w.name as washroom_name,
        w.building
      FROM reviews r
      JOIN washrooms w ON r.washroom_id = w.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFriendsReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get reviews from all friends, ordered by most recent
    const result = await pool.query(
      `SELECT 
        r.id,
        r.washroom_id,
        r.cleanliness_rating,
        r.privacy_rating,
        r.wait_time_rating,
        r.overall_rating,
        r.comment,
        r.created_at,
        w.name as washroom_name,
        w.building,
        w.latitude,
        w.longitude,
        u.id as user_id,
        u.username,
        u.avatar
      FROM reviews r
      JOIN washrooms w ON r.washroom_id = w.id
      JOIN users u ON r.user_id = u.id
      JOIN friends f ON f.friend_id = r.user_id AND f.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 50`,
      [userId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get friends reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFriendsReviewsByWashroom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { washroomId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get reviews from friends for a specific washroom
    const result = await pool.query(
      `SELECT 
        r.id,
        r.washroom_id,
        r.cleanliness_rating,
        r.privacy_rating,
        r.wait_time_rating,
        r.accessibility_rating,
        r.ease_of_access_rating,
        r.overall_rating,
        r.comment,
        r.toiletries_available,
        r.created_at,
        u.id as user_id,
        u.username,
        u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN friends f ON f.friend_id = r.user_id AND f.user_id = $1
      WHERE r.washroom_id = $2
      ORDER BY r.created_at DESC`,
      [userId, washroomId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get friends reviews by washroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const {
      cleanliness_rating,
      privacy_rating,
      wait_time_rating,
      accessibility_rating,
      ease_of_access_rating,
      comment,
      toiletries_available,
    } = req.body;

    // Check if review belongs to user
    const existingReview = await pool.query(
      'SELECT washroom_id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const washroom_id = existingReview.rows[0].washroom_id;

    // Calculate overall rating
    const ratings = [
      cleanliness_rating,
      privacy_rating,
      wait_time_rating,
      accessibility_rating || 3,
      ease_of_access_rating || 3,
    ].filter(r => r !== undefined && r !== null);
    
    const overall_rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    const result = await pool.query(
      `UPDATE reviews 
      SET cleanliness_rating = COALESCE($1, cleanliness_rating),
          privacy_rating = COALESCE($2, privacy_rating),
          wait_time_rating = COALESCE($3, wait_time_rating),
          accessibility_rating = COALESCE($4, accessibility_rating),
          ease_of_access_rating = COALESCE($5, ease_of_access_rating),
          overall_rating = $6,
          comment = COALESCE($7, comment),
          toiletries_available = COALESCE($8, toiletries_available),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [
        cleanliness_rating,
        privacy_rating,
        wait_time_rating,
        accessibility_rating,
        ease_of_access_rating,
        overall_rating,
        comment,
        toiletries_available ? JSON.stringify(toiletries_available) : null,
        id,
        userId,
      ]
    );

    // Update washroom's average rating
    const avgResult = await pool.query(
      `SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total 
       FROM reviews 
       WHERE washroom_id = $1`,
      [washroom_id]
    );

    await pool.query(
      `UPDATE washrooms 
       SET average_rating = $1, 
           total_reviews = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        parseFloat(avgResult.rows[0].avg_rating || 0),
        parseInt(avgResult.rows[0].total || 0),
        washroom_id,
      ]
    );

    res.json({ message: 'Review updated successfully', review: result.rows[0] });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    // Check if review belongs to user
    const existingReview = await pool.query(
      'SELECT washroom_id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const washroom_id = existingReview.rows[0].washroom_id;

    await pool.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, userId]);

    // Update washroom's average rating
    const avgResult = await pool.query(
      `SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total 
       FROM reviews 
       WHERE washroom_id = $1`,
      [washroom_id]
    );

    await pool.query(
      `UPDATE washrooms 
       SET average_rating = COALESCE($1, 0), 
           total_reviews = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        avgResult.rows[0].avg_rating ? parseFloat(avgResult.rows[0].avg_rating) : 0,
        parseInt(avgResult.rows[0].total || 0),
        washroom_id,
      ]
    );

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
