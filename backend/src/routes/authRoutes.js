import express from 'express';
import { register, login, getMe, updatePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateSignupRequest,
  validatePasswordUpdateRequest,
} from '../middleware/validators.js';

const router = express.Router();

// Public Routes
router.post('/register', validateSignupRequest, register);
router.post('/login', login);

// Authenticated Routes
router.get('/me', authenticateToken, getMe);
router.patch('/change-password', authenticateToken, validatePasswordUpdateRequest, updatePassword);

export default router;
