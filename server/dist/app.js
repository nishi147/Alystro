"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_js_1 = require("./config/index.js");
const index_js_2 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
exports.app = (0, express_1.default)();
// Security HTTP headers
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS configuration — supports multiple origins via comma-separated CLIENT_URL env var
const allowedOrigins = (index_js_1.config.clientUrl || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .concat(['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173']);
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // In production allow *.vercel.app subdomains
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: index_js_1.config.rateLimitWindowMs,
    max: index_js_1.config.rateLimitMaxRequests,
    message: {
        success: false,
        message: 'Too many requests from this IP address. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.app.use('/api', limiter);
// Request parsing
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
exports.app.use((0, cookie_parser_1.default)(index_js_1.config.cookieSecret));
if (index_js_1.config.nodeEnv !== 'test') {
    exports.app.use((0, morgan_1.default)('dev'));
}
// Health Check
exports.app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'alystro-api-server',
    });
});
// Primary API v1 Router
exports.app.use('/api/v1', index_js_2.default);
// Centralized Error Handling
exports.app.use(errorHandler_js_1.errorHandler);
