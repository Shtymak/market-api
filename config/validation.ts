import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(9999),
  BASE_URL: Joi.string().default('http://localhost'),
  DATABASE_URI: Joi.string().default('mongodb://localhost:27017/nestjs'),
  JWT_SECRET: Joi.string().default('secret'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  HOST_URL: Joi.string().default('http://localhost:9999'),
  MAIL_HOST: Joi.string().default('smtp.ethereal.email'),
  MAIL_PORT: Joi.number().default(587),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_AUTH_USER: Joi.string().default('user'),
  MAIL_AUTH_PASS: Joi.string().default('pass'),
  MAIL_DEFAULTS_FROM: Joi.string().default('user'),
});
