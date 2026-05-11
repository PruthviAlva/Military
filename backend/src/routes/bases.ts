import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import pool from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get all bases
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM bases ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching bases', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get base by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM bases WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Base not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching base', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create base (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location required' });
    }

    const result = await pool.query(
      'INSERT INTO bases (name, location, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [name, location]
    );

    logger.info('Base created', { baseId: result.rows[0].id, name });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating base', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
