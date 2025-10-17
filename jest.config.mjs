export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  detectOpenHandles: true,
  forceExit: true,
  setupFiles: ['dotenv/config'],
};
