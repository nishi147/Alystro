import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

// Ensure DB is connected (cached across warm invocations)
let isConnected = false;
const ensureDbConnected = async () => {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
};

export default async function handler(req: any, res: any) {
  await ensureDbConnected();
  return app(req, res);
}
