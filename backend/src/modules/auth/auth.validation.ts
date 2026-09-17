import Joi from 'joi';

export const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    'any.required': 'Password is required',
  });

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: passwordSchema,
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  mobileNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required().messages({
    'any.required': 'Mobile number is required',
    'string.pattern.base': 'Mobile number must include valid country code format (e.g. +919876543210)',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const requestOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP code must be 6 digits',
    'any.required': 'OTP is required',
  }),
  newPassword: passwordSchema,
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordSchema,
});
