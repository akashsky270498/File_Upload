import { Router } from 'express';
import { notificationController } from './notification.controller';
import './notification.swagger';

const router = Router();

router.post('/status', notificationController.getStatus);

export default router;
