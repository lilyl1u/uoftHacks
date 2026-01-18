import { Request, Response } from 'express';
import { pool } from '../config/database';
import { analyzeBowelHealth } from '../services/geminiService';

export const getBowelHealthAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const targetUserId = parseInt(id);

    // Users can only view their own health analysis
    if (userId !== targetUserId) {
      return res.status(403).json({ error: 'You can only view your own health analysis' });
    }

    // Get all reviews with timestamps (these represent actual bowel movements)
    const reviewsResult = await pool.query(
      `SELECT 
        r.created_at,
        r.overall_rating
      FROM reviews r
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [targetUserId]
    );

    // Also get visit data (last_visited timestamps)
    const visitsResult = await pool.query(
      `SELECT 
        uwv.last_visited,
        uwv.visit_count
      FROM user_washroom_visits uwv
      WHERE uwv.user_id = $1
      ORDER BY uwv.last_visited DESC`,
      [targetUserId]
    );

    if (reviewsResult.rows.length === 0 && visitsResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Not enough data for health analysis. Please visit and review some washrooms first.' 
      });
    }

    // Collect all timestamps
    const visitTimestamps: string[] = [];
    
    // Add review timestamps
    reviewsResult.rows.forEach((review: any) => {
      if (review.created_at) {
        visitTimestamps.push(review.created_at);
      }
    });

    // Add visit timestamps (multiply by visit_count to represent multiple visits)
    visitsResult.rows.forEach((visit: any) => {
      if (visit.last_visited) {
        // For each visit_count, add the timestamp (spread them out over time)
        const visitCount = visit.visit_count || 1;
        for (let i = 0; i < Math.min(visitCount, 10); i++) { // Cap at 10 per washroom to avoid spam
          visitTimestamps.push(visit.last_visited);
        }
      }
    });

    // Sort timestamps chronologically
    visitTimestamps.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (visitTimestamps.length === 0) {
      return res.status(400).json({ 
        error: 'No valid timestamps found for analysis.' 
      });
    }

    // Calculate statistics
    const totalVisits = visitTimestamps.length;
    const firstVisit = new Date(visitTimestamps[0]);
    const lastVisit = new Date(visitTimestamps[visitTimestamps.length - 1]);
    const daysSpan = Math.max(1, (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24));
    const visitsPerWeek = (totalVisits / daysSpan) * 7;

    // Calculate average time between visits
    let totalHoursBetween = 0;
    let intervalsCount = 0;
    for (let i = 1; i < visitTimestamps.length; i++) {
      const prev = new Date(visitTimestamps[i - 1]);
      const curr = new Date(visitTimestamps[i]);
      const hoursBetween = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60);
      if (hoursBetween < 168) { // Ignore gaps larger than a week
        totalHoursBetween += hoursBetween;
        intervalsCount++;
      }
    }
    const averageTimeBetweenVisits = intervalsCount > 0 ? totalHoursBetween / intervalsCount : 24;

    // Calculate time of day distribution
    const timeOfDayDistribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    visitTimestamps.forEach((ts: string) => {
      const date = new Date(ts);
      const hour = date.getHours();
      
      if (hour >= 6 && hour < 12) {
        timeOfDayDistribution.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeOfDayDistribution.afternoon++;
      } else if (hour >= 18 && hour < 22) {
        timeOfDayDistribution.evening++;
      } else {
        timeOfDayDistribution.night++;
      }
    });

    // Calculate day of week distribution
    const dayOfWeekDistribution = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    };

    visitTimestamps.forEach((ts: string) => {
      const date = new Date(ts);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      if (day === 0) dayOfWeekDistribution.sunday++;
      else if (day === 1) dayOfWeekDistribution.monday++;
      else if (day === 2) dayOfWeekDistribution.tuesday++;
      else if (day === 3) dayOfWeekDistribution.wednesday++;
      else if (day === 4) dayOfWeekDistribution.thursday++;
      else if (day === 5) dayOfWeekDistribution.friday++;
      else if (day === 6) dayOfWeekDistribution.saturday++;
    });

    // Calculate consistency score (0-1)
    // Based on how consistent the intervals are
    let consistencyScore = 0;
    if (intervalsCount > 0) {
      const intervalVariance = [];
      for (let i = 1; i < visitTimestamps.length; i++) {
        const prev = new Date(visitTimestamps[i - 1]);
        const curr = new Date(visitTimestamps[i]);
        const hoursBetween = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60);
        if (hoursBetween < 168) {
          intervalVariance.push(hoursBetween);
        }
      }
      
      if (intervalVariance.length > 1) {
        const mean = intervalVariance.reduce((a, b) => a + b, 0) / intervalVariance.length;
        const variance = intervalVariance.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervalVariance.length;
        const stdDev = Math.sqrt(variance);
        // Lower stdDev relative to mean = higher consistency
        consistencyScore = Math.max(0, Math.min(1, 1 - (stdDev / (mean || 1))));
      } else {
        consistencyScore = 0.5; // Default if not enough data
      }
    }

    const movementData = {
      visitTimestamps,
      totalVisits,
      visitsPerWeek,
      averageTimeBetweenVisits,
      consistencyScore,
      timeOfDayDistribution,
      dayOfWeekDistribution
    };

    // Analyze using Gemini
    const healthAnalysis = await analyzeBowelHealth(movementData);

    res.json({
      ...healthAnalysis,
      statistics: {
        totalVisits,
        visitsPerWeek: visitsPerWeek.toFixed(1),
        averageTimeBetweenVisits: averageTimeBetweenVisits.toFixed(1),
        consistencyScore: (consistencyScore * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Bowel health analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
