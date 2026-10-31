import express from 'express';
import {
  getDashboardMetrics,
  getUsers,
  createUser,
  getUserDetails,
  getStores,
  createStore,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  validateCreateUserRequest,
  validateCreateStoreRequest,
} from '../middleware/validators.js';

const router = express.Router();

// Require valid authentication and ADMIN role for all routes in this file
router.use(authenticateToken, requireRole('ADMIN'));

// Dashboard stats
router.get('/metrics', getDashboardMetrics);

// Users management
router.get('/users', getUsers);
router.post('/users', validateCreateUserRequest, createUser);
router.get('/users/:id', getUserDetails);

// Stores management
router.get('/stores', getStores);
router.post('/stores', validateCreateStoreRequest, createStore);

export default router;
