/**
 * Video Routes
 * API endpoints for video management
 */

import express from 'express';
import {
  addVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  updateVideoTitle
} from '../controllers/videoController.js';
import { authenticateAdmin, authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/videos
 * Add a new video (admin only)
 */
router.post('/', authenticateAdmin, addVideo);

/**
 * GET /api/videos
 * Get all videos (public)
 */
router.get('/', getVideos);

/**
 * GET /api/videos/:id
 * Get single video (public)
 */
router.get('/:id', getVideoById);

/**
 * PUT /api/videos/:id
 * Update video title (admin only)
 */
router.put('/:id', authenticateAdmin, updateVideoTitle);

/**
 * DELETE /api/videos/:id
 * Delete a video (admin only)
 */
router.delete('/:id', authenticateAdmin, deleteVideo);

export default router;
