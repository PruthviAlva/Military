"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBaseAccess = exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../config/logger"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.auth = decoded;
        logger_1.default.info('Authentication successful', { userId: decoded.userId });
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication failed', { error: error.message });
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!roles.includes(req.auth.role)) {
            logger_1.default.warn('Unauthorized access attempt', {
                userId: req.auth.userId,
                requiredRoles: roles,
                userRole: req.auth.role,
            });
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireBaseAccess = (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const requestedBaseId = req.query.base_id || req.params.base_id || req.body.base_id;
    if (req.auth.role === 'admin') {
        return next();
    }
    if (req.auth.role === 'base_commander' && req.auth.baseId !== requestedBaseId) {
        logger_1.default.warn('Base access denied', {
            userId: req.auth.userId,
            requestedBase: requestedBaseId,
            userBase: req.auth.baseId,
        });
        return res.status(403).json({ error: 'Access denied to this base' });
    }
    next();
};
exports.requireBaseAccess = requireBaseAccess;
