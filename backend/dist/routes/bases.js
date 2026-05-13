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
// Get all bases
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM bases ORDER BY name');
        res.json(result.rows);
    }
    catch (error) {
        logger_1.default.error('Error fetching bases', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Get base by ID
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM bases WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        logger_1.default.error('Error fetching base', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Create base (admin only)
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({ error: 'Name and location required' });
        }
        const result = await database_1.default.query('INSERT INTO bases (name, location, created_at) VALUES ($1, $2, NOW()) RETURNING *', [name, location]);
        logger_1.default.info('Base created', { baseId: result.rows[0].id, name });
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        logger_1.default.error('Error creating base', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
