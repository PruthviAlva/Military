"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClosingBalance = exports.recordExpenditure = exports.recordAssignment = exports.recordTransfer = exports.recordPurchase = exports.createAsset = exports.getAssetsForBase = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../config/logger"));
const auditService_1 = require("./auditService");
const getAssetsForBase = async (baseId, equipmentType) => {
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
        const params = [baseId];
        if (equipmentType) {
            query += ` AND a.type = $2`;
            params.push(equipmentType);
        }
        query += ` GROUP BY a.id ORDER BY a.created_at DESC`;
        const result = await database_1.default.query(query, params);
        logger_1.default.info('Assets retrieved', { baseId, count: result.rows.length });
        return result.rows;
    }
    catch (error) {
        logger_1.default.error('Error fetching assets', { error: error.message });
        throw error;
    }
};
exports.getAssetsForBase = getAssetsForBase;
const createAsset = async (baseId, name, type, openingBalance, userId, ipAddress) => {
    try {
        const result = await database_1.default.query(`INSERT INTO assets (base_id, name, type, opening_balance, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`, [baseId, name, type, openingBalance]);
        const asset = result.rows[0];
        await (0, auditService_1.auditLog)(userId, 'CREATE', 'ASSET', asset.id, {
            name,
            type,
            openingBalance,
            baseId,
        }, ipAddress);
        logger_1.default.info('Asset created', { assetId: asset.id, baseId });
        return asset;
    }
    catch (error) {
        logger_1.default.error('Error creating asset', { error: error.message });
        throw error;
    }
};
exports.createAsset = createAsset;
const recordPurchase = async (assetId, baseId, quantity, unitPrice, userId, ipAddress) => {
    try {
        const result = await database_1.default.query(`INSERT INTO purchases (asset_id, base_id, quantity, unit_price, purchase_date, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`, [assetId, baseId, quantity, unitPrice]);
        const purchase = result.rows[0];
        await (0, auditService_1.auditLog)(userId, 'CREATE', 'PURCHASE', purchase.id, {
            assetId,
            quantity,
            unitPrice,
            total: quantity * unitPrice,
        }, ipAddress);
        logger_1.default.info('Purchase recorded', { purchaseId: purchase.id, quantity });
        return purchase;
    }
    catch (error) {
        logger_1.default.error('Error recording purchase', { error: error.message });
        throw error;
    }
};
exports.recordPurchase = recordPurchase;
const recordTransfer = async (assetId, fromBaseId, toBaseId, quantity, userId, ipAddress) => {
    try {
        const result = await database_1.default.query(`INSERT INTO transfers (asset_id, from_base_id, to_base_id, quantity, transfer_date, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`, [assetId, fromBaseId, toBaseId, quantity]);
        const transfer = result.rows[0];
        await (0, auditService_1.auditLog)(userId, 'CREATE', 'TRANSFER', transfer.id, {
            assetId,
            fromBaseId,
            toBaseId,
            quantity,
        }, ipAddress);
        logger_1.default.info('Transfer recorded', { transferId: transfer.id, quantity });
        return transfer;
    }
    catch (error) {
        logger_1.default.error('Error recording transfer', { error: error.message });
        throw error;
    }
};
exports.recordTransfer = recordTransfer;
const recordAssignment = async (assetId, personnelName, quantity, userId, ipAddress) => {
    try {
        const result = await database_1.default.query(`INSERT INTO assignments (asset_id, personnel_name, quantity, assignment_date, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`, [assetId, personnelName, quantity]);
        const assignment = result.rows[0];
        await (0, auditService_1.auditLog)(userId, 'CREATE', 'ASSIGNMENT', assignment.id, {
            assetId,
            personnelName,
            quantity,
        }, ipAddress);
        logger_1.default.info('Assignment recorded', { assignmentId: assignment.id });
        return assignment;
    }
    catch (error) {
        logger_1.default.error('Error recording assignment', { error: error.message });
        throw error;
    }
};
exports.recordAssignment = recordAssignment;
const recordExpenditure = async (assetId, quantity, reason, userId, ipAddress) => {
    try {
        const result = await database_1.default.query(`INSERT INTO expenditures (asset_id, quantity, reason, expended_date, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`, [assetId, quantity, reason]);
        const expenditure = result.rows[0];
        await (0, auditService_1.auditLog)(userId, 'CREATE', 'EXPENDITURE', expenditure.id, {
            assetId,
            quantity,
            reason,
        }, ipAddress);
        logger_1.default.info('Expenditure recorded', { expenditureId: expenditure.id });
        return expenditure;
    }
    catch (error) {
        logger_1.default.error('Error recording expenditure', { error: error.message });
        throw error;
    }
};
exports.recordExpenditure = recordExpenditure;
const getClosingBalance = async (assetId) => {
    try {
        const result = await database_1.default.query(`SELECT 
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
       GROUP BY a.id, a.opening_balance`, [assetId]);
        if (result.rows.length === 0) {
            throw new Error('Asset not found');
        }
        const row = result.rows[0];
        const closingBalance = row.opening_balance +
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
    }
    catch (error) {
        logger_1.default.error('Error calculating closing balance', { error: error.message });
        throw error;
    }
};
exports.getClosingBalance = getClosingBalance;
