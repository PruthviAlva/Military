import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).auth?.userId,
      ip: req.ip,
    });
  });

  next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: (req as any).auth?.userId,
  });

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
};
