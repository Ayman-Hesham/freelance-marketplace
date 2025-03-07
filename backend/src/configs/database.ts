import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Freelance-marketplace';

interface DatabaseConfig {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const database: DatabaseConfig = {
  connect: async (): Promise<void> => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB Atlas connection error:', error);
    }
  },

  disconnect: async (): Promise<void> => {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
      process.exit(1);
    }
  },
};

// Configure mongoose settings
mongoose.set('strictQuery', true);

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await database.disconnect();
  process.exit(0);
}); 