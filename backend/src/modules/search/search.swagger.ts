/**
 * @openapi
 * /api/v1/search:
 *   post:
 *     summary: Advanced Full-Text Search & Multi-Facet Filtering (Elasticsearch with PostgreSQL Fallback)
 *     tags:
 *       - Search & Discovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 example: virat
 *                 description: Full-text search term for title, tags, description, or filename
 *               fileType:
 *                 type: string
 *                 enum: [all, image, pdf, video, audio, POST_MEDIA, DOCUMENT]
 *                 example: all
 *                 description: Filter results by media category
 *               tags:
 *                 type: string
 *                 example: virat,cricket
 *                 description: Comma-separated tag filter
 *               sortBy:
 *                 type: string
 *                 enum: [relevance, views, date, size]
 *                 example: relevance
 *                 description: Ordering criteria
 *               sortOrder:
 *                 type: string
 *                 enum: [asc, desc]
 *                 example: desc
 *                 description: Sort direction
 *               page:
 *                 type: integer
 *                 example: 1
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 example: 12
 *                 description: Page size limit
 *     responses:
 *       200:
 *         description: Search executed successfully, returns matched files and facet aggregations
 *       500:
 *         description: Search processing error
 */
export {};
