"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestLoggerMiddleware = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const requestLoggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.default.info('HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.auth?.userId,
            ip: req.ip,
        });
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
const errorHandler = (err, req, res, next) => {
    logger_1.default.error('Request error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        userId: req.auth?.userId,
    });
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
