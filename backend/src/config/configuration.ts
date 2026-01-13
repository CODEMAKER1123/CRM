export default () => ({
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'field_service_crm',
    ssl: process.env.DATABASE_SSL === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Clerk (Authentication)
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  },

  // QuickBooks
  quickbooks: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
  },

  // CompanyCam
  companycam: {
    apiKey: process.env.COMPANYCAM_API_KEY,
    webhookToken: process.env.COMPANYCAM_WEBHOOK_TOKEN,
  },

  // Email - Transactional (Resend/Postmark)
  email: {
    transactional: {
      provider: process.env.EMAIL_TRANSACTIONAL_PROVIDER || 'resend',
      apiKey: process.env.EMAIL_TRANSACTIONAL_API_KEY,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
    },
    // Marketing (SendGrid)
    marketing: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromAddress: process.env.SENDGRID_FROM_ADDRESS,
    },
  },

  // SMS (Telnyx)
  sms: {
    apiKey: process.env.TELNYX_API_KEY,
    messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID,
    fromNumber: process.env.TELNYX_FROM_NUMBER,
  },

  // Google Maps (for routing)
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },

  // File Storage (Cloudflare R2 / AWS S3)
  storage: {
    provider: process.env.STORAGE_PROVIDER || 's3',
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    endpoint: process.env.STORAGE_ENDPOINT, // For R2
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
});
