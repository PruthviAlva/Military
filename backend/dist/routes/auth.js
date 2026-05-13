"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authService_1 = require("../services/authService");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const result = await (0, authService_1.authenticateUser)(email, password);
        if (!result) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, baseId } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role required' });
        }
        const user = await (0, authService_1.createUser)(email, password, role, baseId);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        res.json({ user: req.auth });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
