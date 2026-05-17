// Setup global Jest fixtures for backend tests.
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
