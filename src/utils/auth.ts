import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { twoFactor } from 'better-auth/plugins';
import { getDatabase } from '../db/mongodb';

export const auth = betterAuth({
  appName: 'Hospiwise',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  
  database: mongodbAdapter(getDatabase()),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  
  plugins: [
    twoFactor({
      issuer: 'Hospiwise',
      otpOptions: {
        async sendOTP({ user, otp }) {
          // Send OTP via email
          await sendOTPEmail(user.email, otp);
        },
      },
    }),
  ],
  
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
      department: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});