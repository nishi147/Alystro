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
  await ensureDbConnected();
  return app(req, res);
}
