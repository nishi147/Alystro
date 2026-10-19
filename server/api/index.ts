import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

// Ensure DB is connected (cached across warm invocations)
const ensureDbConnected = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }
};

export default async function handler(req: any, res: any) {
  try {
    await ensureDbConnected();
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Handler] Fatal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during initialization.',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
}
