module.exports = {
  preset: '@react-native/jest-preset',
  // Backend tests are Node test-runner suites (node --test), not Jest suites.
  testPathIgnorePatterns: ['/node_modules/', '/SentrySecurityApp-backend/'],
};
