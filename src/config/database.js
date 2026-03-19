// Database Configuration
import mongoose from 'mongoose';

let isConnected = false; // Track connection globally for serverless

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vasudev_website';

    const conn = await mongoose.connect(mongoURI, {
      bufferCommands: false, // Critical for Vercel Serverless
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = conn.connection.readyState === 1;
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('SSL')) {
      console.error('\n⚠️  SSL/TLS Connection Error:');
      console.error('1. Check if credentials in .env are correct');
      console.error('2. Verify IP address is whitelisted in MongoDB Atlas');
      console.error('3. Try connection string format: mongodb+srv://user:password@cluster.mongodb.net/dbname');
    }
    
    throw error; // Let Express middleware catch it instead of crashing process
  }
};


export default connectDB;
