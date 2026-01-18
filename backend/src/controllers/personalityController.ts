import { Request, Response } from 'express';
import { pool } from '../config/database';
import { analyzePersonality, PERSONALITY_DESCRIPTIONS } from '../services/geminiService';

export const generatePersonality = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const targetUserId = parseInt(id);

    // Users can only generate their own personality
    if (userId !== targetUserId) {
      return res.status(403).json({ error: 'You can only generate your own personality' });
    }

    // Get all reviews with timestamps to analyze time patterns
    const reviewsResult = await pool.query(
      `SELECT 
        r.created_at,
        r.overall_rating,
        w.name as washroom_name
      FROM reviews r
      JOIN washrooms w ON r.washroom_id = w.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [targetUserId]
    );

    // Get visit data
    const visitsResult = await pool.query(
      `SELECT 
        uwv.visit_count,
        uwv.last_visited,
        w.name as washroom_name,
        w.average_rating
      FROM user_washroom_visits uwv
      JOIN washrooms w ON uwv.washroom_id = w.id
      WHERE uwv.user_id = $1`,
      [targetUserId]
    );

    if (reviewsResult.rows.length === 0 && visitsResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Not enough data to generate personality. Please visit and review some washrooms first.' 
      });
    }

    // Calculate time patterns from review timestamps
    const timePatterns = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    reviewsResult.rows.forEach((review: any) => {
      const date = new Date(review.created_at);
      const hour = date.getHours();
      
      if (hour >= 6 && hour < 12) {
        timePatterns.morning++;
      } else if (hour >= 12 && hour < 18) {
        timePatterns.afternoon++;
      } else if (hour >= 18 && hour < 22) {
        timePatterns.evening++;
      } else {
        timePatterns.night++;
      }
    });

    // Calculate location diversity
    const uniqueWashrooms = new Set(visitsResult.rows.map((v: any) => v.washroom_name)).size;
    const totalVisits = visitsResult.rows.reduce((sum: number, v: any) => sum + v.visit_count, 0);
    const locationDiversity = uniqueWashrooms > 0 ? uniqueWashrooms / Math.max(totalVisits, 1) : 0;

    // Calculate average rating
    const ratings = reviewsResult.rows.map((r: any) => parseFloat(r.overall_rating) || 0);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    // Find most visited washroom
    const washroomCounts: Record<string, number> = {};
    visitsResult.rows.forEach((v: any) => {
      washroomCounts[v.washroom_name] = (washroomCounts[v.washroom_name] || 0) + v.visit_count;
    });
    const mostVisitedWashroom = Object.entries(washroomCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Calculate visit consistency (simplified - based on review frequency)
    const reviewDates = reviewsResult.rows.map((r: any) => new Date(r.created_at).getTime());
    let visitConsistency = 0.5; // Default
    if (reviewDates.length > 1) {
      const sortedDates = reviewDates.sort((a, b) => a - b);
      const intervals: number[] = [];
      for (let i = 1; i < sortedDates.length; i++) {
        intervals.push(sortedDates[i] - sortedDates[i - 1]);
      }
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => {
          return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        // Lower variance = higher consistency
        visitConsistency = Math.max(0, 1 - (stdDev / (avgInterval || 1)));
      }
    }

    // Calculate visit frequency (visits per week)
    let visitFrequency = 0;
    if (reviewsResult.rows.length > 1) {
      const firstReview = reviewsResult.rows[reviewsResult.rows.length - 1];
      const lastReview = reviewsResult.rows[0];
      const daysDiff = (new Date(lastReview.created_at).getTime() - 
                       new Date(firstReview.created_at).getTime()) / (1000 * 60 * 60 * 24);
      visitFrequency = daysDiff > 0 ? (totalVisits / daysDiff) * 7 : totalVisits;
    } else if (reviewsResult.rows.length === 1) {
      // If only one review, estimate based on account age
      const userResult = await pool.query('SELECT created_at FROM users WHERE id = $1', [targetUserId]);
      if (userResult.rows.length > 0) {
        const accountAge = (Date.now() - new Date(userResult.rows[0].created_at).getTime()) / (1000 * 60 * 60 * 24);
        visitFrequency = accountAge > 0 ? (totalVisits / accountAge) * 7 : totalVisits;
      } else {
        visitFrequency = totalVisits;
      }
    } else {
      visitFrequency = totalVisits;
    }

    const visitData = {
      totalVisits,
      uniqueWashrooms,
      visitFrequency,
      timePatterns,
      locationDiversity: Math.min(locationDiversity, 1),
      averageRating,
      reviewCount: reviewsResult.rows.length,
      mostVisitedWashroom,
      visitConsistency: Math.min(visitConsistency, 1)
    };

    // Generate personality using Gemini
    const { personality, description } = await analyzePersonality(visitData);

    // Update user's personality in database
    await pool.query(
      'UPDATE users SET personality_type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [personality, targetUserId]
    );

    res.json({
      personality,
      description,
      visitData // Include for debugging/display
    });
  } catch (error) {
    console.error('Generate personality error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPersonalityDescription = async (req: Request, res: Response) => {
  try {
    const { personalityType } = req.params;
    
    const description = PERSONALITY_DESCRIPTIONS[personalityType] || null;
    
    if (!description) {
      return res.status(404).json({ error: 'Personality type not found' });
    }

    res.json({ personality: personalityType, description });
  } catch (error) {
    console.error('Get personality description error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
