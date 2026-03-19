import jwt from 'jsonwebtoken';
import tokenBlacklist from '../utils/tokenBlacklist.js';

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer <token>"
 */
const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Verify JWT token with error handling
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Core authentication middleware
 * Verifies JWT token and attaches decoded user to req.user
 * Also checks if token is blacklisted (logged out)
 * Returns 401 if token is missing or invalid
 */
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please login again.'
      });
    }

    // Verify token
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // Attach decoded user to request
    req.user = decoded;
    req.token = token; // Store original token for logout
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

/**
 * Production-ready admin check middleware
 * Must be used AFTER authenticate middleware
 * Returns 403 if user is not admin
 */
export const requireAdmin = (req, res, next) => {
  try {
    // Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();

  } catch (error) {
    console.error('Admin check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Combined middleware for authenticated + admin role check
 * Use this when you want both token validation and admin role in one middleware
 */
export const authenticateAdmin = [authenticate, requireAdmin];

/**
 * Error handler middleware for global error catching
 * Should be registered last in the app
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }

  // Default error response
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

