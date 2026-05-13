"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./config/logger"));
const logging_1 = require("./middleware/logging");
const auth_1 = __importDefault(require("./routes/auth"));
const assets_1 = __importDefault(require("./routes/assets"));
const bases_1 = __importDefault(require("./routes/bases"));
const users_1 = __importDefault(require("./routes/users"));
const reports_1 = __importDefault(require("./routes/reports"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logging_1.requestLoggerMiddleware);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/bases', bases_1.default);
app.use('/api/users', users_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api', assets_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use(logging_1.errorHandler);
app.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
exports.default = app;
