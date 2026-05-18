import { describe, expect, it } from 'vitest'

import { BEST_PRACTICES } from '../../src/commands/why-data-best-practices.js'
import { FIXES } from '../../src/commands/why-data-fixes.js'
import { COMMON_VIOLATIONS } from '../../src/commands/why-data-violations.js'

// ─── BEST_PRACTICES ───

describe('BEST_PRACTICES', () => {
  it('is an object', () => {
    expect(BEST_PRACTICES).toBeTypeOf('object')
    expect(BEST_PRACTICES).not.toBeNull()
  })

  it('has common rule keys', () => {
    expect(BEST_PRACTICES).toHaveProperty('no-eval')
    expect(BEST_PRACTICES).toHaveProperty('prefer-const')
    expect(BEST_PRACTICES).toHaveProperty('max-params')
    expect(BEST_PRACTICES).toHaveProperty('curly')
    expect(BEST_PRACTICES).toHaveProperty('eq-eq-eq')
    expect(BEST_PRACTICES).toHaveProperty('max-complexity')
    expect(BEST_PRACTICES).toHaveProperty('max-depth')
    expect(BEST_PRACTICES).toHaveProperty('max-lines')
    expect(BEST_PRACTICES).toHaveProperty('consistent-imports')
  })

  it('each value is a non-empty array of strings', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      expect(Array.isArray(value), `BEST_PRACTICES['${key}'] should be an array`).toBe(true)
      expect(value.length, `BEST_PRACTICES['${key}'] should be non-empty`).toBeGreaterThan(0)
      for (const item of value) {
        expect(typeof item, `BEST_PRACTICES['${key}'] item should be a string`).toBe('string')
      }
    }
  })

  it('each string is non-empty', () => {
    for (const [key, value] of Object.entries(BEST_PRACTICES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `BEST_PRACTICES['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('has at least 50 rule entries', () => {
    const keys = Object.keys(BEST_PRACTICES)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })
})

// ─── FIXES ───

describe('FIXES', () => {
  it('is an object', () => {
    expect(FIXES).toBeTypeOf('object')
    expect(FIXES).not.toBeNull()
  })

  it('has rule keys', () => {
    expect(FIXES).toHaveProperty('no-eval')
    expect(FIXES).toHaveProperty('prefer-const')
    expect(FIXES).toHaveProperty('max-params')
    expect(FIXES).toHaveProperty('curly')
    expect(FIXES).toHaveProperty('eq-eq-eq')
  })

  it('each value is a non-empty array of strings', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      expect(Array.isArray(value), `FIXES['${key}'] should be an array`).toBe(true)
      expect(value.length, `FIXES['${key}'] should be non-empty`).toBeGreaterThan(0)
      for (const item of value) {
        expect(typeof item, `FIXES['${key}'] item should be a string`).toBe('string')
      }
    }
  })

  it('each string is non-empty', () => {
    for (const [key, value] of Object.entries(FIXES)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `FIXES['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('has at least 50 rule entries', () => {
    const keys = Object.keys(FIXES)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })
})

// ─── COMMON_VIOLATIONS ───

describe('COMMON_VIOLATIONS', () => {
  it('is an object', () => {
    expect(COMMON_VIOLATIONS).toBeTypeOf('object')
    expect(COMMON_VIOLATIONS).not.toBeNull()
  })

  it('has rule keys', () => {
    expect(COMMON_VIOLATIONS).toHaveProperty('no-eval')
    expect(COMMON_VIOLATIONS).toHaveProperty('prefer-const')
    expect(COMMON_VIOLATIONS).toHaveProperty('max-params')
    expect(COMMON_VIOLATIONS).toHaveProperty('curly')
    expect(COMMON_VIOLATIONS).toHaveProperty('eq-eq-eq')
  })

  it('each value is a non-empty array of strings', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      expect(Array.isArray(value), `COMMON_VIOLATIONS['${key}'] should be an array`).toBe(true)
      expect(value.length, `COMMON_VIOLATIONS['${key}'] should be non-empty`).toBeGreaterThan(0)
      for (const item of value) {
        expect(typeof item, `COMMON_VIOLATIONS['${key}'] item should be a string`).toBe('string')
      }
    }
  })

  it('each string is non-empty', () => {
    for (const [key, value] of Object.entries(COMMON_VIOLATIONS)) {
      for (let i = 0; i < value.length; i++) {
        expect(
          value[i]!.length,
          `COMMON_VIOLATIONS['${key}'][${i}] should be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('has at least 50 rule entries', () => {
    const keys = Object.keys(COMMON_VIOLATIONS)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })
})

// ─── Cross-module consistency ───

describe('cross-module consistency', () => {
  it('all 3 modules share the same set of rule keys', () => {
    const bpKeys = new Set(Object.keys(BEST_PRACTICES))
    const fxKeys = new Set(Object.keys(FIXES))
    const viKeys = new Set(Object.keys(COMMON_VIOLATIONS))

    for (const key of bpKeys) {
      expect(fxKeys.has(key), `FIXES missing key '${key}'`).toBe(true)
      expect(viKeys.has(key), `COMMON_VIOLATIONS missing key '${key}'`).toBe(true)
    }

    for (const key of fxKeys) {
      expect(bpKeys.has(key), `BEST_PRACTICES missing key '${key}'`).toBe(true)
    }

    for (const key of viKeys) {
      expect(bpKeys.has(key), `BEST_PRACTICES missing key '${key}'`).toBe(true)
    }
  })

  it('the number of rules matches across all 3 modules', () => {
    const bpCount = Object.keys(BEST_PRACTICES).length
    const fxCount = Object.keys(FIXES).length
    const viCount = Object.keys(COMMON_VIOLATIONS).length

    expect(bpCount).toBe(fxCount)
    expect(bpCount).toBe(viCount)
  })
})
