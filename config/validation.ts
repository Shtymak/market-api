import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(9999),
  BASE_URL: Joi.string().default('http://localhost'),
  DATABASE_URI: Joi.string().default('mongodb://localhost:27017/nestjs'),
  JWT_SECRET: Joi.string().default('secret'),
});
