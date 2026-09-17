import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticateJwt } from '../../common/middleware/auth';
import { uploadMiddleware } from '../../common/middleware/upload.middleware';
import './upload.swagger';

const router = Router();

// Unified Upload API: POST /api/v1/uploads
router.post(
  '/',
  authenticateJwt,
  uploadMiddleware.single('file'),
  uploadController.upload
);

export default router;
