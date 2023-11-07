module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'], // Define the test file pattern
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // Ignore the 'dist' directory
  setupFiles: ['tsconfig-paths/register'],
  globalSetup: '<rootDir>/src/test-setup/testSetup.ts',
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', 'src'],
};
