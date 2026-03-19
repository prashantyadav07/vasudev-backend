// Placeholder for routes
import express from 'express';

const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'API routes' });
});

export default router;
