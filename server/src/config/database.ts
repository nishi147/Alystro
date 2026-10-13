import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './index.js';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    if (config.mongoUri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch {
        // Fallback gracefully if setServers is unavailable
      }
    }
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[Database] MongoDB connection closed');
}
