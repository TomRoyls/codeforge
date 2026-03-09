import { describe, test, expect } from 'vitest';
import { validateConfig } from '../../../src/config/validator';
import { CLIError } from '../../../src/utils/errors';

describe('validateConfig', () => {
  describe('valid configs', () => {
    test('accepts valid empty config', () => {
      const config = {};
      const result = validateConfig(config);
      expect(result).toEqual({});
    });

    test('accepts valid rules config', () => {
      const config = {
        rules: {
          'max-complexity': 'error',
          'no-eval': 'warning',
          'prefer-const': 'info',
        },
      };
      const result = validateConfig(config);
      expect(result.rules).toEqual({
        'max-complexity': 'error',
        'no-eval': 'warning',
        'prefer-const': 'info',
      });
    });

    test('accepts rules with options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', { max: 15 }],
          'max-lines': ['warning', { max: 500 }],
        },
      };
      const result = validateConfig(config);
      expect(result.rules).toEqual({
        'max-complexity': ['error', { max: 15 }],
        'max-lines': ['warning', { max: 500 }],
      });
    });

    test('accepts rules with empty options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', {}],
        },
      };
      const result = validateConfig(config);
      expect(result.rules).toEqual({
        'max-complexity': ['error', {}],
      });
    });

    test('accepts valid files array', () => {
      const config = {
        files: ['src/**/*.ts', 'lib/**/*.js', '**/*.tsx'],
      };
      const result = validateConfig(config);
      expect(result.files).toEqual(['src/**/*.ts', 'lib/**/*.js', '**/*.tsx']);
    });

    test('accepts valid ignore array', () => {
      const config = {
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      };
      const result = validateConfig(config);
      expect(result.ignore).toEqual(['node_modules/**', 'dist/**', 'coverage/**']);
    });

    test('accepts empty files array', () => {
      const config = { files: [] };
      const result = validateConfig(config);
      expect(result.files).toEqual([]);
    });

    test('accepts empty ignore array', () => {
      const config = { ignore: [] };
      const result = validateConfig(config);
      expect(result.ignore).toEqual([]);
    });

    test('accepts complete valid config', () => {
      const config = {
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
        rules: {
          'max-complexity': ['error', { max: 10 }],
          'no-eval': 'error',
        },
      };
      const result = validateConfig(config);
      expect(result).toEqual(config);
    });
  });

  describe('rejects invalid config types', () => {
    test('rejects non-object config (null)', () => {
      expect(() => validateConfig(null)).toThrowCLIError('E003');
    });

    test('rejects non-object config (string)', () => {
      expect(() => validateConfig('config')).toThrowCLIError('E003');
    });

    test('rejects non-object config (number)', () => {
      expect(() => validateConfig(123)).toThrowCLIError('E003');
    });

    test('rejects array config', () => {
      expect(() => validateConfig(['error'])).toThrowCLIError('E003');
    });
  });

  describe('rejects invalid severity', () => {
    test('rejects invalid severity string', () => {
      const config = {
        rules: {
          'max-complexity': 'critical',
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects invalid severity in array', () => {
      const config = {
        rules: {
          'max-complexity': ['fatal', { max: 10 }],
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });
  });

  describe('rejects invalid rule config type', () => {
    test('rejects number rule config', () => {
      const config = {
        rules: {
          'max-complexity': 1,
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects object rule config', () => {
      const config = {
        rules: {
          'max-complexity': { severity: 'error' },
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects null rule config', () => {
      const config = {
        rules: {
          'max-complexity': null,
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects array with wrong length (empty)', () => {
      const config = {
        rules: {
          'max-complexity': [],
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects array with wrong length (too many)', () => {
      const config = {
        rules: {
          'max-complexity': ['error', { max: 10 }, 'extra'],
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects non-string severity in array', () => {
      const config = {
        rules: {
          'max-complexity': [1, { max: 10 }],
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects array options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', [1, 2, 3]],
        },
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });
  });

  describe('rejects invalid files', () => {
    test('rejects non-array files', () => {
      const config = {
        files: 'src/**/*.ts',
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects non-string in files array (number)', () => {
      const config = {
        files: ['src/**/*.ts', 123],
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects non-string in files array (object)', () => {
      const config = {
        files: ['src/**/*.ts', { pattern: 'lib/**/*.js' }],
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects non-string in files array (null)', () => {
      const config = {
        files: ['src/**/*.ts', null],
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });
  });

  describe('rejects invalid ignore', () => {
    test('rejects non-array ignore', () => {
      const config = {
        ignore: 'node_modules/**',
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects non-string in ignore array', () => {
      const config = {
        ignore: ['node_modules/**', 456],
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });
  });

  describe('rejects invalid rules type', () => {
    test('rejects array rules', () => {
      const config = {
        rules: ['error', 'warning'],
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects null rules', () => {
      const config = {
        rules: null,
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });

    test('rejects string rules', () => {
      const config = {
        rules: 'error',
      };
      expect(() => validateConfig(config)).toThrowCLIError('E003');
    });
  });
});

expect.extend({
  toThrowCLIError(received: () => void, code: string) {
    try {
      received();
      return {
        pass: false,
        message: () => `Expected function to throw CLIError with code ${code}, but it did not throw`,
      };
    } catch (error) {
      if (error instanceof CLIError) {
        const pass = error.code === code;
        return {
          pass,
          message: () =>
            pass
              ? `Expected function not to throw CLIError with code ${code}`
              : `Expected CLIError code ${code}, got ${(error as CLIError).code}`,
        };
      }
      return {
        pass: false,
        message: () => `Expected CLIError, got ${(error as Error).constructor.name}`,
      };
    }
  },
});

declare module 'vitest' {
  interface Assertion {
    toThrowCLIError(code: string): void;
  }
}
