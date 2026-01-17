import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from './auth';

export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user role from database
      const result = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      // Attach role to request for use in controllers if needed
      (authReq as any).userRole = userRole;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const requireAdmin = requireRole(['admin']);
