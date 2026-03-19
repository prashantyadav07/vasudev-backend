import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';
import {
  uploadImage,
  getImages,
  deleteImage,
  getImageById,
  updateImageTitle
} from '../controllers/galleryController.js';

const router = express.Router();

/**
 * POST /api/gallery/upload
 * Upload image to Cloudinary and save to MongoDB
 * Protected: Admin only
 * Middleware: upload.single('image')
 */
router.post(
  '/upload',
  authenticateAdmin,
  upload.single('image'),
  uploadImage
);

/**
 * GET /api/gallery
 * Get all gallery images
 * Public endpoint (no authentication required)
 */
router.get('/', getImages);

/**
 * GET /api/gallery/:id
 * Get single image by ID
 * Public endpoint
 */
router.get('/:id', getImageById);

/**
 * DELETE /api/gallery/:id
 * Delete image from gallery (admin only)
 * Protected: Admin only
 * Deletes from both Cloudinary and MongoDB
 */
router.delete(
  '/:id',
  authenticateAdmin,
  deleteImage
);

/**
 * PUT /api/gallery/:id
 * Update image title (admin only)
 * Protected: Admin only
 */
router.put(
  '/:id',
  authenticateAdmin,
  updateImageTitle
);

export default router;
