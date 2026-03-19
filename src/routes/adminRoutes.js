import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Protected admin dashboard route
 * GET /api/admin/dashboard
 * 
 * Returns:
 * - Welcome message
 * - Current user information (from JWT)
 * - Admin access confirmation
 */
router.get('/dashboard', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    user: {
      email: req.user.email,
      role: req.user.role,
      issuedAt: new Date(req.user.iat * 1000),
      expiresAt: new Date(req.user.exp * 1000),
      tokenIssuer: req.user.iss,
      accessLevel: 'ADMIN'
    },
    dashboard: {
      title: 'Admin Control Panel',
      permissions: ['view_all', 'create', 'edit', 'delete'],
      lastAccess: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Protected system information route
 * GET /api/admin/system-info
 */
router.get('/system-info', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'System Information',
    admin: req.user.email,
    systemInfo: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      platform: process.platform,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Protected resource deletion route
 * DELETE /api/admin/resources/:id
 */
router.delete('/resources/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    message: `Resource ${id} deleted successfully`,
    deletedBy: req.user.email,
    resource: {
      id,
      deletedAt: new Date().toISOString(),
      deletedByRole: req.user.role
    }
  });
});

/**
 * Protected admin statistics route
 * GET /api/admin/stats
 */
router.get('/stats', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Statistics',
    admin: req.user.email,
    stats: {
      totalUsers: 0,
      totalResources: 0,
      lastLogin: new Date().toISOString(),
      serverUptime: process.uptime(),
      activeAdmins: 1
    }
  });
});

export default router;
