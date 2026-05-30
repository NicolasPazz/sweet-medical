import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Setup global Jest fixtures for backend tests.
beforeAll(async () => {
  const connectionString = `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}_test?authSource=admin`;
  await mongoose.connect(connectionString);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.connection.close();
});
