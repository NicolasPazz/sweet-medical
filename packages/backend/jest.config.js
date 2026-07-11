export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
