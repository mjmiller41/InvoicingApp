import { betterAuth } from 'better-auth';
import pg from 'pg';

const { Pool } = pg;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
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
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  ],
});
