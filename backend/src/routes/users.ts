import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import pool from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, base_id, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching users', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requesterId = (req as any).auth.userId;
    const requesterRole = (req as any).auth.role;

    // Users can only view their own profile unless they're admin
    if (requesterRole !== 'admin' && id !== requesterId) {
      return res.status(403).json({ error: 'Cannot view other users profiles' });
    }

    const result = await pool.query(
      'SELECT id, email, role, base_id, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, base_id } = req.body;

    const result = await pool.query(
      'UPDATE users SET role = $1, base_id = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, role, base_id',
      [role, base_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User updated', { userId: id });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating user', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    logger.info('User deleted', { userId: id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
