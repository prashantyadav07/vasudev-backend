import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import {
    getCategories,
    createCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Protected routes (Admin only)
router.post('/', authenticateAdmin, createCategory);
router.delete('/:id', authenticateAdmin, deleteCategory);

export default router;
