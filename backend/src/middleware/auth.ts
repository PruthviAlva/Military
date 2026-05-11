import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { AuthRequest } from '../utils/types';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthRequest;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthRequest;
    req.auth = decoded;

    logger.info('Authentication successful', { userId: decoded.userId });
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: (error as Error).message });
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.auth.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.auth.userId,
        requiredRoles: roles,
        userRole: req.auth.role,
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireBaseAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const requestedBaseId = req.query.base_id || req.params.base_id || req.body.base_id;

  if (req.auth.role === 'admin') {
    return next();
  }

  if (req.auth.role === 'base_commander' && req.auth.baseId !== requestedBaseId) {
    logger.warn('Base access denied', {
      userId: req.auth.userId,
      requestedBase: requestedBaseId,
      userBase: req.auth.baseId,
    });
    return res.status(403).json({ error: 'Access denied to this base' });
  }

  next();
};
