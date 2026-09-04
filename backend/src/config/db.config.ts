import mongoose from 'mongoose';
import { env } from './env.config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Database] MongoDB Connection Error: ${errorMessage}`);
    process.exit(1);
  }
};
