import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration — supports multiple origins via comma-separated CLIENT_URL env var
const explicitOrigins = [
  'https://alystro-4mln.vercel.app',
  'https://alystro.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

const envOrigins = (config.clientUrl || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...explicitOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, serverless internal, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In production allow any valid Vercel preview branch deployment
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Handlers (mounted at /health, /api/health, and /api/v1/health)
const healthCheckHandler = (_req: express.Request, res: express.Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    service: 'alystro-api-server',
    uptime: Math.floor(process.uptime()),
  });
};

// Root and status landing handlers
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'alystro-api-server',
    version: '1.0.0',
    documentation: '/api/v1',
    health: '/health',
  });
});

app.get('/api', (_req, res) => {
  res.json({
    status: 'online',
    service: 'alystro-api-server',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);

// Primary API v1 Router
app.use('/api/v1', apiRouter);

// Centralized Error Handling
app.use(errorHandler);
