/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',

  // Run setup file after test framework is installed in the environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx:    'react-jsx',
        strict: true,
      },
    }],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Stub CSS modules if ever introduced
    '\\.module\\.(css|scss)$': 'identity-obj-proxy',
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.ts',
    'services/**/*.ts',
    'hooks/**/*.ts',
    'store/**/*.ts',
    'components/**/*.tsx',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/__tests__/**',
  ],

  coverageThreshold: {
    global: {
      lines:     80,
      functions: 80,
      branches:  75,
      statements: 80,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = config;
