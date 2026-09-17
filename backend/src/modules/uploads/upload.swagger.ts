/**
 * @openapi
 * /api/v1/uploads:
 *   post:
 *     summary: Unified Multimedia Upload API (Profile, Cover, Post Media, Documents, Audio, Video)
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - uploadType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Binary file buffer (Images, PDF, Video, Audio)
 *               uploadType:
 *                 type: string
 *                 enum: [PROFILE_IMAGE, COVER_IMAGE, POST_MEDIA, DOCUMENT, AUDIO, VIDEO]
 *                 example: PROFILE_IMAGE
 *               title:
 *                 type: string
 *                 example: My New Profile Avatar
 *               description:
 *                 type: string
 *                 example: Uploaded via Unified Upload API
 *               tags:
 *                 type: string
 *                 example: "avatar,profile,hd"
 *     responses:
 *       201:
 *         description: Media uploaded to Cloudinary & PostgreSQL record created successfully
 *       400:
 *         description: Invalid MIME type, file size exceeded, or missing required fields
 *       401:
 *         description: Unauthorized - Bearer access token missing or invalid
 */
