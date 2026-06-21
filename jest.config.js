/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'services/**/*.ts',
    'hooks/**/*.ts',
    'store/**/*.ts',
    '!**/*.d.ts',
  ],
};

module.exports = config;
