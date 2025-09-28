module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.(test|spec).js'
  ],
  collectCoverageFrom: [
    'src/worker/**/*.js',
    '!src/worker/tests/**'
  ],
  moduleNameMapper: {
    '^game-framework$': '<rootDir>/src/worker/tests/mocks/game-framework.js',
    '^\.\./\../shared/game-module$': '<rootDir>/src/worker/tests/mocks/game-module.js',
    '^\.\./shared/event-handler$': '<rootDir>/src/worker/tests/mocks/event-handler.js'
  },
  clearMocks: true,
  restoreMocks: true
};
