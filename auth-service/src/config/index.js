require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
