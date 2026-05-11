import pool from '../config/database';
import logger from '../config/logger';
import { auditLog } from './auditService';

export const getAssetsForBase = async (
  baseId: string,
  equipmentType?: string
): Promise<any[]> => {
  try {
    let query = `
      SELECT a.*, 
             COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as purchase_count,
             SUM(CASE WHEN p.id IS NOT NULL THEN p.quantity ELSE 0 END) as total_purchases,
             SUM(CASE WHEN t.id IS NOT NULL AND t.from_base_id = a.base_id THEN t.quantity ELSE 0 END) as total_transfers_out,
             SUM(CASE WHEN t.id IS NOT NULL AND t.to_base_id = a.base_id THEN t.quantity ELSE 0 END) as total_transfers_in,
             SUM(CASE WHEN e.id IS NOT NULL THEN e.quantity ELSE 0 END) as total_expended,
             SUM(CASE WHEN as.id IS NOT NULL THEN as.quantity ELSE 0 END) as total_assigned
      FROM assets a
      LEFT JOIN purchases p ON a.id = p.asset_id
      LEFT JOIN transfers t ON a.id = t.asset_id
      LEFT JOIN expenditures e ON a.id = e.asset_id
      LEFT JOIN assignments as ON a.id = as.asset_id
      WHERE a.base_id = $1
    `;

    const params: any[] = [baseId];

    if (equipmentType) {
      query += ` AND a.type = $2`;
      params.push(equipmentType);
    }

    query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    logger.info('Assets retrieved', { baseId, count: result.rows.length });
    return result.rows;
  } catch (error) {
    logger.error('Error fetching assets', { error: (error as Error).message });
    throw error;
  }
};

export const createAsset = async (
  baseId: string,
  name: string,
  type: string,
  openingBalance: number,
  userId: string,
  ipAddress: string
): Promise<any> => {
  try {
    const result = await pool.query(
      `INSERT INTO assets (base_id, name, type, opening_balance, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [baseId, name, type, openingBalance]
    );

    const asset = result.rows[0];

    await auditLog(userId, 'CREATE', 'ASSET', asset.id, {
      name,
      type,
      openingBalance,
      baseId,
    }, ipAddress);

    logger.info('Asset created', { assetId: asset.id, baseId });
    return asset;
  } catch (error) {
    logger.error('Error creating asset', { error: (error as Error).message });
    throw error;
  }
};

export const recordPurchase = async (
  assetId: string,
  baseId: string,
  quantity: number,
  unitPrice: number,
  userId: string,
  ipAddress: string
): Promise<any> => {
  try {
    const result = await pool.query(
      `INSERT INTO purchases (asset_id, base_id, quantity, unit_price, purchase_date, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [assetId, baseId, quantity, unitPrice]
    );

    const purchase = result.rows[0];

    await auditLog(userId, 'CREATE', 'PURCHASE', purchase.id, {
      assetId,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    }, ipAddress);

    logger.info('Purchase recorded', { purchaseId: purchase.id, quantity });
    return purchase;
  } catch (error) {
    logger.error('Error recording purchase', { error: (error as Error).message });
    throw error;
  }
};

export const recordTransfer = async (
  assetId: string,
  fromBaseId: string,
  toBaseId: string,
  quantity: number,
  userId: string,
  ipAddress: string
): Promise<any> => {
  try {
    const result = await pool.query(
      `INSERT INTO transfers (asset_id, from_base_id, to_base_id, quantity, transfer_date, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [assetId, fromBaseId, toBaseId, quantity]
    );

    const transfer = result.rows[0];

    await auditLog(userId, 'CREATE', 'TRANSFER', transfer.id, {
      assetId,
      fromBaseId,
      toBaseId,
      quantity,
    }, ipAddress);

    logger.info('Transfer recorded', { transferId: transfer.id, quantity });
    return transfer;
  } catch (error) {
    logger.error('Error recording transfer', { error: (error as Error).message });
    throw error;
  }
};

export const recordAssignment = async (
  assetId: string,
  personnelName: string,
  quantity: number,
  userId: string,
  ipAddress: string
): Promise<any> => {
  try {
    const result = await pool.query(
      `INSERT INTO assignments (asset_id, personnel_name, quantity, assignment_date, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [assetId, personnelName, quantity]
    );

    const assignment = result.rows[0];

    await auditLog(userId, 'CREATE', 'ASSIGNMENT', assignment.id, {
      assetId,
      personnelName,
      quantity,
    }, ipAddress);

    logger.info('Assignment recorded', { assignmentId: assignment.id });
    return assignment;
  } catch (error) {
    logger.error('Error recording assignment', { error: (error as Error).message });
    throw error;
  }
};

export const recordExpenditure = async (
  assetId: string,
  quantity: number,
  reason: string,
  userId: string,
  ipAddress: string
): Promise<any> => {
  try {
    const result = await pool.query(
      `INSERT INTO expenditures (asset_id, quantity, reason, expended_date, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [assetId, quantity, reason]
    );

    const expenditure = result.rows[0];

    await auditLog(userId, 'CREATE', 'EXPENDITURE', expenditure.id, {
      assetId,
      quantity,
      reason,
    }, ipAddress);

    logger.info('Expenditure recorded', { expenditureId: expenditure.id });
    return expenditure;
  } catch (error) {
    logger.error('Error recording expenditure', { error: (error as Error).message });
    throw error;
  }
};

export const getClosingBalance = async (
  assetId: string
): Promise<{ openingBalance: number; purchases: number; transfersIn: number; transfersOut: number; assigned: number; expended: number; closingBalance: number }> => {
  try {
    const result = await pool.query(
      `SELECT 
         a.opening_balance,
         COALESCE(SUM(CASE WHEN p.id IS NOT NULL THEN p.quantity ELSE 0 END), 0) as purchases,
         COALESCE(SUM(CASE WHEN t.id IS NOT NULL AND t.to_base_id = a.base_id THEN t.quantity ELSE 0 END), 0) as transfers_in,
         COALESCE(SUM(CASE WHEN t.id IS NOT NULL AND t.from_base_id = a.base_id THEN t.quantity ELSE 0 END), 0) as transfers_out,
         COALESCE(SUM(CASE WHEN as.id IS NOT NULL THEN as.quantity ELSE 0 END), 0) as assigned,
         COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN e.quantity ELSE 0 END), 0) as expended
       FROM assets a
       LEFT JOIN purchases p ON a.id = p.asset_id
       LEFT JOIN transfers t ON a.id = t.asset_id
       LEFT JOIN assignments as ON a.id = as.asset_id
       LEFT JOIN expenditures e ON a.id = e.asset_id
       WHERE a.id = $1
       GROUP BY a.id, a.opening_balance`,
      [assetId]
    );

    if (result.rows.length === 0) {
      throw new Error('Asset not found');
    }

    const row = result.rows[0];
    const closingBalance = 
      row.opening_balance + 
      row.purchases + 
      row.transfers_in - 
      row.transfers_out - 
      row.assigned - 
      row.expended;

    return {
      openingBalance: row.opening_balance,
      purchases: row.purchases,
      transfersIn: row.transfers_in,
      transfersOut: row.transfers_out,
      assigned: row.assigned,
      expended: row.expended,
      closingBalance,
    };
  } catch (error) {
    logger.error('Error calculating closing balance', { error: (error as Error).message });
    throw error;
  }
};
