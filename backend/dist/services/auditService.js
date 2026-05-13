"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../config/logger"));
const auditLog = async (userId, action, resourceType, resourceId, changes, ipAddress) => {
    try {
        await database_1.default.query(`INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, changes, ip_address, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress]);
        logger_1.default.info('Audit log created', {
            userId,
            action,
            resourceType,
            resourceId,
        });
    }
    catch (error) {
        logger_1.default.error('Failed to create audit log', {
            error: error.message,
            userId,
            action,
        });
    }
};
exports.auditLog = auditLog;
