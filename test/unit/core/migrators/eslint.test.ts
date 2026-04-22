import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateESLintConfig,
  readESLintConfig,
  detectESLintConfig,
  type MigrationResult,
} from '../../../../src/core/migrators/eslint.js'
import type { RuleSeverity } from '../../../../src/rules/types.js'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('ESLint migrator', () => {
  describe('migrateESLintConfig', () => {
    test('should migrate basic ESLint config with severity numbers', () => {
      const config = {
        rules: {
          complexity: 2,
          'max-depth': 1,
          'no-eval': 0,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.source).toBe('eslint')
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['no-eval']).toBeUndefined()
    })

    test('should migrate ESLint config with severity strings', () => {
      const config = {
        rules: {
          'prefer-const': 'error',
          'no-await-in-loop': 'warn',
          'max-params': 'off',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['no-await-in-loop']).toBe('warning')
      expect(result.rules['max-params']).toBeUndefined()
    })

    test('should migrate ESLint config with array severity', () => {
      const config = {
        rules: {
          complexity: ['error', 10],
          'max-params': ['warn', { max: 3 }],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-params']).toEqual(['warning', { max: 3 }])
    })

    test('should handle unmapped rules', () => {
      const config = {
        rules: {
          'some-unknown-rule': 'error',
          'another-unknown': 2,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.unmapped).toContain('some-unknown-rule')
      expect(result.unmapped).toContain('another-unknown')
    })

    test('should merge rules from overrides', () => {
      const config = {
        rules: {
          complexity: 'error',
        },
        overrides: [
          {
            rules: {
              'max-depth': 'warn',
            },
          },
        ],
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
    })

    test('should handle empty config', () => {
      const result = migrateESLintConfig({})

      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should handle config with empty rules', () => {
      const result = migrateESLintConfig({ rules: {} })

      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should handle TypeScript ESLint rules', () => {
      const config = {
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'warn',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    test('should handle multiple TypeScript ESLint rules mapping to same output', () => {
      const config = {
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'warn',
        },
      }

      const result = migrateESLintConfig(config)

      // Last rule wins when multiple map to same output
      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    test('should handle string severity variants', () => {
      const config = {
        rules: {
          complexity: '2',
          'max-depth': '1',
          'max-lines': '0',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['max-lines']).toBeUndefined()
    })

    test('should handle warning severity string', () => {
      const config = {
        rules: {
          complexity: 'warning',
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should handle invalid severity', () => {
      const config = {
        rules: {
          complexity: 'invalid' as unknown as number,
          'max-depth': null as unknown as number,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBeUndefined()
      expect(result.rules['max-depth']).toBeUndefined()
    })

    test('should handle numeric severity edge cases', () => {
      const config = {
        rules: {
          complexity: 3 as unknown as 0 | 1 | 2,
          'max-depth': -1 as unknown as 0 | 1 | 2,
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBeUndefined()
      expect(result.rules['max-depth']).toBeUndefined()
    })

    test('should extract options from rule config', () => {
      const config = {
        rules: {
          complexity: ['error', { max: 15 }],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toEqual(['error', { max: 15 }])
    })

    test('should handle non-object options', () => {
      const config = {
        rules: {
          complexity: ['error', 'string-option' as unknown as Record<string, unknown>],
        },
      }

      const result = migrateESLintConfig(config)

      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should map complexity to max-complexity', () => {
      const result = migrateESLintConfig({ rules: { complexity: 2 } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should map max-depth to max-depth', () => {
      const result = migrateESLintConfig({ rules: { 'max-depth': 2 } })
      expect(result.rules['max-depth']).toBe('error')
    })

    test('should map max-lines to max-lines', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 2 } })
      expect(result.rules['max-lines']).toBe('error')
    })

    test('should map max-lines-per-function to max-lines-per-function', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines-per-function': 2 } })
      expect(result.rules['max-lines-per-function']).toBe('error')
    })

    test('should map max-params to max-params', () => {
      const result = migrateESLintConfig({ rules: { 'max-params': 2 } })
      expect(result.rules['max-params']).toBe('error')
    })

    test('should map no-await-in-loop to no-await-in-loop', () => {
      const result = migrateESLintConfig({ rules: { 'no-await-in-loop': 2 } })
      expect(result.rules['no-await-in-loop']).toBe('error')
    })

    test('should map no-sync-in-async to no-sync-in-async', () => {
      const result = migrateESLintConfig({ rules: { 'no-sync-in-async': 2 } })
      expect(result.rules['no-sync-in-async']).toBe('error')
    })

    test('should map prefer-object-spread to prefer-object-spread', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-object-spread': 2 } })
      expect(result.rules['prefer-object-spread']).toBe('error')
    })

    test('should map prefer-optional-chaining to prefer-optional-chain', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-optional-chaining': 2 } })
      expect(result.rules['prefer-optional-chain']).toBe('error')
    })

    test('should map prefer-const to prefer-const', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-const': 2 } })
      expect(result.rules['prefer-const']).toBe('error')
    })

    test('should map no-eval to no-eval', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 2 } })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should map no-implied-eval to no-eval', () => {
      const result = migrateESLintConfig({ rules: { 'no-implied-eval': 2 } })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should map no-new-func to no-eval', () => {
      const result = migrateESLintConfig({ rules: { 'no-new-func': 2 } })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should map @typescript-eslint/no-explicit-any to no-unsafe-type-assertion', () => {
      const result = migrateESLintConfig({ rules: { '@typescript-eslint/no-explicit-any': 2 } })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should map @typescript-eslint/no-unsafe-assignment to no-unsafe-type-assertion', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-assignment': 2 },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should map @typescript-eslint/no-unsafe-member-access to no-unsafe-type-assertion', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-member-access': 2 },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should map @typescript-eslint/no-unsafe-call to no-unsafe-type-assertion', () => {
      const result = migrateESLintConfig({ rules: { '@typescript-eslint/no-unsafe-call': 2 } })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should map @typescript-eslint/no-unsafe-return to no-unsafe-type-assertion', () => {
      const result = migrateESLintConfig({ rules: { '@typescript-eslint/no-unsafe-return': 2 } })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should convert numeric 0 to disabled for any rule', () => {
      const result = migrateESLintConfig({ rules: { complexity: 0 } })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should convert numeric 1 to warning for any rule', () => {
      const result = migrateESLintConfig({ rules: { complexity: 1 } })
      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should convert numeric 2 to error for any rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-depth': 2 } })
      expect(result.rules['max-depth']).toBe('error')
    })

    test('should convert string error to error', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 'error' } })
      expect(result.rules['max-lines']).toBe('error')
    })

    test('should convert string warn to warning', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 'warn' } })
      expect(result.rules['max-lines']).toBe('warning')
    })

    test('should convert string off to disabled', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 'off' } })
      expect(result.rules['max-lines']).toBeUndefined()
    })

    test('should convert string 2 to error', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': '2' } })
      expect(result.rules['max-lines']).toBe('error')
    })

    test('should convert string 1 to warning', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': '1' } })
      expect(result.rules['max-lines']).toBe('warning')
    })

    test('should convert string 0 to disabled', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': '0' } })
      expect(result.rules['max-lines']).toBeUndefined()
    })

    test('should convert string warning to warning', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 'warning' } })
      expect(result.rules['max-lines']).toBe('warning')
    })

    test('should treat undefined severity as disabled', () => {
      const config = { rules: { complexity: undefined } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should treat boolean true severity as invalid', () => {
      const config = { rules: { complexity: true as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should treat boolean false severity as invalid', () => {
      const config = { rules: { complexity: false as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should treat empty string severity as disabled', () => {
      const result = migrateESLintConfig({ rules: { complexity: '' as unknown as number } })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should treat object severity as disabled', () => {
      const config = { rules: { complexity: {} as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle array with numeric severity 0 as disabled', () => {
      const result = migrateESLintConfig({ rules: { complexity: [0, { max: 10 }] } })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle array with numeric severity 1 as warning with options', () => {
      const result = migrateESLintConfig({ rules: { complexity: [1, { max: 10 }] } })
      expect(result.rules['max-complexity']).toEqual(['warning', { max: 10 }])
    })

    test('should handle array with numeric severity 2 as error with options', () => {
      const result = migrateESLintConfig({ rules: { complexity: [2, { max: 20 }] } })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 20 }])
    })

    test('should handle array with string severity off as disabled', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['off', { max: 10 }] } })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle array with string severity warn as warning with options', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['warn', { max: 5 }] } })
      expect(result.rules['max-complexity']).toEqual(['warning', { max: 5 }])
    })

    test('should handle array with string severity warning as warning with options', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['warning', { max: 7 }] } })
      expect(result.rules['max-complexity']).toEqual(['warning', { max: 7 }])
    })

    test('should handle array with string severity error as error with options', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['error', { max: 12 }] } })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 12 }])
    })

    test('should handle array with string severity 2 as error', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['2', { max: 8 }] } })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 8 }])
    })

    test('should handle array with string severity 1 as warning', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['1', { max: 6 }] } })
      expect(result.rules['max-complexity']).toEqual(['warning', { max: 6 }])
    })

    test('should handle array with string severity 0 as disabled', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['0', { max: 10 }] } })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle array with null element as disabled', () => {
      const config = { rules: { complexity: [null as unknown as string, { max: 10 }] } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle deeply nested array severity via recursion', () => {
      const config = { rules: { complexity: [['error'], { max: 5 }] } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toEqual(['error', { max: 5 }])
    })

    test('should handle array with only severity and no options', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['error'] } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle array with severity and number option', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['error', 10] } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle array with severity and boolean option', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', true as unknown as Record<string, unknown>] },
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle large numeric severity as invalid', () => {
      const config = { rules: { complexity: 100 as unknown as 0 | 1 | 2 } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle negative numeric severity as invalid', () => {
      const config = { rules: { complexity: -5 as unknown as 0 | 1 | 2 } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should extract options for max-depth rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-depth': ['error', { max: 4 }] } })
      expect(result.rules['max-depth']).toEqual(['error', { max: 4 }])
    })

    test('should extract options for max-lines rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': ['warn', { max: 300 }] } })
      expect(result.rules['max-lines']).toEqual(['warning', { max: 300 }])
    })

    test('should extract options for max-lines-per-function rule', () => {
      const result = migrateESLintConfig({
        rules: { 'max-lines-per-function': ['error', { max: 50 }] },
      })
      expect(result.rules['max-lines-per-function']).toEqual(['error', { max: 50 }])
    })

    test('should extract options for max-params rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-params': ['warn', { max: 4 }] } })
      expect(result.rules['max-params']).toEqual(['warning', { max: 4 }])
    })

    test('should extract options for prefer-const rule', () => {
      const result = migrateESLintConfig({
        rules: { 'prefer-const': ['error', { destructuring: 'all' }] },
      })
      expect(result.rules['prefer-const']).toEqual(['error', { destructuring: 'all' }])
    })

    test('should extract options for no-await-in-loop rule', () => {
      const result = migrateESLintConfig({
        rules: { 'no-await-in-loop': ['error', { checkForOf: true }] },
      })
      expect(result.rules['no-await-in-loop']).toEqual(['error', { checkForOf: true }])
    })

    test('should extract options for no-eval rule', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': ['error', { allowIndirect: false }] },
      })
      expect(result.rules['no-eval']).toEqual(['error', { allowIndirect: false }])
    })

    test('should extract options for no-implied-eval rule', () => {
      const result = migrateESLintConfig({
        rules: { 'no-implied-eval': ['error', { blockForStatement: true }] },
      })
      expect(result.rules['no-eval']).toEqual(['error', { blockForStatement: true }])
    })

    test('should extract options for no-new-func rule', () => {
      const result = migrateESLintConfig({
        rules: { 'no-new-func': ['error', { allowForTesting: true }] },
      })
      expect(result.rules['no-eval']).toEqual(['error', { allowForTesting: true }])
    })

    test('should not add options when rule config is plain severity', () => {
      const result = migrateESLintConfig({ rules: { complexity: 'error' } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should not add options when rule config is numeric severity', () => {
      const result = migrateESLintConfig({ rules: { complexity: 2 } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle empty object options', () => {
      const result = migrateESLintConfig({ rules: { complexity: ['error', {}] } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle options with multiple keys', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { max: 10, strict: true }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 10, strict: true }])
    })

    test('should handle options with nested object', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { thresholds: { error: 20, warn: 10 } }] },
      })
      expect(result.rules['max-complexity']).toEqual([
        'error',
        { thresholds: { error: 20, warn: 10 } },
      ])
    })

    test('should handle options with array value', () => {
      const result = migrateESLintConfig({
        rules: { 'max-depth': ['error', { exclude: ['ClassBody'] }] },
      })
      expect(result.rules['max-depth']).toEqual(['error', { exclude: ['ClassBody'] }])
    })

    test('should handle options with null value', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { max: null }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: null }])
    })

    test('should handle options with string value', () => {
      const result = migrateESLintConfig({
        rules: { 'prefer-const': ['error', { mode: 'destructuring' }] },
      })
      expect(result.rules['prefer-const']).toEqual(['error', { mode: 'destructuring' }])
    })

    test('should handle array with three elements using first as severity', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { max: 10 }, 'extra'] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 10 }])
    })

    test('should handle array with undefined as second element', () => {
      const config = { rules: { complexity: ['error', undefined] } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle array with null as second element throwing on Object.keys', () => {
      const config = {
        rules: { complexity: ['error', null as unknown as Record<string, unknown>] },
      }
      expect(() => migrateESLintConfig(config)).toThrow()
    })

    test('should handle empty overrides array', () => {
      const result = migrateESLintConfig({ rules: {}, overrides: [] })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should handle overrides with no rules property', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [{}, { files: ['*.ts'] }],
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle overrides with empty rules', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [{ rules: {} }],
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should merge rules from multiple overrides', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [{ rules: { 'max-depth': 2 } }, { rules: { 'max-lines': 1 } }],
      })
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('error')
      expect(result.rules['max-lines']).toBe('warning')
    })

    test('should let overrides override base rules', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [{ rules: { complexity: 1 } }],
      })
      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should let later overrides override earlier overrides', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { complexity: 2 } }, { rules: { complexity: 0 } }],
      })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle override adding unmapped rules', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { 'custom-rule': 'error' } }],
      })
      expect(result.unmapped).toContain('custom-rule')
    })

    test('should handle override adding both mapped and unmapped rules', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { complexity: 2, 'custom-rule': 'error' } }],
      })
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.unmapped).toContain('custom-rule')
    })

    test('should handle override with TypeScript rules', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { '@typescript-eslint/no-explicit-any': 'error' } }],
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should handle override with array config', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { complexity: ['error', { max: 20 }] } }],
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 20 }])
    })

    test('should handle many overrides merging correctly', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [
          { rules: { 'max-depth': 2 } },
          { rules: { 'max-lines': 2 } },
          { rules: { 'max-params': 2 } },
          { rules: { 'prefer-const': 1 } },
        ],
      })
      expect(Object.keys(result.rules)).toHaveLength(5)
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('error')
      expect(result.rules['max-lines']).toBe('error')
      expect(result.rules['max-params']).toBe('error')
      expect(result.rules['prefer-const']).toBe('warning')
    })

    test('should handle override with disabled rule overriding base enabled rule', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2 },
        overrides: [{ rules: { complexity: 'off' } }],
      })
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle override with string severity number', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { complexity: '2' } }],
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle override with warning string severity', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { complexity: 'warning' } }],
      })
      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should handle single override with multiple rules', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [
          {
            rules: {
              complexity: 'error',
              'max-depth': 'warn',
              'max-lines': 'error',
              'no-eval': 'off',
            },
          },
        ],
      })
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['max-lines']).toBe('error')
      expect(result.rules['no-eval']).toBeUndefined()
    })

    test('should track single unmapped rule', () => {
      const result = migrateESLintConfig({ rules: { 'unknown-rule': 'error' } })
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    test('should track multiple unmapped rules', () => {
      const result = migrateESLintConfig({
        rules: {
          'rule-a': 'error',
          'rule-b': 'warn',
          'rule-c': 2,
        },
      })
      expect(result.unmapped).toEqual(['rule-a', 'rule-b', 'rule-c'])
    })

    test('should not include mapped rules in unmapped', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 2, 'unknown-rule': 'error' },
      })
      expect(result.unmapped).toEqual(['unknown-rule'])
      expect(result.unmapped).not.toContain('complexity')
    })

    test('should track unmapped disabled rules by name', () => {
      const result = migrateESLintConfig({
        rules: { 'unknown-rule': 'off' },
      })
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    test('should track unmapped rules with scoped names', () => {
      const result = migrateESLintConfig({
        rules: { '@custom/my-rule': 'error' },
      })
      expect(result.unmapped).toEqual(['@custom/my-rule'])
    })

    test('should track unmapped rules from overrides', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [{ rules: { 'unknown-from-override': 'error' } }],
      })
      expect(result.unmapped).toEqual(['unknown-from-override'])
    })

    test('should handle all rules being unmapped', () => {
      const result = migrateESLintConfig({
        rules: {
          'rule-1': 'error',
          'rule-2': 'warn',
          'rule-3': 2,
        },
      })
      expect(result.unmapped).toHaveLength(3)
      expect(Object.keys(result.rules)).toHaveLength(0)
    })

    test('should handle mix of mapped unmapped and disabled rules', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: 2,
          'unknown-rule': 'error',
          'max-depth': 0,
        },
      })
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBeUndefined()
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    test('should handle react plugin rules as unmapped', () => {
      const result = migrateESLintConfig({
        rules: {
          'react/display-name': 'error',
          'react/no-deprecated': 'warn',
        },
      })
      expect(result.unmapped).toEqual(['react/display-name', 'react/no-deprecated'])
    })

    test('should handle import plugin rules as unmapped', () => {
      const result = migrateESLintConfig({
        rules: { 'import/no-cycle': 'error' },
      })
      expect(result.unmapped).toEqual(['import/no-cycle'])
    })

    test('should handle jest plugin rules as unmapped', () => {
      const result = migrateESLintConfig({
        rules: { 'jest/expect-expect': 'error' },
      })
      expect(result.unmapped).toEqual(['jest/expect-expect'])
    })

    test('should not deduplicate unmapped rule names from base and override', () => {
      const result = migrateESLintConfig({
        rules: { 'unknown-rule': 'error' },
        overrides: [{ rules: { 'unknown-rule': 'warn' } }],
      })
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    test('should handle rules with very long names as unmapped', () => {
      const longName = 'a'.repeat(200)
      const result = migrateESLintConfig({ rules: { [longName]: 'error' } })
      expect(result.unmapped).toEqual([longName])
    })

    test('should handle rules with special characters as unmapped', () => {
      const result = migrateESLintConfig({
        rules: { 'rule/with/slashes': 'error' },
      })
      expect(result.unmapped).toEqual(['rule/with/slashes'])
    })

    test('should handle empty string rule name as unmapped', () => {
      const result = migrateESLintConfig({ rules: { '': 'error' } })
      expect(result.unmapped).toEqual([''])
    })

    test('should let no-implied-eval override no-eval for same output rule', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-eval': 'warn',
          'no-implied-eval': 'error',
        },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should let no-new-func override both no-eval and no-implied-eval', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-eval': 'warn',
          'no-implied-eval': 'error',
          'no-new-func': 'warn',
        },
      })
      expect(result.rules['no-eval']).toBe('warning')
    })

    test('should handle typescript rules all mapping to same output', () => {
      const result = migrateESLintConfig({
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-member-access': 'warn',
        },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    test('should handle prefer-object-spread independently from other rules', () => {
      const result = migrateESLintConfig({
        rules: { 'prefer-object-spread': 'error' },
      })
      expect(result.rules['prefer-object-spread']).toBe('error')
      expect(Object.keys(result.rules)).toHaveLength(1)
    })

    test('should handle prefer-optional-chaining independently', () => {
      const result = migrateESLintConfig({
        rules: { 'prefer-optional-chaining': 'warn' },
      })
      expect(result.rules['prefer-optional-chain']).toBe('warning')
      expect(Object.keys(result.rules)).toHaveLength(1)
    })

    test('should handle no-sync-in-async independently', () => {
      const result = migrateESLintConfig({
        rules: { 'no-sync-in-async': 'error' },
      })
      expect(result.rules['no-sync-in-async']).toBe('error')
      expect(Object.keys(result.rules)).toHaveLength(1)
    })

    test('should handle complexity with options overriding base without options', () => {
      const result = migrateESLintConfig({
        rules: { complexity: 'error' },
        overrides: [{ rules: { complexity: ['warn', { max: 15 }] } }],
      })
      expect(result.rules['max-complexity']).toEqual(['warning', { max: 15 }])
    })

    test('should handle no-eval and no-new-func with different options merging to same rule', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-eval': ['error', { allowIndirect: false }],
          'no-new-func': ['warn', { blockForStatement: true }],
        },
      })
      expect(result.rules['no-eval']).toEqual(['warning', { blockForStatement: true }])
    })

    test('should handle complexity options being overridden by plain severity', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { max: 10 }] },
        overrides: [{ rules: { complexity: 'warn' } }],
      })
      expect(result.rules['max-complexity']).toBe('warning')
    })

    test('should handle all three no-eval variants with array options', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-eval': ['error', { opt1: true }],
          'no-implied-eval': ['warn', { opt2: true }],
          'no-new-func': ['error', { opt3: true }],
        },
      })
      expect(result.rules['no-eval']).toEqual(['error', { opt3: true }])
    })

    test('should handle config with extends property ignored', () => {
      const result = migrateESLintConfig({
        extends: 'eslint:recommended',
        rules: { complexity: 2 },
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should handle config with extends array ignored', () => {
      const result = migrateESLintConfig({
        extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
        rules: { 'prefer-const': 'error' },
      })
      expect(result.rules['prefer-const']).toBe('error')
    })

    test('should handle full realistic config', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: ['error', { max: 20 }],
          'max-depth': ['warn', { max: 4 }],
          'max-lines': ['error', { max: 500 }],
          'max-params': ['error', { max: 4 }],
          'prefer-const': 'error',
          'no-eval': 'error',
          'no-await-in-loop': 'warn',
        },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 20 }])
      expect(result.rules['max-depth']).toEqual(['warning', { max: 4 }])
      expect(result.rules['max-lines']).toEqual(['error', { max: 500 }])
      expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['no-eval']).toBe('error')
      expect(result.rules['no-await-in-loop']).toBe('warning')
    })

    test('should handle config with all rules disabled', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: 0,
          'max-depth': 'off',
          'no-eval': 0,
          'prefer-const': 'off',
        },
      })
      expect(Object.keys(result.rules)).toHaveLength(0)
    })

    test('should handle config with all TypeScript rules disabled', () => {
      const result = migrateESLintConfig({
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-unsafe-assignment': 0,
          '@typescript-eslint/no-unsafe-member-access': 'off',
          '@typescript-eslint/no-unsafe-call': 0,
          '@typescript-eslint/no-unsafe-return': 'off',
        },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBeUndefined()
    })

    test('should always set source to eslint for empty config', () => {
      const result = migrateESLintConfig({})
      expect(result.source).toBe('eslint')
    })

    test('should always set source to eslint for non-empty config', () => {
      const result = migrateESLintConfig({ rules: { complexity: 2 } })
      expect(result.source).toBe('eslint')
    })

    test('should handle config with only unmapped rules producing empty result rules', () => {
      const result = migrateESLintConfig({
        rules: {
          'unknown-1': 'error',
          'unknown-2': 'warn',
        },
      })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toHaveLength(2)
    })

    test('should handle many rules simultaneously', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: 2,
          'max-depth': 1,
          'max-lines': 2,
          'max-lines-per-function': 1,
          'max-params': 2,
          'no-await-in-loop': 1,
          'prefer-const': 2,
          'no-eval': 2,
        },
      })
      expect(Object.keys(result.rules)).toHaveLength(8)
    })

    test('should handle all TypeScript rules enabled as error', () => {
      const result = migrateESLintConfig({
        rules: {
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unsafe-assignment': 'error',
          '@typescript-eslint/no-unsafe-member-access': 'error',
          '@typescript-eslint/no-unsafe-call': 'error',
          '@typescript-eslint/no-unsafe-return': 'error',
        },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    test('should handle config with rules set to numeric strings in arrays', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: ['2', { max: 10 }],
          'max-depth': ['1', { max: 3 }],
        },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 10 }])
      expect(result.rules['max-depth']).toEqual(['warning', { max: 3 }])
    })

    test('should handle migration result structure correctly', () => {
      const result = migrateESLintConfig({ rules: { complexity: 2 } })
      expect(result).toHaveProperty('rules')
      expect(result).toHaveProperty('unmapped')
      expect(result).toHaveProperty('source')
      expect(Object.keys(result)).toHaveLength(3)
    })

    test('should handle unmapped being an array', () => {
      const result = migrateESLintConfig({ rules: {} })
      expect(Array.isArray(result.unmapped)).toBe(true)
    })

    test('should handle rules being a plain object', () => {
      const result = migrateESLintConfig({ rules: { complexity: 2 } })
      expect(typeof result.rules).toBe('object')
      expect(Array.isArray(result.rules)).toBe(false)
    })

    test('should handle override with many rules at once', () => {
      const result = migrateESLintConfig({
        rules: {},
        overrides: [
          {
            rules: {
              complexity: 2,
              'max-depth': 2,
              'max-lines': 2,
              'max-params': 2,
              'prefer-const': 2,
              'no-eval': 2,
              'custom-rule': 'error',
            },
          },
        ],
      })
      expect(Object.keys(result.rules)).toHaveLength(6)
      expect(result.unmapped).toEqual(['custom-rule'])
    })

    test('should handle config with all performance rules', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-await-in-loop': 'error',
          'no-sync-in-async': 'error',
          'prefer-object-spread': 'error',
          'prefer-optional-chaining': 'error',
        },
      })
      expect(result.rules['no-await-in-loop']).toBe('error')
      expect(result.rules['no-sync-in-async']).toBe('error')
      expect(result.rules['prefer-object-spread']).toBe('error')
      expect(result.rules['prefer-optional-chain']).toBe('error')
    })

    test('should handle config with all complexity rules', () => {
      const result = migrateESLintConfig({
        rules: {
          complexity: 'error',
          'max-depth': 'error',
          'max-lines': 'error',
          'max-lines-per-function': 'error',
          'max-params': 'error',
        },
      })
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('error')
      expect(result.rules['max-lines']).toBe('error')
      expect(result.rules['max-lines-per-function']).toBe('error')
      expect(result.rules['max-params']).toBe('error')
    })

    test('should handle NaN numeric severity as invalid', () => {
      const config = { rules: { complexity: NaN as unknown as 0 | 1 | 2 } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle Infinity numeric severity as invalid', () => {
      const config = { rules: { complexity: Infinity as unknown as 0 | 1 | 2 } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle floating point severity as invalid', () => {
      const config = { rules: { complexity: 1.5 as unknown as 0 | 1 | 2 } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle array with object containing empty string keys', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { '': 'value' }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { '': 'value' }])
    })

    test('should handle array with object containing numeric keys', () => {
      const result = migrateESLintConfig({
        rules: { complexity: ['error', { 0: 'zero', 1: 'one' }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { 0: 'zero', 1: 'one' }])
    })

    test('should handle array with nested array as second element', () => {
      const config = {
        rules: { complexity: ['error', [1, 2, 3] as unknown as Record<string, unknown>] },
      }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toEqual(['error', [1, 2, 3]])
    })

    test('should handle function as rule value', () => {
      const config = { rules: { complexity: (() => {}) as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle Symbol as rule value', () => {
      const config = { rules: { complexity: Symbol('test') as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle Date as rule value', () => {
      const config = { rules: { complexity: new Date() as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })

    test('should handle RegExp as rule value', () => {
      const config = { rules: { complexity: /test/ as unknown as number } }
      const result = migrateESLintConfig(config)
      expect(result.rules['max-complexity']).toBeUndefined()
    })
  })

  describe('readESLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-eslint-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should read JSON config file', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: { complexity: 'error' } }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe('error')
    })

    test('should return null for non-existent file', async () => {
      const result = await readESLintConfig('/non/existent/path/.eslintrc.json')

      expect(result).toBeNull()
    })

    test('should return null for JS config files', async () => {
      const configPath = join(testDir, '.eslintrc.js')
      writeFileSync(configPath, 'module.exports = { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for CJS config files', async () => {
      const configPath = join(testDir, '.eslintrc.cjs')
      writeFileSync(configPath, 'module.exports = { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for MJS config files', async () => {
      const configPath = join(testDir, '.eslintrc.mjs')
      writeFileSync(configPath, 'export default { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should parse basic YAML config', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: error\n  max-depth: 1')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should handle empty YAML config', async () => {
      const configPath = join(testDir, '.eslintrc.yml')
      writeFileSync(configPath, '')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should return null for invalid JSON', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, 'not valid json')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should handle unknown file extension', async () => {
      const configPath = join(testDir, '.eslintrc.unknown')
      writeFileSync(configPath, 'content')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should read JSON config with empty rules', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: {} }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should read JSON config with no rules property', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ extends: 'eslint:recommended' }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeUndefined()
    })

    test('should read JSON config with empty object', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '{}')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result).toEqual({})
    })

    test('should read JSON config with overrides', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: { complexity: 'error' },
          overrides: [{ rules: { 'max-depth': 'warn' } }],
        }),
      )

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe('error')
      expect(result?.overrides).toBeDefined()
    })

    test('should read JSON config with numeric severities', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({ rules: { complexity: 2, 'max-depth': 1, 'no-eval': 0 } }),
      )

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe(2)
      expect(result?.rules?.['max-depth']).toBe(1)
      expect(result?.rules?.['no-eval']).toBe(0)
    })

    test('should read JSON config with array severities', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: { complexity: ['error', 10] } }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toEqual(['error', 10])
    })

    test('should return null for truncated JSON', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '{"rules": {')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should read JSON config with TypeScript rules', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: { '@typescript-eslint/no-explicit-any': 'error' },
        }),
      )

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.['@typescript-eslint/no-explicit-any']).toBe('error')
    })

    test('should read JSON config with extends property', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          extends: ['eslint:recommended'],
          rules: { complexity: 'error' },
        }),
      )

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe('error')
    })

    test('should read JSON array as valid parse result', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '[]')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should read JSON config with many rules', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      const rules: Record<string, string> = {
        complexity: 'error',
        'max-depth': 'warn',
        'max-lines': 'error',
        'max-params': 'error',
        'prefer-const': 'error',
        'no-eval': 'error',
      }
      writeFileSync(configPath, JSON.stringify({ rules }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(Object.keys(result?.rules ?? {})).toHaveLength(6)
    })

    test('should parse YAML config with string severity', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: error')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with numeric severity', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: 2')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with multiple rules', async () => {
      const configPath = join(testDir, '.eslintrc.yml')
      writeFileSync(configPath, 'rules:\n  complexity: error\n  max-depth: 1\n  max-lines: 2')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with warn severity', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: warn')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with zero severity', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: 0')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with only whitespace', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, '   \n   \n')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
    })

    test('should parse YAML config with rules section only', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should handle YAML config with non-rules top-level section', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'env:\n  node: true\n  es6: true')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should handle YAML config with list items in rules', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  - item1\n  - item2')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toEqual({})
    })

    test('should parse YAML config with numeric severity 1', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  max-depth: 1')

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should parse YAML config with many rules', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(
        configPath,
        'rules:\n  complexity: error\n  max-depth: 1\n  max-lines: 2\n  max-params: 2\n  prefer-const: error',
      )

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules).toBeDefined()
    })

    test('should return null for directory path', async () => {
      const result = await readESLintConfig(testDir)
      expect(result).toBeNull()
    })

    test('should read arbitrary .json file path', async () => {
      const configPath = join(testDir, 'custom.json')
      writeFileSync(configPath, JSON.stringify({ rules: { complexity: 'error' } }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(result?.rules?.complexity).toBe('error')
    })

    test('should return null for .js file with complex content', async () => {
      const configPath = join(testDir, 'config.js')
      writeFileSync(
        configPath,
        'const config = { rules: { complexity: "error" } }; module.exports = config;',
      )

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for .cjs file', async () => {
      const configPath = join(testDir, 'config.cjs')
      writeFileSync(configPath, 'module.exports = { rules: {} };')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should return null for empty file with .txt extension', async () => {
      const configPath = join(testDir, '.eslintrc.txt')
      writeFileSync(configPath, '')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should handle JSON file with null content', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, 'null')

      const result = await readESLintConfig(configPath)

      expect(result).toBeNull()
    })

    test('should handle JSON file with boolean content', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, 'true')

      const result = await readESLintConfig(configPath)

      expect(result).toBe(true)
    })

    test('should handle JSON file with string content', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '"hello"')

      const result = await readESLintConfig(configPath)

      expect(result).toBe('hello')
    })
  })

  describe('detectESLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-detect-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should detect .eslintrc.json', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: {} }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.js', async () => {
      const configPath = join(testDir, '.eslintrc.js')
      writeFileSync(configPath, 'module.exports = {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.yaml', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect eslintConfig in package.json', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test',
          eslintConfig: { rules: {} },
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(packageJsonPath)
    })

    test('should return null when no config found', async () => {
      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should return null when package.json has no eslintConfig', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test' }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should prioritize .eslintrc.json over package.json', async () => {
      const eslintRcPath = join(testDir, '.eslintrc.json')
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(eslintRcPath, JSON.stringify({ rules: {} }))
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test',
          eslintConfig: { rules: {} },
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(eslintRcPath)
    })

    test('should detect .eslintrc.cjs', async () => {
      const configPath = join(testDir, '.eslintrc.cjs')
      writeFileSync(configPath, 'module.exports = {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.mjs', async () => {
      const configPath = join(testDir, '.eslintrc.mjs')
      writeFileSync(configPath, 'export default {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc.yml', async () => {
      const configPath = join(testDir, '.eslintrc.yml')
      writeFileSync(configPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect .eslintrc with no extension', async () => {
      const configPath = join(testDir, '.eslintrc')
      writeFileSync(configPath, '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should prioritize .eslintrc.json over .eslintrc.js', async () => {
      const jsonPath = join(testDir, '.eslintrc.json')
      const jsPath = join(testDir, '.eslintrc.js')
      writeFileSync(jsonPath, '{}')
      writeFileSync(jsPath, 'module.exports = {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(jsonPath)
    })

    test('should prioritize .eslintrc.js over .eslintrc.cjs', async () => {
      const jsPath = join(testDir, '.eslintrc.js')
      const cjsPath = join(testDir, '.eslintrc.cjs')
      writeFileSync(jsPath, 'module.exports = {};')
      writeFileSync(cjsPath, 'module.exports = {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(jsPath)
    })

    test('should prioritize .eslintrc.cjs over .eslintrc.mjs', async () => {
      const cjsPath = join(testDir, '.eslintrc.cjs')
      const mjsPath = join(testDir, '.eslintrc.mjs')
      writeFileSync(cjsPath, 'module.exports = {};')
      writeFileSync(mjsPath, 'export default {};')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(cjsPath)
    })

    test('should prioritize .eslintrc.mjs over .eslintrc.yaml', async () => {
      const mjsPath = join(testDir, '.eslintrc.mjs')
      const yamlPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(mjsPath, 'export default {};')
      writeFileSync(yamlPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(mjsPath)
    })

    test('should prioritize .eslintrc.yaml over .eslintrc.yml', async () => {
      const yamlPath = join(testDir, '.eslintrc.yaml')
      const ymlPath = join(testDir, '.eslintrc.yml')
      writeFileSync(yamlPath, 'rules:')
      writeFileSync(ymlPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(yamlPath)
    })

    test('should prioritize .eslintrc.yml over .eslintrc', async () => {
      const ymlPath = join(testDir, '.eslintrc.yml')
      const rcPath = join(testDir, '.eslintrc')
      writeFileSync(ymlPath, 'rules:')
      writeFileSync(rcPath, '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(ymlPath)
    })

    test('should prioritize .eslintrc over package.json with eslintConfig', async () => {
      const rcPath = join(testDir, '.eslintrc')
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(rcPath, '{}')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', eslintConfig: { rules: {} } }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(rcPath)
    })

    test('should detect only present config file', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect package.json eslintConfig when no other config', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(
        packageJsonPath,
        JSON.stringify({ eslintConfig: { rules: { complexity: 'error' } } }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(packageJsonPath)
    })

    test('should not detect package.json without eslintConfig', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', version: '1.0.0' }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should handle empty directory returning null', async () => {
      const result = await detectESLintConfig(testDir)
      expect(result).toBeNull()
    })

    test('should not detect other JSON files', async () => {
      writeFileSync(join(testDir, 'tsconfig.json'), '{}')
      writeFileSync(join(testDir, 'package-lock.json'), '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should not detect files starting with .eslintrc but not matching', async () => {
      writeFileSync(join(testDir, '.eslintrcbackup'), '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should detect .eslintrc when it is the only file', async () => {
      const configPath = join(testDir, '.eslintrc')
      writeFileSync(configPath, '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should handle invalid package.json gracefully', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, 'not valid json')

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should handle package.json with empty eslintConfig', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', eslintConfig: {} }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(packageJsonPath)
    })

    test('should handle package.json with eslintConfig containing rules', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test',
          eslintConfig: { rules: { complexity: 'error' } },
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(packageJsonPath)
    })

    test('should detect .eslintrc.yaml when both yaml and yml present', async () => {
      const yamlPath = join(testDir, '.eslintrc.yaml')
      const ymlPath = join(testDir, '.eslintrc.yml')
      writeFileSync(yamlPath, 'rules:')
      writeFileSync(ymlPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(yamlPath)
    })

    test('should detect .eslintrc.yml when only yml present', async () => {
      const ymlPath = join(testDir, '.eslintrc.yml')
      writeFileSync(ymlPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(ymlPath)
    })

    test('should return full absolute path to config', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, '{}')

      const result = await detectESLintConfig(testDir)

      expect(result).toContain(testDir)
      expect(result).toContain('.eslintrc.json')
    })

    test('should handle package.json with null eslintConfig as falsy', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', eslintConfig: null }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBeNull()
    })

    test('should handle non-existent directory returning null', async () => {
      const nonExistentDir = join(tmpdir(), 'non-existent-dir-' + Date.now())
      const result = await detectESLintConfig(nonExistentDir)

      expect(result).toBeNull()
    })

    test('should detect .eslintrc.json with complex content', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          extends: ['eslint:recommended'],
          rules: {
            complexity: ['error', { max: 20 }],
            'max-depth': 'warn',
          },
          overrides: [
            {
              files: ['*.ts'],
              rules: { '@typescript-eslint/no-explicit-any': 'error' },
            },
          ],
        }),
      )

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(configPath)
    })

    test('should detect first config when all types present', async () => {
      writeFileSync(join(testDir, '.eslintrc.json'), '{}')
      writeFileSync(join(testDir, '.eslintrc.js'), 'module.exports = {};')
      writeFileSync(join(testDir, '.eslintrc.cjs'), 'module.exports = {};')
      writeFileSync(join(testDir, '.eslintrc.mjs'), 'export default {};')
      writeFileSync(join(testDir, '.eslintrc.yaml'), 'rules:')
      writeFileSync(join(testDir, '.eslintrc.yml'), 'rules:')
      writeFileSync(join(testDir, '.eslintrc'), '{}')
      writeFileSync(join(testDir, 'package.json'), JSON.stringify({ eslintConfig: {} }))

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(join(testDir, '.eslintrc.json'))
    })

    test('should handle readESLintConfig after detectESLintConfig', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ rules: { complexity: 'error' } }))

      const detected = await detectESLintConfig(testDir)
      expect(detected).toBe(configPath)

      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()
      expect(config?.rules?.complexity).toBe('error')
    })

    test('should handle full migration workflow from detected config', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            complexity: 'error',
            'max-depth': 'warn',
            'prefer-const': 'error',
            'custom-rule': 'error',
          },
        }),
      )

      const detected = await detectESLintConfig(testDir)
      expect(detected).not.toBeNull()

      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()

      const result = migrateESLintConfig(config!)
      expect(result.source).toBe('eslint')
      expect(result.rules['max-complexity']).toBe('error')
      expect(result.rules['max-depth']).toBe('warning')
      expect(result.rules['prefer-const']).toBe('error')
      expect(result.unmapped).toContain('custom-rule')
    })

    test('should handle migration of YAML detected config', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, 'rules:\n  complexity: error\n  max-depth: 1')

      const detected = await detectESLintConfig(testDir)
      expect(detected).toBe(configPath)

      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()

      const result = migrateESLintConfig(config!)
      expect(result.source).toBe('eslint')
      expect(result.rules).toBeDefined()
    })

    test('should return null for readESLintConfig with JS detected config', async () => {
      const configPath = join(testDir, '.eslintrc.js')
      writeFileSync(configPath, 'module.exports = { rules: { complexity: "error" } };')

      const detected = await detectESLintConfig(testDir)
      expect(detected).toBe(configPath)

      const config = await readESLintConfig(detected!)
      expect(config).toBeNull()
    })

    test('should handle package.json config detection and reading', async () => {
      const packageJsonPath = join(testDir, 'package.json')
      writeFileSync(
        packageJsonPath,
        JSON.stringify({
          name: 'test-project',
          eslintConfig: { rules: { complexity: 'error' } },
        }),
      )

      const detected = await detectESLintConfig(testDir)
      expect(detected).toBe(packageJsonPath)

      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()
    })

    test('should handle empty YAML file detection and reading', async () => {
      const configPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(configPath, '')

      const detected = await detectESLintConfig(testDir)
      expect(detected).toBe(configPath)

      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()
    })

    test('should handle migration with no rules in detected config', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(configPath, JSON.stringify({ extends: 'eslint:recommended' }))

      const detected = await detectESLintConfig(testDir)
      const config = await readESLintConfig(detected!)
      expect(config).not.toBeNull()

      const result = migrateESLintConfig(config!)
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('eslint')
    })

    test('should handle migration of complex config with overrides', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            complexity: ['error', { max: 15 }],
            'max-lines': 'error',
            'unknown-rule': 'warn',
          },
          overrides: [
            {
              files: ['src/**/*.ts'],
              rules: {
                complexity: 'warn',
                '@typescript-eslint/no-explicit-any': 'error',
              },
            },
          ],
        }),
      )

      const detected = await detectESLintConfig(testDir)
      const config = await readESLintConfig(detected!)
      const result = migrateESLintConfig(config!)

      expect(result.rules['max-complexity']).toBe('warning')
      expect(result.rules['max-lines']).toBe('error')
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
      expect(result.unmapped).toContain('unknown-rule')
    })

    test('should detect higher priority config among lower ones', async () => {
      const cjsPath = join(testDir, '.eslintrc.cjs')
      const yamlPath = join(testDir, '.eslintrc.yaml')
      writeFileSync(cjsPath, 'module.exports = {};')
      writeFileSync(yamlPath, 'rules:')

      const result = await detectESLintConfig(testDir)

      expect(result).toBe(cjsPath)
    })

    test('should handle very large JSON config file', async () => {
      const configPath = join(testDir, '.eslintrc.json')
      const rules: Record<string, string> = {}
      for (let i = 0; i < 100; i++) {
        rules[`rule-${i}`] = 'error'
      }
      writeFileSync(configPath, JSON.stringify({ rules }))

      const result = await readESLintConfig(configPath)

      expect(result).not.toBeNull()
      expect(Object.keys(result?.rules ?? {})).toHaveLength(100)
    })
  })
})
