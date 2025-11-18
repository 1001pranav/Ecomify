module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '../services/**/*.(t|j)s',
    '!../services/**/node_modules/**',
    '!../services/**/dist/**',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['./setup.ts'],
};
