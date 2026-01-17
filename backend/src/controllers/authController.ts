import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, role, created_at',
      [username, passwordHash]
    );

    const user = result.rows[0];
    console.log(`✅ User created in shared database: ${username} (ID: ${user.id})`);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, username: user.username, role: user.role || 'user' },
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Check for database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Database connection failed. Please ensure PostgreSQL is running and configured correctly.' 
      });
    }
    
    // Check for other database errors
    if (error.code && error.code.startsWith('2')) {
      return res.status(500).json({ 
        error: 'Database error: ' + (error.message || 'Unknown database error') 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role || 'user' },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Check for database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Database connection failed. Please ensure PostgreSQL is running and configured correctly.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};
