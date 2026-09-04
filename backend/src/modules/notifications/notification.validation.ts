import Joi from 'joi';

export const notificationStatusQuerySchema = Joi.object({
  verbose: Joi.boolean().optional(),
});
