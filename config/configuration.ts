export const config = () => ({
  port: parseInt(process.env.PORT, 10) || 9999,
  baseUrl: process.env.BASE_URL || 'http://localhost',
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/nestjs',
  },
});
