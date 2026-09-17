/**
 * @openapi
 * /api/v1/search:
 *   get:
 *     summary: Full-Text Search Files (Elasticsearch)
 *     description: Perform boosted full-text search across title, description, and tags with fuzzy matching, facets, and pagination.
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query keyword (matches title, description, tags with autocomplete and fuzzy matching)
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [PROFILE_IMAGE, COVER_IMAGE, POST_MEDIA, DOCUMENT, AUDIO, VIDEO]
 *         description: Filter search results by FileType
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by (e.g. "nature,travel")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results with pagination and aggregated facets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                     facets:
 *                       type: object
 *                       properties:
 *                         fileTypeCounts:
 *                           type: object
 *                         topTags:
 *                           type: object
 */
