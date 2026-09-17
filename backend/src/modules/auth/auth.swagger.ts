/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *         password:
 *           type: string
 *           example: Password123!
 *         firstName:
 *           type: string
 *           example: Alex
 *         lastName:
 *           type: string
 *           example: Mercer
 *         mobileNumber:
 *           type: string
 *           example: "+14155552671"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *         password:
 *           type: string
 *           example: Password123!
 *     RequestOtpInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *     VerifyOtpInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *         otp:
 *           type: string
 *           example: "123456"
 *     RefreshTokenInput:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           example: alex@example.com
 *         otp:
 *           type: string
 *           example: "123456"
 *         newPassword:
 *           type: string
 *           example: NewSecurePass123!
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: CurrentPass123!
 *         newPassword:
 *           type: string
 *           example: BrandNewPass123!
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new User account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or Mobile number already exists
 * 
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with Email and Password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT Access Token and Refresh Token
 *       401:
 *         description: Invalid credentials or account blocked
 * 
 * /api/v1/auth/request-login-otp:
 *   post:
 *     summary: Request 6-digit OTP for Email Login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestOtpInput'
 *     responses:
 *       200:
 *         description: OTP generated and sent
 *       404:
 *         description: User not found
 * 
 * /api/v1/auth/verify-login-otp:
 *   post:
 *     summary: Verify 6-digit Email Login OTP
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpInput'
 *     responses:
 *       200:
 *         description: OTP verified, returns JWT Access Token and Refresh Token
 *       400:
 *         description: Invalid or expired OTP
 * 
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh Tokens (Refresh Token Rotation)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Brand new Access Token and Refresh Token pair issued
 *       401:
 *         description: Refresh token revoked or invalid
 * 
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and revoke Refresh Token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Refresh token revoked successfully
 * 
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request Password Reset OTP via Email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email if account exists
 * 
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset Password using OTP code
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successfully and all active sessions revoked
 *       400:
 *         description: Invalid/Expired OTP or weak new password
 * 
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change Password for Authenticated User
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully and all active sessions revoked
 *       401:
 *         description: Unauthorized - missing token or incorrect current password
 *       400:
 *         description: Validation error or new password matches current password
 * */
