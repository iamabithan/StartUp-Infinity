import mongoose from 'mongoose';
import { log } from './vite';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startupInfinity';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    log('MongoDB connected successfully');
  } catch (err) {
    log(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
}

// Export mongoose for model definitions
export { mongoose };
