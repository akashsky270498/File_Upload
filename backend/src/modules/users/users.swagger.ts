/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Retrieve user profile details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user profile name, avatar image file, or avatar URL
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar profile image file (PNG, JPG, WEBP)
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               avatarUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1534528741775-53994a69daeb
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export {};
