export interface SecurityConfig {
  rateLimiting: {
    short: { ttl: number; limit: number };
    medium: { ttl: number; limit: number };
    long: { ttl: number; limit: number };
    auth: { ttl: number; limit: number };
  };
  cors: {
    allowedOrigins: string[];
    credentials: boolean;
  };
}

export const securityConfig = (): SecurityConfig => ({
  rateLimiting: {
    short: {
      ttl: Number(process.env.THROTTLE_SHORT_TTL) || 1000, // 1 second
      limit: Number(process.env.THROTTLE_SHORT_LIMIT) || 10, // 10 requests per second
    },
    medium: {
      ttl: Number(process.env.THROTTLE_MEDIUM_TTL) || 10000, // 10 seconds
      limit: Number(process.env.THROTTLE_MEDIUM_LIMIT) || 50, // 50 requests per 10 seconds
    },
    long: {
      ttl: Number(process.env.THROTTLE_LONG_TTL) || 60000, // 1 minute
      limit: Number(process.env.THROTTLE_LONG_LIMIT) || 200, // 200 requests per minute
    },
    auth: {
      ttl: Number(process.env.THROTTLE_AUTH_TTL) || 60000, // 1 minute
      limit: Number(process.env.THROTTLE_AUTH_LIMIT) || 5, // 5 auth attempts per minute
    },
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },
});
