/**
 * @openapi
 * /api/v1/users/profile:
 *   put:
 *     summary: Update Authenticated User Profile Information & Avatar Image
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Virat
 *               lastName:
 *                 type: string
 *                 example: Kohli
 *               mobileNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               profileImage:
 *                 type: string
 *                 example: https://res.cloudinary.com/demo/image/upload/v12345/avatars/virat.jpg
 *                 description: Direct avatar image URL if choosing preset avatar
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Binary image file buffer for custom profile avatar upload
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Virat
 *               lastName:
 *                 type: string
 *                 example: Kohli
 *               mobileNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               profileImage:
 *                 type: string
 *                 example: https://res.cloudinary.com/demo/image/upload/v12345/avatars/virat.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized - Access token missing or invalid
 *       409:
 *         description: Conflict - Mobile number is already associated with another account
 */
export {};
