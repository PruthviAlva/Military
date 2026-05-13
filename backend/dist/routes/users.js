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
// Get all users (admin only)
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT id, email, role, base_id, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        logger_1.default.error('Error fetching users', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Get user by ID
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.auth.userId;
        const requesterRole = req.auth.role;
        // Users can only view their own profile unless they're admin
        if (requesterRole !== 'admin' && id !== requesterId) {
            return res.status(403).json({ error: 'Cannot view other users profiles' });
        }
        const result = await database_1.default.query('SELECT id, email, role, base_id, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        logger_1.default.error('Error fetching user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Update user (admin only)
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, base_id } = req.body;
        const result = await database_1.default.query('UPDATE users SET role = $1, base_id = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, role, base_id', [role, base_id || null, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        logger_1.default.info('User updated', { userId: id });
        res.json(result.rows[0]);
    }
    catch (error) {
        logger_1.default.error('Error updating user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Delete user (admin only)
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.query('DELETE FROM users WHERE id = $1', [id]);
        logger_1.default.info('User deleted', { userId: id });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
