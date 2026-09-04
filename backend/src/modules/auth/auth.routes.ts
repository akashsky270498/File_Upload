import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../common/middlewares/validate';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from './auth.validation';
import { authGuard } from '../../common/middlewares/authGuard';
import './auth.swagger';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authGuard, authController.logout);
router.get('/me', authGuard, authController.getMe);
router.post('/change-password', authGuard, validate(changePasswordSchema), authController.changePassword);

export default router;
