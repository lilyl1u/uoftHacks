import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getAllWashrooms = async (req: Request, res: Response) => {
  try {
    const { campus } = req.query;
    
    let query = `SELECT 
        id, 
        name, 
        building, 
        floor, 
        latitude, 
        longitude,
        campus,
        average_rating, 
        total_reviews,
        accessibility,
        paid_access,
        created_at
      FROM washrooms`;
    
    const params: any[] = [];
    if (campus && (campus === 'UofT' || campus === 'Waterloo')) {
      query += ` WHERE campus = $1`;
      params.push(campus);
    }
    
    query += ` ORDER BY average_rating DESC, total_reviews DESC`;

    const result = await pool.query(query, params);

    res.json({ washrooms: result.rows });
  } catch (error) {
    console.error('Get all washrooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWashroomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        building, 
        floor, 
        latitude, 
        longitude,
        campus,
        average_rating, 
        total_reviews,
        accessibility,
        paid_access,
        created_at
      FROM washrooms 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Washroom not found' });
    }

    res.json({ washroom: result.rows[0] });
  } catch (error) {
    console.error('Get washroom by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWashroom = async (req: Request, res: Response) => {
  try {
    const { name, building, floor, latitude, longitude, campus, accessibility, paid_access } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }

    const washroomCampus = campus && (campus === 'UofT' || campus === 'Waterloo') ? campus : 'UofT';

    const result = await pool.query(
      `INSERT INTO washrooms 
      (name, building, floor, latitude, longitude, campus, accessibility, paid_access) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [name, building || null, floor || null, latitude, longitude, washroomCampus, accessibility || false, paid_access || false]
    );

    res.status(201).json({ message: 'Washroom created successfully', washroom: result.rows[0] });
  } catch (error) {
    console.error('Create washroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWashroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, building, floor, accessibility, paid_access } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (building !== undefined) {
      updates.push(`building = $${paramCount++}`);
      values.push(building);
    }

    if (floor !== undefined) {
      updates.push(`floor = $${paramCount++}`);
      values.push(floor);
    }

    if (accessibility !== undefined) {
      updates.push(`accessibility = $${paramCount++}`);
      values.push(accessibility);
    }

    if (paid_access !== undefined) {
      updates.push(`paid_access = $${paramCount++}`);
      values.push(paid_access);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE washrooms 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Washroom not found' });
    }

    res.json({ message: 'Washroom updated successfully', washroom: result.rows[0] });
  } catch (error) {
    console.error('Update washroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteWashroom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if washroom exists
    const checkResult = await pool.query(
      'SELECT id FROM washrooms WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Washroom not found' });
    }

    // Delete washroom (CASCADE will automatically delete related reviews and visits)
    await pool.query('DELETE FROM washrooms WHERE id = $1', [id]);

    res.json({ message: 'Washroom deleted successfully' });
  } catch (error) {
    console.error('Delete washroom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWashroomsByLocation = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query; // radius in degrees (roughly 1km)

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        building, 
        floor, 
        latitude, 
        longitude,
        campus,
        average_rating, 
        total_reviews,
        accessibility,
        paid_access,
        SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) AS distance
      FROM washrooms 
      WHERE 
        latitude BETWEEN $1 - $3 AND $1 + $3
        AND longitude BETWEEN $2 - $3 AND $2 + $3
      ORDER BY distance, average_rating DESC
      LIMIT 50`,
      [parseFloat(lat as string), parseFloat(lng as string), parseFloat(radius as string)]
    );

    res.json({ washrooms: result.rows });
  } catch (error) {
    console.error('Get washrooms by location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopVisitedWashrooms = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const result = await pool.query(
      `SELECT 
        w.id,
        w.name,
        w.building,
        w.floor,
        w.latitude,
        w.longitude,
        w.campus,
        w.average_rating,
        w.total_reviews,
        w.accessibility,
        w.paid_access,
        COALESCE(SUM(uwv.visit_count), 0) as total_visits
      FROM washrooms w
      LEFT JOIN user_washroom_visits uwv ON w.id = uwv.washroom_id
      GROUP BY w.id
      ORDER BY total_visits DESC, w.average_rating DESC
      LIMIT $1`,
      [parseInt(limit as string)]
    );

    res.json({ washrooms: result.rows });
  } catch (error) {
    console.error('Get top visited washrooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
