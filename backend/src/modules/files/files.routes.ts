import { Router } from 'express';
import { fileController } from './files.controller';
import { authGuard } from '../../common/middlewares/authGuard';
import { uploadMiddleware } from '../../common/middlewares/upload';
import { validate } from '../../common/middlewares/validate';
import { uploadFileMetadataSchema, searchFilesQuerySchema } from './files.validation';
import './files.swagger';

const router = Router();

router.post(
  '/upload',
  authGuard,
  uploadMiddleware.single('file'),
  validate(uploadFileMetadataSchema),
  fileController.uploadFile
);

router.get(
  '/search',
  authGuard,
  validate(searchFilesQuerySchema, 'query'),
  fileController.searchFiles
);

router.get('/:id', authGuard, fileController.getFileById);
router.delete('/:id', authGuard, fileController.deleteFile);

export default router;
