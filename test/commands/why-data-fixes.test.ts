import { describe, expect, it } from 'vitest'

import { FIXES } from '../../src/commands/why-data-fixes.js'

// ─── Export existence and type ───

describe('FIXES export', () => {
  it('is exported as an object', () => {
    expect(FIXES).toBeTypeOf('object')
    expect(FIXES).not.toBeNull()
    expect(FIXES).not.toBeUndefined()
  })

  it('is a plain record (not an array)', () => {
    expect(Array.isArray(FIXES)).toBe(false)
  })
})

// ─── Key existence for well-known rule IDs ───

describe('FIXES well-known rule keys', () => {
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
      expect(FIXES).toHaveProperty(key)
    }
  })

  it('contains TypeScript-specific rule keys', () => {
    expect(FIXES).toHaveProperty('explicit-return-type')
    expect(FIXES).toHaveProperty('no-unsafe-assignment')
    expect(FIXES).toHaveProperty('no-unsafe-call')
    expect(FIXES).toHaveProperty('no-unsafe-return')
    expect(FIXES).toHaveProperty('no-unsafe-member-access')
    expect(FIXES).toHaveProperty('no-unsafe-type-assertion')
    expect(FIXES).toHaveProperty('no-non-null-assertion')
    expect(FIXES).toHaveProperty('no-floating-promises')
    expect(FIXES).toHaveProperty('no-misused-promises')
    expect(FIXES).toHaveProperty('prefer-readonly')
  })

  it('contains async/promise rule keys', () => {
    expect(FIXES).toHaveProperty('no-await-in-loop')
    expect(FIXES).toHaveProperty('require-await')
    expect(FIXES).toHaveProperty('prefer-async-await')
    expect(FIXES).toHaveProperty('no-promise-as-boolean')
  })

  it('contains modern syntax preference rule keys', () => {
    expect(FIXES).toHaveProperty('prefer-spread')
    expect(FIXES).toHaveProperty('prefer-rest-params')
    expect(FIXES).toHaveProperty('prefer-for-of')
    expect(FIXES).toHaveProperty('prefer-array-find')
    expect(FIXES).toHaveProperty('prefer-array-flat')
    expect(FIXES).toHaveProperty('prefer-at-method')
    expect(FIXES).toHaveProperty('prefer-includes')
    expect(FIXES).toHaveProperty('prefer-nullish-coalescing')
    expect(FIXES).toHaveProperty('prefer-string-replace-all')
  })
})

// ─── Value types ───

describe('FIXES value types', () => {
  it('every value is an array', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      expect(Array.isArray(value), `FIXES['${key}'] should be an array`).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      expect(value.length, `FIXES['${key}'] should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('every array element is a string', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          typeof value[i],
          `FIXES['${key}'][${i}] should be a string`,
        ).toBe('string')
      }
    }
  })

  it('every string element is non-empty', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `FIXES['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Consistent structure across entries ───

describe('FIXES structural consistency', () => {
  it('each rule has exactly 4 fix suggestions', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      expect(
        value.length,
        `FIXES['${key}'] should have 4 suggestions`,
      ).toBe(4)
    }
  })

  it('no entry contains empty string elements', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      for (let i = 0; i < value.length; i++) {
        const trimmed = value[i]!.trim()
        expect(
          trimmed.length,
          `FIXES['${key}'][${i}] should not be whitespace-only`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('all suggestions start with an uppercase letter or symbol', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      for (let i = 0; i < value.length; i++) {
        const first = value[i]![0]!
        expect(
          /^[A-Z]/.test(first) || /[^a-z]/.test(first),
          `FIXES['${key}'][${i}] should start with uppercase or symbol`,
        ).toBe(true)
      }
    }
  })
})

// ─── Entry count ───

describe('FIXES entry count', () => {
  it('has at least 50 rule entries', () => {
    const keys = Object.keys(FIXES)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })

  it('has at most 200 rule entries', () => {
    const keys = Object.keys(FIXES)
    expect(keys.length).toBeLessThanOrEqual(200)
  })
})

// ─── Key format ───

describe('FIXES key format', () => {
  it('all keys are non-empty strings', () => {
    for (const key of Object.keys(FIXES)) {
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('all keys use lowercase kebab-case format', () => {
    for (const key of Object.keys(FIXES)) {
      expect(
        /^[a-z0-9-]+$/.test(key),
        `Key '${key}' should be lowercase kebab-case`,
      ).toBe(true)
    }
  })
})

// ─── No duplicate suggestions within a rule ───

describe('FIXES content quality', () => {
  it('no rule has duplicate suggestions', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      const unique = new Set(value)
      expect(
        unique.size,
        `FIXES['${key}'] should not have duplicate suggestions`,
      ).toBe(value.length)
    }
  })
})
