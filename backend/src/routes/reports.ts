import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import pool from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get audit logs
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { user_id, action, resource_type, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (user_id) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(user_id);
    }

    if (action) {
      query += ` AND action = $${params.length + 1}`;
      params.push(action);
    }

    if (resource_type) {
      query += ` AND resource_type = $${params.length + 1}`;
      params.push(resource_type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching audit logs', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get summary statistics
router.get('/summary/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { base_id } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (base_id) {
      whereClause += ` AND a.base_id = $${params.length + 1}`;
      params.push(base_id);
    }

    const result = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT a.id) as total_assets,
        COALESCE(SUM(p.quantity), 0) as total_purchases,
        COALESCE(SUM(t.quantity), 0) as total_transfers,
        COALESCE(SUM(e.quantity), 0) as total_expended,
        COALESCE(SUM(a.opening_balance), 0) as total_opening_balance
      FROM assets a
      LEFT JOIN purchases p ON a.id = p.asset_id
      LEFT JOIN transfers t ON a.id = t.asset_id
      LEFT JOIN expenditures e ON a.id = e.asset_id
      ${whereClause}
      `,
      params
    );

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching statistics', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
