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
  AZURE_CONNECTION_STRING: Joi.string().required(),
  AZURE_CONTAINER_NAME: Joi.string().default('containerName'),
  AZURE_ACCOUNT_NAME: Joi.string().required(),
  AZURE_CONTAINER_URL: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
});
