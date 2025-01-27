import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URI!);

    if (connection.readyState === 1) {
      console.log('MongoDB connected');
      return;
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};