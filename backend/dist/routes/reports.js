"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../config/logger"));
const router = (0, express_1.Router)();
// Get audit logs
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { user_id, action, resource_type, limit = 100, offset = 0 } = req.query;
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];
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
        const result = await database_1.default.query(query, params);
        res.json(result.rows);
    }
    catch (error) {
        logger_1.default.error('Error fetching audit logs', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Get summary statistics
router.get('/summary/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const { base_id } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (base_id) {
            whereClause += ` AND a.base_id = $${params.length + 1}`;
            params.push(base_id);
        }
        const result = await database_1.default.query(`
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
      `, params);
        res.json(result.rows[0]);
    }
    catch (error) {
        logger_1.default.error('Error fetching statistics', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
