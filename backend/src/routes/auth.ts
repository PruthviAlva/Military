import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authenticateUser, createUser } from '../services/authService';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, baseId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role required' });
    }

    const user = await createUser(email, password, role, baseId);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({ user: (req as any).auth });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
