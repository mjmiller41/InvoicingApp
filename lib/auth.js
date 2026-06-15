import { betterAuth } from 'better-auth';
import pg from 'pg';

const { Pool } = pg;

const required = [
  'DATABASE_URL_UNPOOLED',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
    max: 2,
    idleTimeoutMillis: 30000,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL,
  ],
});
