import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateESLintConfig,
  readESLintConfig,
  detectESLintConfig,
} from '../../../src/core/migrators/eslint.js'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtempSync } from 'node:fs'

describe('migrateESLintConfig', () => {
  test('empty config returns empty rules and empty unmapped', () => {
    const result = migrateESLintConfig({})
    expect(result.rules).toEqual({})
    expect(result.unmapped).toEqual([])
  })

  test('config with empty rules object returns empty result', () => {
    const result = migrateESLintConfig({ rules: {} })
    expect(result.rules).toEqual({})
    expect(result.unmapped).toEqual([])
  })

  test('config with mapped rules converts correctly', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'error',
        'prefer-const': 'warn',
        complexity: 2,
      },
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.rules['max-complexity']).toBe('error')
  })

  test('unmapped rules appear in unmapped array', () => {
    const result = migrateESLintConfig({
      rules: {
        'some-random-rule': 'error',
        'no-eval': 'error',
      },
    })
    expect(result.unmapped).toEqual(['some-random-rule'])
    expect(result.rules['no-eval']).toBe('error')
  })

  test('multiple unmapped rules all appear in unmapped', () => {
    const result = migrateESLintConfig({
      rules: {
        'rule-a': 'error',
        'rule-b': 'warn',
        'rule-c': 2,
      },
    })
    expect(result.unmapped).toEqual(['rule-a', 'rule-b', 'rule-c'])
  })

  test('disabled rule with severity "off" is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'off' },
    })
    expect(result.rules['no-eval']).toBeUndefined()
    expect(Object.keys(result.rules)).toHaveLength(0)
  })

  test('disabled rule with numeric 0 is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 0 },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('disabled rule with string "0" is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': '0' },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('numeric severity 2 maps to "error"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 2 },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('numeric severity 1 maps to "warning"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 1 },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('numeric severity 3 is excluded (invalid)', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 3 as unknown as 0 | 1 | 2 },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('string "error" maps to "error"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('string "warn" maps to "warning"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'warn' },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('string "warning" maps to "warning"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'warning' },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('string "2" maps to "error"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': '2' },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('string "1" maps to "warning"', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': '1' },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('array config [2, { max: 4 }] produces rule with options', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [2, { max: 4 }] },
    })
    expect(result.rules['max-complexity']).toEqual(['error', { max: 4 }])
  })

  test('array config [1] produces warning without options', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [1] },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('array config ["error", { max: 4 }] with string severity produces rule with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['error', { max: 4 }] },
    })
    expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
  })

  test('empty array config [] is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('array config with non-object second element excludes options', () => {
    const result = migrateESLintConfig({
      rules: { complexity: ['error', 'not-an-object' as unknown as Record<string, unknown>] },
    })
    expect(result.rules['max-complexity']).toBe('error')
  })

  test('array config [0, { max: 4 }] with off severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [0, { max: 4 }] as unknown as [string, Record<string, unknown>] },
    })
    expect(result.rules['max-complexity']).toBeUndefined()
  })

  test('overrides merge additional rules', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: { 'prefer-const': 'warn' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
  })

  test('override rules override base rules', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'warn' },
      overrides: [{ rules: { 'no-eval': 'error' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('multiple overrides merge in order', () => {
    const result = migrateESLintConfig({
      rules: { complexity: 'error' },
      overrides: [{ rules: { 'prefer-const': 'warn' } }, { rules: { 'max-depth': 'error' } }],
    })
    expect(result.rules['max-complexity']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.rules['max-depth']).toBe('error')
  })

  test('overrides with later entry override earlier ones', () => {
    const result = migrateESLintConfig({
      overrides: [{ rules: { 'no-eval': 'warn' } }, { rules: { 'no-eval': 'error' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('mixed mapped and unmapped rules split correctly', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'error',
        'custom-rule': 'error',
        'prefer-const': 'warn',
        'unknown-rule': 2,
      },
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.unmapped).toEqual(['custom-rule', 'unknown-rule'])
  })

  test('source is always eslint', () => {
    const result = migrateESLintConfig({})
    expect(result.source).toBe('eslint')
  })

  test('TypeScript rules map to no-unsafe-type-assertion', () => {
    const result = migrateESLintConfig({
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
  })

  test('multiple TypeScript rules mapping to same CodeForge rule: last wins', () => {
    const result = migrateESLintConfig({
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
      },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
  })

  test('null severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': null as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('undefined severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': undefined as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('all complexity rules map correctly', () => {
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

  test('security rules map correctly', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
      },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('override with unmapped rules adds to unmapped', () => {
    const result = migrateESLintConfig({
      overrides: [{ rules: { 'unknown-override-rule': 'error' } }],
    })
    expect(result.unmapped).toEqual(['unknown-override-rule'])
  })

  test('override with empty rules object does not affect result', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: {} }],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('override without rules field does not affect result', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{}],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('performance rule no-await-in-loop maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'no-await-in-loop': 'error' },
    })
    expect(result.rules['no-await-in-loop']).toBe('error')
  })

  test('performance rule prefer-object-spread maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-object-spread': 'warn' },
    })
    expect(result.rules['prefer-object-spread']).toBe('warning')
  })

  test('performance rule prefer-optional-chaining maps to prefer-optional-chain', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-optional-chaining': 'error' },
    })
    expect(result.rules['prefer-optional-chain']).toBe('error')
  })

  test('all performance rules map correctly', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-await-in-loop': 2,
        'no-sync-in-async': 'warn',
        'prefer-object-spread': 'error',
        'prefer-optional-chaining': 'error',
      },
    })
    expect(result.rules['no-await-in-loop']).toBe('error')
    expect(result.rules['no-sync-in-async']).toBe('warning')
    expect(result.rules['prefer-object-spread']).toBe('error')
    expect(result.rules['prefer-optional-chain']).toBe('error')
  })

  test('@typescript-eslint/no-unsafe-member-access maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { '@typescript-eslint/no-unsafe-member-access': 'error' },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
  })

  test('@typescript-eslint/no-unsafe-call maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { '@typescript-eslint/no-unsafe-call': 'warn' },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
  })

  test('@typescript-eslint/no-unsafe-return maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { '@typescript-eslint/no-unsafe-return': 2 },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
  })

  test('unmapped scoped plugin rule with @ prefix', () => {
    const result = migrateESLintConfig({
      rules: { '@custom-plugin/some-rule': 'error' },
    })
    expect(result.unmapped).toEqual(['@custom-plugin/some-rule'])
    expect(Object.keys(result.rules)).toHaveLength(0)
  })

  test('boolean true severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': true as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('boolean false severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': false as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('negative numeric severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': -1 as unknown as 0 | 1 | 2 },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('large numeric severity 99 is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 99 as unknown as 0 | 1 | 2 },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('empty overrides array does not affect result', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.unmapped).toEqual([])
  })

  test('config with only overrides and no base rules', () => {
    const result = migrateESLintConfig({
      overrides: [{ rules: { 'prefer-const': 'error' } }],
    })
    expect(result.rules['prefer-const']).toBe('error')
    expect(result.unmapped).toEqual([])
  })

  test('result object has exactly three keys: rules, source, unmapped', () => {
    const result = migrateESLintConfig({})
    expect(Object.keys(result).sort()).toEqual(['rules', 'source', 'unmapped'].sort())
  })

  test('many rules mixed mapped and unmapped handles all correctly', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'error',
        'prefer-const': 'warn',
        complexity: 2,
        'max-depth': 1,
        'custom-a': 'error',
        'custom-b': 'warn',
        '@typescript-eslint/no-explicit-any': 'error',
        'no-await-in-loop': 'error',
        'custom-c': 0,
      },
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.rules['max-complexity']).toBe('error')
    expect(result.rules['max-depth']).toBe('warning')
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    expect(result.rules['no-await-in-loop']).toBe('error')
    expect(result.unmapped).toEqual(['custom-a', 'custom-b', 'custom-c'])
  })

  test('no-implied-eval maps to no-eval (shared target)', () => {
    const result = migrateESLintConfig({
      rules: { 'no-implied-eval': 'error' },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('no-new-func maps to no-eval (shared target)', () => {
    const result = migrateESLintConfig({
      rules: { 'no-new-func': 'warn' },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('array config with 3 elements uses first two', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [2, { max: 10 }, 'extra' as unknown as Record<string, unknown>] },
    })
    expect(result.rules['max-complexity']).toEqual(['error', { max: 10 }])
  })

  test('array config ["warn", { max: 3 }] produces warning with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['warn', { max: 3 }] },
    })
    expect(result.rules['max-params']).toEqual(['warning', { max: 3 }])
  })

  test('no-sync-in-async maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'no-sync-in-async': 'error' },
    })
    expect(result.rules['no-sync-in-async']).toBe('error')
  })

  test('override disabling a base rule removes it from result', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: { 'no-eval': 'off' } }],
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('both base and override contribute unmapped rules', () => {
    const result = migrateESLintConfig({
      rules: { 'base-unknown': 'error' },
      overrides: [{ rules: { 'override-unknown': 'warn' } }],
    })
    expect(result.unmapped).toEqual(['base-unknown', 'override-unknown'])
  })

  test('array config with [1, { max: 4 }] produces warning with options', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [1, { max: 4 }] },
    })
    expect(result.rules['max-complexity']).toEqual(['warning', { max: 4 }])
  })

  test('config with extends field ignores extends and processes rules', () => {
    const result = migrateESLintConfig({
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: { 'no-eval': 'error', 'prefer-const': 'warn' },
    } as Parameters<typeof migrateESLintConfig>[0])
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.unmapped).toEqual([])
  })

  test('array config with ["2", { max: 4 }] string numeric severity with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['2', { max: 4 }] },
    })
    expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
  })

  test('array config ["0", { max: 4 }] string zero severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['0', { max: 4 }] as unknown as [string, Record<string, unknown>] },
    })
    expect(result.rules['max-params']).toBeUndefined()
  })

  test('array config ["1", { max: 3 }] string one severity produces warning with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['1', { max: 3 }] },
    })
    expect(result.rules['max-params']).toEqual(['warning', { max: 3 }])
  })

  test('array config ["off", { max: 4 }] off severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['off', { max: 4 }] as unknown as [string, Record<string, unknown>] },
    })
    expect(result.rules['max-params']).toBeUndefined()
  })

  test('array config ["warn", { max: 2 }] produces warning with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': ['warn', { max: 2 }] },
    })
    expect(result.rules['max-params']).toEqual(['warning', { max: 2 }])
  })

  test('object severity {} is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': {} as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('prefer-const maps to prefer-const (identity mapping)', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-const': 'error' },
    })
    expect(result.rules['prefer-const']).toBe('error')
  })

  test('max-lines-per-function maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'max-lines-per-function': 'warn' },
    })
    expect(result.rules['max-lines-per-function']).toBe('warning')
  })

  test('all three security rules mapping to no-eval: last override wins', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'warn',
        'no-implied-eval': 'error',
        'no-new-func': 'warn',
      },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('config where all rules are disabled produces empty result', () => {
    const result = migrateESLintConfig({
      rules: {
        'no-eval': 'off',
        'prefer-const': 0,
        complexity: '0',
      },
    })
    expect(Object.keys(result.rules)).toHaveLength(0)
    expect(result.unmapped).toEqual([])
  })

  test('array with empty object as second element produces severity without options', () => {
    const result = migrateESLintConfig({
      rules: { complexity: ['error', {}] },
    })
    expect(result.rules['max-complexity']).toBe('error')
  })

  test('array with nested options object preserves full options', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [2, { max: 10, allow: ['foo', 'bar'] }] },
    })
    expect(result.rules['max-complexity']).toEqual(['error', { max: 10, allow: ['foo', 'bar'] }])
  })

  test('base disabled rule re-enabled by override', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'off' },
      overrides: [{ rules: { 'no-eval': 'error' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('config with only extends field produces empty result', () => {
    const result = migrateESLintConfig({
      extends: ['eslint:recommended'],
    } as Parameters<typeof migrateESLintConfig>[0])
    expect(result.rules).toEqual({})
    expect(result.unmapped).toEqual([])
    expect(result.source).toBe('eslint')
  })

  test('multiple overrides each contribute different unmapped rules', () => {
    const result = migrateESLintConfig({
      overrides: [
        { rules: { 'unknown-a': 'error' } },
        { rules: { 'no-eval': 'error', 'unknown-b': 'warn' } },
      ],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.unmapped).toEqual(['unknown-a', 'unknown-b'])
  })

  test('array config [2] single numeric element maps to error', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [2] as unknown as string },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('array config ["error"] single string element maps to error', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['error'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('array config [1] single numeric element maps to warning', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-const': [1] as unknown as string },
    })
    expect(result.rules['prefer-const']).toBe('warning')
  })

  test('array config ["warn"] single string element maps to warning', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-const': ['warn'] as unknown as string },
    })
    expect(result.rules['prefer-const']).toBe('warning')
  })

  test('array config ["2"] single string numeric element maps to error', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['2'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('array config ["1"] single string numeric element maps to warning', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['1'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('array config ["off"] single string element is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['off'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('array config [0] single numeric element is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [0] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('config with max-lines rule maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'max-lines': 'error' },
    })
    expect(result.rules['max-lines']).toBe('error')
  })

  test('config with max-depth with array options preserves options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-depth': ['error', { max: 4 }] },
    })
    expect(result.rules['max-depth']).toEqual(['error', { max: 4 }])
  })

  test('config with max-lines with array options preserves options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-lines': ['warn', { max: 300 }] },
    })
    expect(result.rules['max-lines']).toEqual(['warning', { max: 300 }])
  })

  test('config with max-params with array options preserves options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-params': [2, { max: 3 }] },
    })
    expect(result.rules['max-params']).toEqual(['error', { max: 3 }])
  })

  test('config with max-lines-per-function with array options preserves options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-lines-per-function': ['error', { max: 50 }] },
    })
    expect(result.rules['max-lines-per-function']).toEqual(['error', { max: 50 }])
  })

  test('array config with multiple option keys preserves all', () => {
    const result = migrateESLintConfig({
      rules: { complexity: ['error', { max: 10, min: 1 }] },
    })
    expect(result.rules['max-complexity']).toEqual(['error', { max: 10, min: 1 }])
  })

  test('three overrides chain: last override wins', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'warn' },
      overrides: [{ rules: { 'no-eval': 'error' } }, { rules: { 'no-eval': 'warn' } }],
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('override sets rule off then another override re-enables', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: { 'no-eval': 'off' } }, { rules: { 'no-eval': 'warn' } }],
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('base rule with options, override changes only severity', () => {
    const result = migrateESLintConfig({
      rules: { complexity: ['error', { max: 10 }] },
      overrides: [{ rules: { complexity: 'warn' } }],
    })
    expect(result.rules['max-complexity']).toBe('warning')
  })

  test('config with all five typescript-eslint rules maps to no-unsafe-type-assertion', () => {
    const result = migrateESLintConfig({
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'error',
      },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
  })

  test('config with all known mapped rules at once', () => {
    const result = migrateESLintConfig({
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        complexity: 'error',
        'max-depth': 'error',
        'max-lines': 'error',
        'max-lines-per-function': 'error',
        'max-params': 'error',
        'no-await-in-loop': 'error',
        'no-sync-in-async': 'error',
        'prefer-object-spread': 'error',
        'prefer-optional-chaining': 'error',
        'prefer-const': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
      },
    })
    expect(Object.keys(result.rules)).toHaveLength(12)
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    expect(result.rules['max-complexity']).toBe('error')
    expect(result.rules['max-depth']).toBe('error')
    expect(result.rules['max-lines']).toBe('error')
    expect(result.rules['max-lines-per-function']).toBe('error')
    expect(result.rules['max-params']).toBe('error')
    expect(result.rules['no-await-in-loop']).toBe('error')
    expect(result.rules['no-sync-in-async']).toBe('error')
    expect(result.rules['prefer-object-spread']).toBe('error')
    expect(result.rules['prefer-optional-chain']).toBe('error')
    expect(result.rules['prefer-const']).toBe('error')
    expect(result.rules['no-eval']).toBe('error')
  })

  test('single override with multiple mapped rules', () => {
    const result = migrateESLintConfig({
      overrides: [
        {
          rules: {
            'no-eval': 'error',
            'prefer-const': 'warn',
            complexity: 2,
            'max-depth': 1,
          },
        },
      ],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.rules['max-complexity']).toBe('error')
    expect(result.rules['max-depth']).toBe('warning')
  })

  test('duplicate unmapped rule in base and override appears once after merge', () => {
    const result = migrateESLintConfig({
      rules: { 'custom-rule': 'error' },
      overrides: [{ rules: { 'custom-rule': 'warn' } }],
    })
    expect(result.unmapped).toEqual(['custom-rule'])
  })

  test('rule name that is prefix of mapped rule is unmapped', () => {
    const result = migrateESLintConfig({
      rules: { complex: 'error' },
    })
    expect(result.unmapped).toEqual(['complex'])
    expect(Object.keys(result.rules)).toHaveLength(0)
  })

  test('rule name with mapped rule as prefix is unmapped', () => {
    const result = migrateESLintConfig({
      rules: { 'complexity-extra': 'error' },
    })
    expect(result.unmapped).toEqual(['complexity-extra'])
    expect(Object.keys(result.rules)).toHaveLength(0)
  })

  test('config with only unmapped rules produces empty mapped rules', () => {
    const result = migrateESLintConfig({
      rules: {
        'custom-a': 'error',
        'custom-b': 'warn',
        'custom-c': 2,
        '@scope/rule': 'error',
      },
    })
    expect(Object.keys(result.rules)).toHaveLength(0)
    expect(result.unmapped).toHaveLength(4)
  })

  test('many overrides where one is empty does not break processing', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'warn' },
      overrides: [{}, { rules: { 'no-eval': 'error' } }, {}],
    })
    expect(result.rules['no-eval']).toBe('error')
  })

  test('unmapped rule in override does not affect base mapped rule', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: { 'custom-unknown': 'error' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.unmapped).toEqual(['custom-unknown'])
  })

  test('array config with complex nested options preserves full structure', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [2, { max: 10, allow: ['foo', 'bar'], ignore: ['baz'] }] },
    })
    expect(result.rules['max-complexity']).toEqual([
      'error',
      { max: 10, allow: ['foo', 'bar'], ignore: ['baz'] },
    ])
  })

  test('float severity is excluded (not 0, 1, or 2)', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 1.5 as unknown as 0 | 1 | 2 },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('empty string severity is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': '' as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('max-depth maps to max-depth (identity)', () => {
    const result = migrateESLintConfig({
      rules: { 'max-depth': 2 },
    })
    expect(result.rules['max-depth']).toBe('error')
  })

  test('max-lines maps to max-lines (identity)', () => {
    const result = migrateESLintConfig({
      rules: { 'max-lines': 1 },
    })
    expect(result.rules['max-lines']).toBe('warning')
  })

  test('prefer-object-spread with numeric severity', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-object-spread': 2 },
    })
    expect(result.rules['prefer-object-spread']).toBe('error')
  })

  test('config with rules having null in array is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [null] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('override adds unmapped to existing base unmapped', () => {
    const result = migrateESLintConfig({
      rules: { 'base-unknown': 'error', 'no-eval': 'error' },
      overrides: [{ rules: { 'override-unknown': 'warn' } }],
    })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.unmapped).toEqual(['base-unknown', 'override-unknown'])
  })

  test('config with deeply nested empty overrides array produces empty result', () => {
    const result = migrateESLintConfig({
      overrides: [{}, {}, {}],
    })
    expect(result.rules).toEqual({})
    expect(result.unmapped).toEqual([])
  })

  test('case sensitive severity "Error" is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'Error' as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('case sensitive severity "Warn" is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'Warn' as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('case sensitive severity "OFF" is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'OFF' as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('no-sync-in-async with numeric severity maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'no-sync-in-async': 2 },
    })
    expect(result.rules['no-sync-in-async']).toBe('error')
  })

  test('prefer-optional-chaining with warn severity maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-optional-chaining': 'warn' },
    })
    expect(result.rules['prefer-optional-chain']).toBe('warning')
  })

  test('prefer-optional-chaining with numeric severity 1 maps correctly', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-optional-chaining': 1 },
    })
    expect(result.rules['prefer-optional-chain']).toBe('warning')
  })

  test('override with same mapped target as base rule overwrites', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
      overrides: [{ rules: { 'no-implied-eval': 'warn' } }],
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('string "warning" severity in array config', () => {
    const result = migrateESLintConfig({
      rules: { complexity: ['warning', { max: 5 }] },
    })
    expect(result.rules['max-complexity']).toEqual(['warning', { max: 5 }])
  })

  test('string "2" severity in array config with options', () => {
    const result = migrateESLintConfig({
      rules: { 'max-depth': ['2', { max: 3 }] },
    })
    expect(result.rules['max-depth']).toEqual(['error', { max: 3 }])
  })

  test('base mapped rule, override disables, third override re-enables', () => {
    const result = migrateESLintConfig({
      rules: { 'prefer-const': 'error' },
      overrides: [{ rules: { 'prefer-const': 'off' } }, { rules: { 'prefer-const': 'warn' } }],
    })
    expect(result.rules['prefer-const']).toBe('warning')
  })

  test('rule with array containing undefined first element is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': [undefined] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('migration result rules is a new object each call', () => {
    const result1 = migrateESLintConfig({ rules: { 'no-eval': 'error' } })
    const result2 = migrateESLintConfig({ rules: { 'no-eval': 'error' } })
    expect(result1.rules).toEqual(result2.rules)
    expect(result1.rules).not.toBe(result2.rules)
  })

  test('migration result unmapped is a new array each call', () => {
    const result1 = migrateESLintConfig({ rules: { unknown: 'error' } })
    const result2 = migrateESLintConfig({ rules: { unknown: 'error' } })
    expect(result1.unmapped).toEqual(result2.unmapped)
    expect(result1.unmapped).not.toBe(result2.unmapped)
  })

  test('config with env and parser fields does not affect migration', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': 'error' },
    } as Parameters<typeof migrateESLintConfig>[0] & Record<string, unknown>)
    expect(result.rules['no-eval']).toBe('error')
  })

  test('severity 0 in array with options is excluded', () => {
    const result = migrateESLintConfig({
      rules: { complexity: [0, { max: 5 }] as unknown as [string, Record<string, unknown>] },
    })
    expect(result.rules['max-complexity']).toBeUndefined()
  })

  test('array config ["0"] string zero single element is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['0'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('numeric severity with unmapped rule still appears in unmapped', () => {
    const result = migrateESLintConfig({
      rules: { 'my-custom-rule': 2 },
    })
    expect(result.unmapped).toEqual(['my-custom-rule'])
  })

  test('no-new-func with numeric severity maps to no-eval', () => {
    const result = migrateESLintConfig({
      rules: { 'no-new-func': 1 },
    })
    expect(result.rules['no-eval']).toBe('warning')
  })

  test('@typescript-eslint/no-explicit-any with warn severity', () => {
    const result = migrateESLintConfig({
      rules: { '@typescript-eslint/no-explicit-any': 'warn' },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
  })

  test('@typescript-eslint/no-unsafe-assignment with numeric 2', () => {
    const result = migrateESLintConfig({
      rules: { '@typescript-eslint/no-unsafe-assignment': 2 },
    })
    expect(result.rules['no-unsafe-type-assertion']).toBe('error')
  })

  test('array config with non-standard severity string is excluded', () => {
    const result = migrateESLintConfig({
      rules: { 'no-eval': ['maybe'] as unknown as string },
    })
    expect(result.rules['no-eval']).toBeUndefined()
  })

  test('config with very many rules processes all correctly', () => {
    const rules: Record<string, unknown> = {}
    for (let i = 0; i < 50; i++) {
      rules[`custom-rule-${i}`] = 'error'
    }
    rules['no-eval'] = 'error'
    rules['prefer-const'] = 'warn'
    const result = migrateESLintConfig({ rules })
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('warning')
    expect(result.unmapped).toHaveLength(50)
  })
})

