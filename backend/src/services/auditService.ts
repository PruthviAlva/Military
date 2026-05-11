import pool from '../config/database';
import logger from '../config/logger';

export const auditLog = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes: Record<string, any>,
  ipAddress: string
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, changes, ip_address, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress]
    );

    logger.info('Audit log created', {
      userId,
      action,
      resourceType,
      resourceId,
    });
  } catch (error) {
    logger.error('Failed to create audit log', {
      error: (error as Error).message,
      userId,
      action,
    });
  }
};
