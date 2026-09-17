import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { authenticateJwt } from '../../common/middleware/auth';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
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

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.get(
  '/me',
  authenticateJwt,
  authController.getMe
);

router.post(
  '/change-password',
  authenticateJwt,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

export default router;
