import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from './auth.validation';
import './auth.swagger';

const router = Router();

// REST Command Endpoints
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

router.post(
  '/request-login-otp',
  validateRequest(requestOtpSchema),
  authController.requestLoginOtp
);

router.post(
  '/verify-login-otp',
  validateRequest(verifyOtpSchema),
  authController.verifyLoginOtp
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshTokens
);

router.post(
  '/logout',
  validateRequest(refreshTokenSchema),
  authController.logout
);

export default router;
