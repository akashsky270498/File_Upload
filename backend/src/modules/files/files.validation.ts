import Joi from 'joi';

export const uploadFileMetadataSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'File title is required.',
    'string.min': 'File title must be at least 2 characters long.',
    'string.max': 'File title cannot exceed 100 characters.',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Description cannot exceed 500 characters.',
  }),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional()
    .messages({
      'alternatives.match': 'Tags must be a string or array of strings.',
    }),
});

export const searchFilesQuerySchema = Joi.object({
  query: Joi.string().allow('').optional(),
  fileType: Joi.string().valid('image', 'video', 'audio', 'pdf', 'all').default('all'),
  sortBy: Joi.string().valid('relevance', 'views', 'date', 'size').default('relevance'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
});
