import { Router } from 'express';
import { notificationController } from './notification.controller';
import './notification.swagger';

const router = Router();

router.get('/status', notificationController.getStatus);

export default router;