describe('readESLintConfig', () => {
  let testDir: string

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'codeforge-read-'))
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  test('reads JSON config file with rules', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { complexity: 'error' } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.complexity).toBe('error')
  })

  test('returns null for non-existent file', async () => {
    const result = await readESLintConfig(join(testDir, 'nonexistent.json'))
    expect(result).toBeNull()
  })

  test('returns null for JS config file', async () => {
    const configPath = join(testDir, '.eslintrc.js')
    writeFileSync(configPath, 'module.exports = { rules: {} };')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('returns null for CJS config file', async () => {
    const configPath = join(testDir, '.eslintrc.cjs')
    writeFileSync(configPath, 'module.exports = { rules: {} };')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('returns null for MJS config file', async () => {
    const configPath = join(testDir, '.eslintrc.mjs')
    writeFileSync(configPath, 'export default { rules: {} };')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('parses basic YAML config returns config object', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'rules:\n  complexity: 2\n  max-depth: 1')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeDefined()
  })

  test('parses YML config with rules', async () => {
    const configPath = join(testDir, '.eslintrc.yml')
    writeFileSync(configPath, 'rules:\n  no-eval: error')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeDefined()
  })

  test('returns null for invalid JSON', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, 'not valid json')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('JSON with no rules returns valid config', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ env: { browser: true } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeUndefined()
  })

  test('JSON with overrides preserves overrides', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        overrides: [{ rules: { 'no-eval': 'error' } }],
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.overrides).toHaveLength(1)
  })

  test('returns null for unknown file extension', async () => {
    const configPath = join(testDir, '.eslintrc.toml')
    writeFileSync(configPath, '[rules]\ncomplexity = "error"')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('returns null for empty JSON file', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, '')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('JSON with extends preserves extends field', async () => {
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
    expect(result?.extends).toEqual(['eslint:recommended'])
  })

  test('JSON with single string extends preserves it', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        extends: 'eslint:recommended',
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.extends).toBe('eslint:recommended')
  })

  test('empty YAML file returns config with empty rules', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, '')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toEqual({})
  })

  test('JSON with deeply nested config preserves structure', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        env: { browser: true, node: true },
        parserOptions: { ecmaVersion: 2022 },
        rules: { 'no-eval': 'error' },
        overrides: [{ files: ['*.ts'], rules: { 'prefer-const': 'warn' } }],
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
    expect(result?.overrides).toHaveLength(1)
  })

  test('YAML config with string severity parses at least one rule', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'rules:\n  no-eval: error')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeDefined()
  })

  test('YAML config with top-level non-rules section still returns config', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'env:\n  browser: true\nrules:\n  no-eval: error')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
  })

  test('JSON with empty rules object preserves other fields', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: {}, env: { es6: true } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toEqual({})
  })

  test('JSON config with array extends field preserves it', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
        rules: {},
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.extends).toHaveLength(2)
  })

  test('JSON config with whitespace and newlines parses correctly', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, '  {  \n  "rules"  :  {  "no-eval"  :  "error"  }  \n  }  ')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
  })

  test('JSON config with plugins field preserves it', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        plugins: ['@typescript-eslint', 'import'],
        rules: { 'no-eval': 'error' },
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
  })

  test('YAML config with numeric severity parses correctly', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'rules:\n  complexity: 2\n  max-depth: 1')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeDefined()
  })

  test('YAML config with env and rules sections parses', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'env:\n  browser: true\nrules:\n  no-eval: error')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules).toBeDefined()
  })

  test('JSON with array-based rule config parses correctly', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { complexity: ['error', { max: 10 }] } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.complexity).toEqual(['error', { max: 10 }])
  })

  test('JSON with overrides containing rules parses correctly', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        rules: { 'no-eval': 'error' },
        overrides: [{ files: ['*.ts'], rules: { 'prefer-const': 'warn' } }],
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.overrides?.[0]?.rules?.['prefer-const']).toBe('warn')
  })

  test('JSON with null top-level rules value returns config', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: null }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
  })

  test('JSON with env parser plugins and rules preserves all', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        env: { browser: true, node: true, es2022: true },
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint', 'import', 'prettier'],
        rules: { 'no-eval': 'error', 'prefer-const': 'warn' },
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
    expect(result?.rules?.['prefer-const']).toBe('warn')
  })

  test('JSON with comments should fail to parse', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, '{ /* comment */ "rules": {} }')
    const result = await readESLintConfig(configPath)
    expect(result).toBeNull()
  })

  test('JSON config reads max-depth rule', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { 'max-depth': 'error' } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['max-depth']).toBe('error')
  })

  test('JSON config reads multiple mapped rules', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        rules: {
          'no-eval': 'error',
          'prefer-const': 'warn',
          complexity: 2,
        },
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
    expect(result?.rules?.['prefer-const']).toBe('warn')
    expect(result?.rules?.complexity).toBe(2)
  })

  test('YAML config with env section only returns config', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'env:\n  browser: true')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
  })

  test('JSON with rules containing array numeric configs', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({ rules: { complexity: [2, { max: 5 }], 'max-params': [1, { max: 3 }] } }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.complexity).toEqual([2, { max: 5 }])
  })

  test('JSON config with numeric severity values preserves them', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({ rules: { 'no-eval': 0, 'prefer-const': 1, complexity: 2 } }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe(0)
    expect(result?.rules?.['prefer-const']).toBe(1)
    expect(result?.rules?.complexity).toBe(2)
  })

  test('JSON config with boolean values in rules preserves them', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { 'no-eval': true, 'prefer-const': false } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe(true)
    expect(result?.rules?.['prefer-const']).toBe(false)
  })

  test('JSON config with single override containing multiple rules', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        overrides: [
          {
            files: ['*.ts'],
            rules: { 'no-eval': 'error', 'prefer-const': 'warn', complexity: 2 },
          },
        ],
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.overrides?.[0]?.rules?.['no-eval']).toBe('error')
    expect(result?.overrides?.[0]?.rules?.['prefer-const']).toBe('warn')
  })

  test('JSON config with off severity rules preserves them', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { 'no-eval': 'off', 'prefer-const': 0 } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('off')
  })

  test('JSON config with very large rules object parses correctly', async () => {
    const rules: Record<string, string> = {}
    for (let i = 0; i < 100; i++) {
      rules[`custom-rule-${i}`] = 'error'
    }
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(Object.keys(result?.rules ?? {})).toHaveLength(100)
  })

  test('YAML config with only whitespace lines returns config', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, '   \n   \n')
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
  })

  test('JSON config file path in directory with spaces', async () => {
    const spacedDir = join(testDir, 'path with spaces')
    mkdirSync(spacedDir, { recursive: true })
    const configPath = join(spacedDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: { 'no-eval': 'error' } }))
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
  })

  test('JSON config with unicode characters in rule names', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({ rules: { 'no-eval': 'error', 'règle-spéciale': 'warn' } }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.rules?.['no-eval']).toBe('error')
    expect(result?.rules?.['règle-spéciale']).toBe('warn')
  })

  test('JSON config with multiple overrides preserves all', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(
      configPath,
      JSON.stringify({
        overrides: [
          { files: ['*.ts'], rules: { 'no-eval': 'error' } },
          { files: ['*.js'], rules: { 'prefer-const': 'warn' } },
        ],
      }),
    )
    const result = await readESLintConfig(configPath)
    expect(result).not.toBeNull()
    expect(result?.overrides).toHaveLength(2)
  })
})

