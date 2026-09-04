import { Router } from 'express';
import { userController } from './users.controller';
import { authGuard } from '../../common/middlewares/authGuard';
import { uploadMiddleware } from '../../common/middlewares/upload';
import './users.swagger';

const router = Router();

router.get('/profile', authGuard, userController.getProfile);
router.put(
  '/profile',
  authGuard,
  uploadMiddleware.single('avatar'),
  userController.updateProfile
);

export default router;
