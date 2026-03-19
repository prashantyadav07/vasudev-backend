import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler } from './middleware/auth.js';
import requestLogger from './middleware/logger.js';

// Initialize Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

const corsOptions = {
  origin: ['http://localhost:5173','https://vasudev-project.vercel.app/', 'http://127.0.0.1:5173', process.env.CORS_ORIGIN].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use(requestLogger);

// ============================================
// PUBLIC ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Vasudev Website Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      health: '/api/health',
      docs: '/api/docs'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Vasudev Website Backend API',
    version: '1.0.0',
    documentation: 'See project README files',
    baseUrl: 'http://localhost:' + process.env.PORT
  });
});

// ============================================
// PROTECTED ROUTES
// ============================================

// Authentication routes (login, logout, session)
app.use('/api/auth', authRoutes);

// Admin routes (protected)
app.use('/api/admin', adminRoutes);

// Gallery routes (mixed: public GET, protected POST/DELETE)
app.use('/api/gallery', galleryRoutes);

// Video routes (mixed: public GET, protected POST/PUT/DELETE)
app.use('/api/videos', videoRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Not Found Handler
// This should come after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler Middleware
// This must be the last middleware
// Handle all errors from routes and other middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error('[ERROR]', {
    message: err.message,
    status: err.statusCode || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired',
      expiresAt: err.expiredAt,
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Bad request',
      timestamp: new Date().toISOString()
    });
  }

  // Unauthorized errors
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized',
      timestamp: new Date().toISOString()
    });
  }

  // Forbidden errors
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Access denied',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    }),
    timestamp: new Date().toISOString()
  });
});

export default app;
