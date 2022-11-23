export const config = () => ({
  port: parseInt(process.env.PORT, 10) || 9999,
  baseUrl: process.env.BASE_URL || 'http://localhost',
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/nestjs',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  hostUrl: process.env.HOST_URL || 'http://localhost:9999',
  mail: {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.MAIL_AUTH_USER || 'user',
      pass: process.env.MAIL_AUTH_PASS || 'pass',
    },
    defaults: {
      from: process.env.MAIL_DEFAULTS_FROM || 'user',
    },
  },
});
