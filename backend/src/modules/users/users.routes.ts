import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateJwt } from '../../common/middleware/auth';
import { uploadMiddleware } from '../../common/middleware/upload.middleware';
import './users.swagger';

const router = Router();

/**
 * @route PUT /api/v1/users/profile
 * @desc Update authenticated user profile (supports text JSON & multipart/form-data with avatar upload)
 * @access Private
 */
router.put(
  '/profile',
  authenticateJwt,
  uploadMiddleware.single('avatar'),
  usersController.updateProfile
);

export default router;
