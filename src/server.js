import 'dotenv/config'; // Load environment variables first
// Verify Cloudinary configuration is available
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠ Cloudinary environment variables missing');
} else {
  console.log('✓ Cloudinary configured successfully');
}

import app from './app.js';
import connectDB from './config/database.js';

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database and start server
const startServer = async () => {
  try {
    // Print startup banner
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Starting Vasudev Website Backend');
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 URL: http://localhost:${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log('='.repeat(60));
      
      // Print useful endpoints
      console.log('\n📡 Available endpoints:');
      console.log(`   • Health Check: GET  http://localhost:${PORT}/api/health`);
      console.log(`   • Login:        POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   • Logout:       POST http://localhost:${PORT}/api/auth/logout`);
      console.log(`   • Dashboard:    GET  http://localhost:${PORT}/api/admin/dashboard`);
      console.log(`   • System Info:  GET  http://localhost:${PORT}/api/admin/system-info`);
      console.log('\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⏹️  SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⏹️  SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(`   Error: ${error.message}`);
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
};

// Start the application
startServer();
