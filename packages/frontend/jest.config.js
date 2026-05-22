const jestConfig = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/src/App.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default jestConfig;
