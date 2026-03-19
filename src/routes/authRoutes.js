import express from 'express';
import { loginAdmin, logoutAdmin, getSessionInfo } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Public endpoint - Login with email and password
 * Returns JWT token
 */
router.post('/login', loginAdmin);

/**
 * POST /api/auth/logout
 * Protected endpoint - Logout and blacklist token
 * Requires valid JWT token in Authorization header
 */
router.post('/logout', authenticate, logoutAdmin);

/**
 * GET /api/auth/session
 * Protected endpoint - Get current session information
 * Requires valid JWT token in Authorization header
 */
router.get('/session', authenticate, getSessionInfo);

export default router;
