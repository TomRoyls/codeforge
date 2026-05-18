import { describe, expect, it } from 'vitest'

import { BEST_PRACTICES } from '../../src/commands/why-data-best-practices.js'

// ─── Export existence and type ───

describe('BEST_PRACTICES export', () => {
  it('is exported as an object', () => {
    expect(BEST_PRACTICES).toBeTypeOf('object')
    expect(BEST_PRACTICES).not.toBeNull()
    expect(BEST_PRACTICES).not.toBeUndefined()
  })

  it('is a plain record (not an array)', () => {
    expect(Array.isArray(BEST_PRACTICES)).toBe(false)
  })
})

// ─── Key existence for well-known rule IDs ───

describe('BEST_PRACTICES well-known rule keys', () => {
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
      expect(BEST_PRACTICES).toHaveProperty(key)
    }
  })

  it('contains TypeScript-specific rule keys', () => {
    expect(BEST_PRACTICES).toHaveProperty('explicit-return-type')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-assignment')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-call')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-return')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-member-access')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-type-assertion')
    expect(BEST_PRACTICES).toHaveProperty('no-non-null-assertion')
    expect(BEST_PRACTICES).toHaveProperty('no-floating-promises')
    expect(BEST_PRACTICES).toHaveProperty('no-misused-promises')
    expect(BEST_PRACTICES).toHaveProperty('prefer-readonly')
  })

  it('contains complexity/metrics rule keys', () => {
    expect(BEST_PRACTICES).toHaveProperty('max-depth')
    expect(BEST_PRACTICES).toHaveProperty('max-lines')
    expect(BEST_PRACTICES).toHaveProperty('max-lines-per-function')
    expect(BEST_PRACTICES).toHaveProperty('max-file-size')
    expect(BEST_PRACTICES).toHaveProperty('max-union-size')
  })

  it('contains code style preference rule keys', () => {
    expect(BEST_PRACTICES).toHaveProperty('prefer-spread')
    expect(BEST_PRACTICES).toHaveProperty('prefer-rest-params')
    expect(BEST_PRACTICES).toHaveProperty('prefer-for-of')
    expect(BEST_PRACTICES).toHaveProperty('prefer-array-find')
    expect(BEST_PRACTICES).toHaveProperty('prefer-includes')
    expect(BEST_PRACTICES).toHaveProperty('object-shorthand')
    expect(BEST_PRACTICES).toHaveProperty('sort-keys')
  })

  it('contains safety/security rule keys', () => {
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-finally')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-negation')
    expect(BEST_PRACTICES).toHaveProperty('no-unsafe-regex')
    expect(BEST_PRACTICES).toHaveProperty('no-implied-eval')
    expect(BEST_PRACTICES).toHaveProperty('no-throw-literal')
  })
})

// ─── Value types ───

describe('BEST_PRACTICES value types', () => {
  it('every value is an array', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      expect(Array.isArray(value), `BEST_PRACTICES['${key}'] should be an array`).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      expect(value.length, `BEST_PRACTICES['${key}'] should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('every array element is a string', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          typeof value[i],
          `BEST_PRACTICES['${key}'][${i}] should be a string`,
        ).toBe('string')
      }
    }
  })

  it('every string element is non-empty', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `BEST_PRACTICES['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Consistent structure across entries ───

describe('BEST_PRACTICES structural consistency', () => {
  it('each rule has exactly 3 best practices', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      expect(
        value.length,
        `BEST_PRACTICES['${key}'] should have 3 practices`,
      ).toBe(3)
    }
  })

  it('no entry contains empty or whitespace-only strings', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      for (let i = 0; i < value.length; i++) {
        const trimmed = value[i]!.trim()
        expect(
          trimmed.length,
          `BEST_PRACTICES['${key}'][${i}] should not be whitespace-only`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Entry count ───

describe('BEST_PRACTICES entry count', () => {
  it('has at least 50 rule entries', () => {
    const keys = Object.keys(BEST_PRACTICES)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })

  it('has at most 200 rule entries', () => {
    const keys = Object.keys(BEST_PRACTICES)
    expect(keys.length).toBeLessThanOrEqual(200)
  })
})

// ─── Key format ───

describe('BEST_PRACTICES key format', () => {
  it('all keys are non-empty strings', () => {
    for (const key of Object.keys(BEST_PRACTICES)) {
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('all keys use lowercase kebab-case format', () => {
    for (const key of Object.keys(BEST_PRACTICES)) {
      expect(
        /^[a-z0-9-]+$/.test(key),
        `Key '${key}' should be lowercase kebab-case`,
      ).toBe(true)
    }
  })
})

// ─── Content quality ───

describe('BEST_PRACTICES content quality', () => {
  it('no rule has duplicate practices', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      const unique = new Set(value)
      expect(
        unique.size,
        `BEST_PRACTICES['${key}'] should not have duplicate practices`,
      ).toBe(value.length)
    }
  })
})
