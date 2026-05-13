"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const assetService_1 = require("../services/assetService");
const router = (0, express_1.Router)();
// Get assets for a base
router.get('/assets', auth_1.authMiddleware, auth_1.requireBaseAccess, async (req, res) => {
    try {
        const { base_id, equipment_type } = req.query;
        const assets = await (0, assetService_1.getAssetsForBase)(base_id, equipment_type);
        res.json(assets);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create asset
router.post('/assets', auth_1.authMiddleware, (0, auth_1.requireRole)('admin', 'base_commander'), async (req, res) => {
    try {
        const { base_id, name, type, opening_balance } = req.body;
        const asset = await (0, assetService_1.createAsset)(base_id, name, type, opening_balance, req.auth.userId, req.ip || '');
        res.status(201).json(asset);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get closing balance for asset
router.get('/assets/:asset_id/balance', auth_1.authMiddleware, async (req, res) => {
    try {
        const balance = await (0, assetService_1.getClosingBalance)(req.params.asset_id);
        res.json(balance);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record purchase
router.post('/purchases', auth_1.authMiddleware, (0, auth_1.requireRole)('admin', 'base_commander', 'logistics_officer'), async (req, res) => {
    try {
        const { asset_id, base_id, quantity, unit_price } = req.body;
        const purchase = await (0, assetService_1.recordPurchase)(asset_id, base_id, quantity, unit_price, req.auth.userId, req.ip || '');
        res.status(201).json(purchase);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record transfer
router.post('/transfers', auth_1.authMiddleware, (0, auth_1.requireRole)('admin', 'base_commander', 'logistics_officer'), async (req, res) => {
    try {
        const { asset_id, from_base_id, to_base_id, quantity } = req.body;
        const transfer = await (0, assetService_1.recordTransfer)(asset_id, from_base_id, to_base_id, quantity, req.auth.userId, req.ip || '');
        res.status(201).json(transfer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record assignment
router.post('/assignments', auth_1.authMiddleware, (0, auth_1.requireRole)('admin', 'base_commander'), async (req, res) => {
    try {
        const { asset_id, personnel_name, quantity } = req.body;
        const assignment = await (0, assetService_1.recordAssignment)(asset_id, personnel_name, quantity, req.auth.userId, req.ip || '');
        res.status(201).json(assignment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record expenditure
router.post('/expenditures', auth_1.authMiddleware, (0, auth_1.requireRole)('admin', 'base_commander'), async (req, res) => {
    try {
        const { asset_id, quantity, reason } = req.body;
        const expenditure = await (0, assetService_1.recordExpenditure)(asset_id, quantity, reason, req.auth.userId, req.ip || '');
        res.status(201).json(expenditure);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
