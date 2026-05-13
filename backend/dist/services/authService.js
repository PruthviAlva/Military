"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.authenticateUser = exports.createUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../config/logger"));
const createUser = async (email, password, role, baseId) => {
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const result = await database_1.default.query(`INSERT INTO users (email, password, role, base_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, role, base_id`, [email, hashedPassword, role, baseId || null]);
        logger_1.default.info('User created', { email, role });
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error('Error creating user', { error: error.message, email });
        throw error;
    }
};
exports.createUser = createUser;
const authenticateUser = async (email, password) => {
    try {
        const result = await database_1.default.query('SELECT id, email, password, role, base_id FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const user = result.rows[0];
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return null;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            baseId: user.base_id,
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        logger_1.default.info('User authenticated', { email });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                baseId: user.base_id,
            },
        };
    }
    catch (error) {
        logger_1.default.error('Authentication error', { error: error.message });
        throw error;
    }
};
exports.authenticateUser = authenticateUser;
const getUserById = async (userId) => {
    try {
        const result = await database_1.default.query('SELECT id, email, role, base_id FROM users WHERE id = $1', [userId]);
        return result.rows[0] || null;
    }
    catch (error) {
        logger_1.default.error('Error fetching user', { error: error.message });
        throw error;
    }
};
exports.getUserById = getUserById;
