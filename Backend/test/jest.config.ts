import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },

    './src/auth/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/users/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.module.ts',
    'main.ts',
    '.dto.ts',
    '.entity.ts',
    'prisma.service.ts',
  ],
};

export default config;
