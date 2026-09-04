import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { CustomValidationError } from '../errors/customErrors';
import { ValidationErrorDetail } from '../types/apiResponse.interface';

export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails: ValidationErrorDetail[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return next(new CustomValidationError('Validation failed. Please check your inputs.', errorDetails));
    }

    req[property] = value;
    return next();
  };
};
