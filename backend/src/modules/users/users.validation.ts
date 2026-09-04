import Joi from 'joi';

export const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 50 characters.',
  }),
  avatarUrl: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'Avatar URL must be a valid URI.',
  }),
});
