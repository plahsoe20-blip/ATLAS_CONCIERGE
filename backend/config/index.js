export default {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'atlas_super_secret_key_change_in_production',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // Database Configuration (Ready for DynamoDB)
  database: {
    type: 'memory', // 'memory' for local, 'dynamodb' for production
    region: process.env.AWS_REGION || 'us-east-1',
    tables: {
      users: 'atlas-users',
      bookings: 'atlas-bookings',
      drivers: 'atlas-drivers',
      vehicles: 'atlas-vehicles',
      operators: 'atlas-operators',
      quotes: 'atlas-quotes',
      transactions: 'atlas-transactions'
    }
  },

  // Cognito Configuration (for AWS deployment)
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    region: process.env.AWS_REGION || 'us-east-1'
  },

  // Payment Configuration (Square)
  payment: {
    squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
    squareLocationId: process.env.SQUARE_LOCATION_ID,
    squareEnvironment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
  },

  // Gemini AI Configuration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Server
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  }
};
