// ==========================================
// ✅ JOI REQUEST VALIDATION MIDDLEWARE
// ==========================================
// Ye middleware Incoming HTTP Request Body ko Joi Schema se validate karta hai.

import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationError } from '../errors/app-error';

export const validateRequest = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Unknown payload fields ko automatically sanitize kar deta hai
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new ValidationError(errorMessage));
    }

    req.body = value;
    next();
  };
};