describe('detectESLintConfig', () => {
  let testDir: string

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'codeforge-detect-'))
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  test('detects .eslintrc.json', async () => {
    const configPath = join(testDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: {} }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('detects .eslintrc.js', async () => {
    const configPath = join(testDir, '.eslintrc.js')
    writeFileSync(configPath, 'module.exports = {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('returns null for directory with no config', async () => {
    const result = await detectESLintConfig(testDir)
    expect(result).toBeNull()
  })

  test('detects package.json with eslintConfig', async () => {
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

  test('returns null when package.json lacks eslintConfig', async () => {
    const packageJsonPath = join(testDir, 'package.json')
    writeFileSync(packageJsonPath, JSON.stringify({ name: 'test' }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBeNull()
  })

  test('.eslintrc.json takes priority over .eslintrc.js', async () => {
    const jsonPath = join(testDir, '.eslintrc.json')
    const jsPath = join(testDir, '.eslintrc.js')
    writeFileSync(jsonPath, JSON.stringify({ rules: {} }))
    writeFileSync(jsPath, 'module.exports = {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsonPath)
  })

  test('.eslintrc.json takes priority over package.json with eslintConfig', async () => {
    const jsonPath = join(testDir, '.eslintrc.json')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(jsonPath, JSON.stringify({ rules: {} }))
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsonPath)
  })

  test('.eslintrc.js takes priority over .eslintrc.yaml', async () => {
    const jsPath = join(testDir, '.eslintrc.js')
    const yamlPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(jsPath, 'module.exports = {};')
    writeFileSync(yamlPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsPath)
  })

  test('detects .eslintrc.yaml', async () => {
    const configPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(configPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('detects .eslintrc.yml', async () => {
    const configPath = join(testDir, '.eslintrc.yml')
    writeFileSync(configPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('detects .eslintrc.cjs', async () => {
    const configPath = join(testDir, '.eslintrc.cjs')
    writeFileSync(configPath, 'module.exports = {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('detects .eslintrc.mjs', async () => {
    const configPath = join(testDir, '.eslintrc.mjs')
    writeFileSync(configPath, 'export default {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('returns null for non-existent directory', async () => {
    const result = await detectESLintConfig('/non/existent/directory/path')
    expect(result).toBeNull()
  })

  test('detects .eslintrc with no extension', async () => {
    const configPath = join(testDir, '.eslintrc')
    writeFileSync(configPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(configPath)
  })

  test('detects .eslintrc.cjs takes priority over .eslintrc.mjs', async () => {
    const cjsPath = join(testDir, '.eslintrc.cjs')
    const mjsPath = join(testDir, '.eslintrc.mjs')
    writeFileSync(cjsPath, 'module.exports = {};')
    writeFileSync(mjsPath, 'export default {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(cjsPath)
  })

  test('detects .eslintrc.yaml takes priority over .eslintrc.yml', async () => {
    const yamlPath = join(testDir, '.eslintrc.yaml')
    const ymlPath = join(testDir, '.eslintrc.yml')
    writeFileSync(yamlPath, 'rules:')
    writeFileSync(ymlPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(yamlPath)
  })

  test('detects .eslintrc.json before .eslintrc.yaml', async () => {
    const jsonPath = join(testDir, '.eslintrc.json')
    const yamlPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(jsonPath, JSON.stringify({ rules: {} }))
    writeFileSync(yamlPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsonPath)
  })

  test('.eslintrc.js takes priority over .eslintrc.cjs', async () => {
    const jsPath = join(testDir, '.eslintrc.js')
    const cjsPath = join(testDir, '.eslintrc.cjs')
    writeFileSync(jsPath, 'module.exports = {};')
    writeFileSync(cjsPath, 'module.exports = {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsPath)
  })

  test('detects .eslintrc.json takes priority over .eslintrc with no extension', async () => {
    const jsonPath = join(testDir, '.eslintrc.json')
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(jsonPath, JSON.stringify({ rules: {} }))
    writeFileSync(rcPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsonPath)
  })

  test('.eslintrc.yaml takes priority over package.json with eslintConfig', async () => {
    const yamlPath = join(testDir, '.eslintrc.yaml')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(yamlPath, 'rules:')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(yamlPath)
  })

  test('detects .eslintrc with no extension when no other config exists', async () => {
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(rcPath, '{ "rules": { "no-eval": "error" } }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(rcPath)
  })

  test('.eslintrc takes priority over package.json with eslintConfig', async () => {
    const rcPath = join(testDir, '.eslintrc')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(rcPath, '{ "rules": {} }')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(rcPath)
  })

  test('.eslintrc.cjs takes priority over .eslintrc.yaml', async () => {
    const cjsPath = join(testDir, '.eslintrc.cjs')
    const yamlPath = join(testDir, '.eslintrc.yaml')
    writeFileSync(cjsPath, 'module.exports = {};')
    writeFileSync(yamlPath, 'rules:')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(cjsPath)
  })

  test('.eslintrc.js takes priority over .eslintrc.mjs', async () => {
    const jsPath = join(testDir, '.eslintrc.js')
    const mjsPath = join(testDir, '.eslintrc.mjs')
    writeFileSync(jsPath, 'module.exports = {};')
    writeFileSync(mjsPath, 'export default {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsPath)
  })

  test('detects only .eslintrc.yml when it is the sole config', async () => {
    const ymlPath = join(testDir, '.eslintrc.yml')
    writeFileSync(ymlPath, 'rules:\n  no-eval: error')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(ymlPath)
  })

  test('.eslintrc.yaml takes priority over .eslintrc with no extension', async () => {
    const yamlPath = join(testDir, '.eslintrc.yaml')
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(yamlPath, 'rules:')
    writeFileSync(rcPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(yamlPath)
  })

  test('.eslintrc.yml takes priority over .eslintrc with no extension', async () => {
    const ymlPath = join(testDir, '.eslintrc.yml')
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(ymlPath, 'rules:')
    writeFileSync(rcPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(ymlPath)
  })

  test('.eslintrc.cjs takes priority over .eslintrc with no extension', async () => {
    const cjsPath = join(testDir, '.eslintrc.cjs')
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(cjsPath, 'module.exports = {};')
    writeFileSync(rcPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(cjsPath)
  })

  test('.eslintrc.mjs has higher priority than .eslintrc with no extension', async () => {
    const mjsPath = join(testDir, '.eslintrc.mjs')
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(mjsPath, 'export default {};')
    writeFileSync(rcPath, '{ "rules": {} }')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(mjsPath)
  })

  test('.eslintrc with no extension takes priority over package.json', async () => {
    const rcPath = join(testDir, '.eslintrc')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(rcPath, '{ "rules": {} }')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(rcPath)
  })

  test('.eslintrc.mjs takes priority over package.json with eslintConfig', async () => {
    const mjsPath = join(testDir, '.eslintrc.mjs')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(mjsPath, 'export default {};')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(mjsPath)
  })

  test('.eslintrc.yml takes priority over package.json with eslintConfig', async () => {
    const ymlPath = join(testDir, '.eslintrc.yml')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(ymlPath, 'rules:')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(ymlPath)
  })

  test('detects package.json with eslintConfig containing rules', async () => {
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(
      pkgPath,
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        eslintConfig: { rules: { 'no-eval': 'error' } },
      }),
    )
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(pkgPath)
  })

  test('directory with non-config files returns null', async () => {
    writeFileSync(join(testDir, 'tsconfig.json'), '{}')
    writeFileSync(join(testDir, 'README.md'), '# Test')
    writeFileSync(join(testDir, 'index.ts'), 'export {}')
    const result = await detectESLintConfig(testDir)
    expect(result).toBeNull()
  })

  test('package.json with empty eslintConfig object is still detected', async () => {
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: {} }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(pkgPath)
  })

  test('all JS variants together: .js takes priority', async () => {
    const jsPath = join(testDir, '.eslintrc.js')
    const cjsPath = join(testDir, '.eslintrc.cjs')
    const mjsPath = join(testDir, '.eslintrc.mjs')
    writeFileSync(jsPath, 'module.exports = {};')
    writeFileSync(cjsPath, 'module.exports = {};')
    writeFileSync(mjsPath, 'export default {};')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsPath)
  })

  test('.eslintrc with no extension contains valid JSON-like content', async () => {
    const rcPath = join(testDir, '.eslintrc')
    writeFileSync(rcPath, '{\n  "rules": {\n    "no-eval": "error"\n  }\n}')
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(rcPath)
  })

  test('priority: .eslintrc.json wins over all other configs', async () => {
    const jsonPath = join(testDir, '.eslintrc.json')
    const jsPath = join(testDir, '.eslintrc.js')
    const yamlPath = join(testDir, '.eslintrc.yaml')
    const rcPath = join(testDir, '.eslintrc')
    const pkgPath = join(testDir, 'package.json')
    writeFileSync(jsonPath, JSON.stringify({ rules: {} }))
    writeFileSync(jsPath, 'module.exports = {};')
    writeFileSync(yamlPath, 'rules:')
    writeFileSync(rcPath, '{ "rules": {} }')
    writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: {} } }))
    const result = await detectESLintConfig(testDir)
    expect(result).toBe(jsonPath)
  })

  test('detects .eslintrc.json in nested path', async () => {
    const nestedDir = join(testDir, 'nested', 'deep')
    mkdirSync(nestedDir, { recursive: true })
    const configPath = join(nestedDir, '.eslintrc.json')
    writeFileSync(configPath, JSON.stringify({ rules: {} }))
    const result = await detectESLintConfig(nestedDir)
    expect(result).toBe(configPath)
  })
})
