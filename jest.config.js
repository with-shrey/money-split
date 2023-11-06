const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'], // Define the test file pattern
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // Ignore the 'dist' directory
  setupFiles: ['tsconfig-paths/register'],
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', 'src']
};
