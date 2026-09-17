import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticateJwt } from '../../common/middleware/auth';
import { uploadMiddleware } from '../../common/middleware/upload.middleware';
import './upload.swagger';

const router = Router();

// Unified Single Upload API: POST /api/v1/uploads
router.post(
  '/',
  authenticateJwt,
  uploadMiddleware.single('file'),
  uploadController.upload
);

// Unified Batch Upload API (Up to 5 files): POST /api/v1/uploads/batch
router.post(
  '/batch',
  authenticateJwt,
  uploadMiddleware.array('files', 5),
  uploadController.uploadBatch
);

// Delete Media Asset: DELETE /api/v1/uploads/:id
router.delete('/:id', authenticateJwt, uploadController.delete);

// Increment View Counter: POST /api/v1/uploads/:id/view
router.post('/:id/view', uploadController.incrementView);

export default router;
