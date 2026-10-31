import express from 'express';
import { getOwnerDashboard } from '../controllers/ownerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, requireRole('STORE_OWNER'), getOwnerDashboard);

export default router;
