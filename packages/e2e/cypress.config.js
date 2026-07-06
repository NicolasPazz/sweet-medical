import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    env: {
      E2E_USER_EMAIL: process.env.E2E_USER_EMAIL,
      E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
