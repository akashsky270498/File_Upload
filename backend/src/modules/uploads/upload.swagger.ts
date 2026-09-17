/**
 * @openapi
 * components:
 *   schemas:
 *     MediaFileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 40bc6ea6-8f04-49ea-88f8-cd0854b53df2
 *         userId:
 *           type: string
 *           example: a2352c07-ae56-4076-acd5-dd15136e4cdd
 *         title:
 *           type: string
 *           example: Virat Kohli Portrait
 *         description:
 *           type: string
 *           example: High resolution media upload
 *         fileType:
 *           type: string
 *           example: POST_MEDIA
 *         mimeType:
 *           type: string
 *           example: image/png
 *         size:
 *           type: number
 *           example: 2458900
 *         cloudinaryUrl:
 *           type: string
 *           example: https://res.cloudinary.com/demo/image/upload/v12345/posts/virat.png
 *         cloudinaryPublicId:
 *           type: string
 *           example: posts/virat
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["virat", "cricket", "rcb"]
 *         viewsCount:
 *           type: number
 *           example: 12
 *         createdAt:
 *           type: string
 *           example: 2026-09-17T12:00:00.000Z
 */

/**
 * @openapi
 * /api/v1/uploads:
 *   post:
 *     summary: Single Media Upload API (Profile, Cover, Post Media, Documents, Audio, Video)
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Binary file buffer (Image, PDF, Video, Audio)
 *               uploadType:
 *                 type: string
 *                 enum: [PROFILE_IMAGE, COVER_IMAGE, POST_MEDIA, DOCUMENT, AUDIO, VIDEO]
 *                 example: POST_MEDIA
 *               title:
 *                 type: string
 *                 example: Virat Kohli Portrait
 *               description:
 *                 type: string
 *                 example: High resolution match image
 *               tags:
 *                 type: string
 *                 example: "virat,cricket,rcb"
 *     responses:
 *       201:
 *         description: Media asset uploaded to Cloudinary and database record created successfully
 *       400:
 *         description: Invalid MIME type, file size limit exceeded, or missing file
 *       401:
 *         description: Unauthorized - Access token missing or invalid
 *
 * /api/v1/uploads/batch:
 *   post:
 *     summary: Batch Media Upload API (Up to 5 files simultaneously)
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
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of up to 5 binary file buffers
 *               uploadType:
 *                 type: string
 *                 enum: [PROFILE_IMAGE, COVER_IMAGE, POST_MEDIA, DOCUMENT, AUDIO, VIDEO]
 *                 example: POST_MEDIA
 *               title:
 *                 type: string
 *                 example: Batch Upload Album
 *               description:
 *                 type: string
 *                 example: Multiple media files uploaded in parallel
 *               tags:
 *                 type: string
 *                 example: "batch,album,sports"
 *     responses:
 *       201:
 *         description: Batch files uploaded successfully
 *       400:
 *         description: Exceeded 5 file batch limit or invalid file payload
 *       401:
 *         description: Unauthorized
 *
 * /api/v1/uploads/{id}:
 *   delete:
 *     summary: Delete Media Asset (Removes from PostgreSQL, Cloudinary, and Elasticsearch)
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File UUID to delete
 *     responses:
 *       200:
 *         description: Media asset deleted successfully across all systems
 *       403:
 *         description: Forbidden - You can only delete your own uploaded files
 *       404:
 *         description: Media asset not found
 *
 * /api/v1/uploads/{id}/view:
 *   post:
 *     summary: Increment File View Count
 *     tags:
 *       - Uploads
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File UUID
 *     responses:
 *       200:
 *         description: View counter incremented successfully
 *       404:
 *         description: File not found
 */
export {};
