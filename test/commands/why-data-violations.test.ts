import { describe, expect, it } from 'vitest'

import { COMMON_VIOLATIONS } from '../../src/commands/why-data-violations.js'

// ─── Export existence and type ───

describe('COMMON_VIOLATIONS export', () => {
  it('is exported as an object', () => {
    expect(COMMON_VIOLATIONS).toBeTypeOf('object')
    expect(COMMON_VIOLATIONS).not.toBeNull()
    expect(COMMON_VIOLATIONS).not.toBeUndefined()
  })

  it('is a plain record (not an array)', () => {
    expect(Array.isArray(COMMON_VIOLATIONS)).toBe(false)
  })
})

// ─── Key existence for well-known rule IDs ───

describe('COMMON_VIOLATIONS well-known rule keys', () => {
  const expectedKeys = [
    'no-eval',
    'no-var',
    'prefer-const',
    'no-console',
    'eq-eq-eq',
    'curly',
    'max-params',
    'max-complexity',
    'no-explicit-any',
    'no-unused-vars',
    'no-undef',
    'no-empty',
    'no-shadow',
    'no-debugger',
    'prefer-template',
  ]

  it('contains all expected rule keys', () => {
    for (const key of expectedKeys) {
      expect(COMMON_VIOLATIONS).toHaveProperty(key)
    }
  })

  it('contains TypeScript-specific rule keys', () => {
    expect(COMMON_VIOLATIONS).toHaveProperty('explicit-return-type')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unsafe-assignment')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unsafe-call')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unsafe-return')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unsafe-member-access')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unsafe-type-assertion')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-non-null-assertion')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-floating-promises')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-misused-promises')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-readonly')
  })

  it('contains import/module rule keys', () => {
    expect(COMMON_VIOLATIONS).toHaveProperty('consistent-imports')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-duplicate-imports')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-unused-exports')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-barrel-imports')
    expect(COMMON_VIOLATIONS).toHaveProperty('no-circular-deps')
  })

  it('contains modern JavaScript preference rule keys', () => {
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-spread')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-rest-params')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-for-of')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-array-find')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-array-flat')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-at-method')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-includes')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-nullish-coalescing')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-string-replace-all')
  })
})

// ─── Value types ───

describe('COMMON_VIOLATIONS value types', () => {
  it('every value is an array', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      expect(Array.isArray(value), `COMMON_VIOLATIONS['${key}'] should be an array`).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      expect(value.length, `COMMON_VIOLATIONS['${key}'] should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('every array element is a string', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          typeof value[i],
          `COMMON_VIOLATIONS['${key}'][${i}] should be a string`,
        ).toBe('string')
      }
    }
  })

  it('every string element is non-empty', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `COMMON_VIOLATIONS['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Consistent structure across entries ───

describe('COMMON_VIOLATIONS structural consistency', () => {
  it('each rule has exactly 3 violation examples', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      expect(
        value.length,
        `COMMON_VIOLATIONS['${key}'] should have 3 violations`,
      ).toBe(3)
    }
  })

  it('no entry contains empty or whitespace-only strings', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      for (let i = 0; i < value.length; i++) {
        const trimmed = value[i]!.trim()
        expect(
          trimmed.length,
          `COMMON_VIOLATIONS['${key}'][${i}] should not be whitespace-only`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Entry count ───

describe('COMMON_VIOLATIONS entry count', () => {
  it('has at least 50 rule entries', () => {
    const keys = Object.keys(COMMON_VIOLATIONS)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })

  it('has at most 200 rule entries', () => {
    const keys = Object.keys(COMMON_VIOLATIONS)
    expect(keys.length).toBeLessThanOrEqual(200)
  })
})

// ─── Key format ───

describe('COMMON_VIOLATIONS key format', () => {
  it('all keys are non-empty strings', () => {
    for (const key of Object.keys(COMMON_VIOLATIONS)) {
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('all keys use lowercase kebab-case format', () => {
    for (const key of Object.keys(COMMON_VIOLATIONS)) {
      expect(
        /^[a-z0-9-]+$/.test(key),
        `Key '${key}' should be lowercase kebab-case`,
      ).toBe(true)
    }
  })
})

// ─── Content quality ───

describe('COMMON_VIOLATIONS content quality', () => {
  it('no rule has duplicate violations', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      const unique = new Set(value)
      expect(
        unique.size,
        `COMMON_VIOLATIONS['${key}'] should not have duplicate violations`,
      ).toBe(value.length)
    }
  })
})
