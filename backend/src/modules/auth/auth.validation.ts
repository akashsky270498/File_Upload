import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Full name is required.',
    'string.min': 'Full name must be at least 2 characters long.',
    'string.max': 'Full name cannot exceed 50 characters.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Email address is required.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'string.empty': 'Password is required.',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'string.empty': 'Email address is required.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required.',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'New password is required.',
    'string.min': 'New password must be at least 6 characters long.',
  }),
});

