import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(9999),
  baseUrl: Joi.string().default('http://localhost'),
});
