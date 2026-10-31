import express from 'express';
import { getStoresForUser, rateStore } from '../controllers/storeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Both endpoints require authentication so we know the user's submitted rating
router.get('/', authenticateToken, getStoresForUser);
router.post('/:storeId/rating', authenticateToken, rateStore);

export default router;
