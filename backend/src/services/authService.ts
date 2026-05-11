import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

export const createUser = async (
  email: string,
  password: string,
  role: string,
  baseId?: string
): Promise<any> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, role, base_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, role, base_id`,
      [email, hashedPassword, role, baseId || null]
    );

    logger.info('User created', { email, role });
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating user', { error: (error as Error).message, email });
    throw error;
  }
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: any } | null> => {
  try {
    const result = await pool.query(
      'SELECT id, email, password, role, base_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        baseId: user.base_id,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    logger.info('User authenticated', { email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        baseId: user.base_id,
      },
    };
  } catch (error) {
    logger.error('Authentication error', { error: (error as Error).message });
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<any> => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, base_id FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user', { error: (error as Error).message });
    throw error;
  }
};
