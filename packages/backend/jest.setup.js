import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ silent: true });

// Setup global Jest fixtures for backend tests.
beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  const connectionString = `${uri}/${dbName}_test?authSource=admin`;
  await mongoose.connect(connectionString);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
});
