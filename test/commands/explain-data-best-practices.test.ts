import { describe, expect, it } from 'vitest'

import { bestPracticesMap } from '../../src/commands/explain-data-best-practices.js'

// ─── Export existence and type ───

describe('bestPracticesMap: export shape', () => {
  it('is defined', () => {
    expect(bestPracticesMap).toBeDefined()
  })

  it('is a non-null object', () => {
    expect(typeof bestPracticesMap).toBe('object')
    expect(bestPracticesMap).not.toBeNull()
  })
})

// ─── Entry count and common keys ───

describe('bestPracticesMap: keys', () => {
  it('has at least 40 rule entries', () => {
    const keys = Object.keys(bestPracticesMap)
    expect(keys.length).toBeGreaterThanOrEqual(40)
  })

  it('contains well-known rule IDs', () => {
    const keys = Object.keys(bestPracticesMap)
    const expected = [
      'no-eval',
      'prefer-const',
      'no-var',
      'eq-eq-eq',
      'curly',
      'max-params',
      'no-console-log',
      'no-explicit-any',
      'no-unused-vars',
      'require-await',
    ]
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('contains all max-* complexity rules', () => {
    const keys = Object.keys(bestPracticesMap)
    const maxRules = ['max-complexity', 'max-depth', 'max-file-size', 'max-lines', 'max-lines-per-function', 'max-params', 'max-union-size']
    for (const rule of maxRules) {
      expect(keys).toContain(rule)
    }
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(bestPracticesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})

// ─── Value types and structure ───

describe('bestPracticesMap: value types', () => {
  it('every value is an array', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      expect(Array.isArray(practices)).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      expect(practices.length).toBeGreaterThan(0)
    }
  })

  it('every array element is a non-empty string', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        expect(typeof practice).toBe('string')
        expect(practice.length).toBeGreaterThan(0)
      }
    }
  })

  it('no array element is undefined or null', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        expect(practice).not.toBeUndefined()
        expect(practice).not.toBeNull()
      }
    }
  })

  it('strings have no leading or trailing whitespace', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        expect(practice.trim()).toBe(practice)
      }
    }
  })
})

// ─── Structural invariants ───

describe('bestPracticesMap: structural invariants', () => {
  it('each rule has at least 3 best practices', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      expect(practices.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('no duplicate practices within a rule', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      const unique = new Set(practices)
      expect(practices.length).toBe(unique.size)
    }
  })

  it('each rule has at most 5 best practices', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      expect(practices.length).toBeLessThanOrEqual(5)
    }
  })
})

// ─── Content quality ───

describe('bestPracticesMap: content quality', () => {
  it('practice strings are at least 20 characters long', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        expect(practice.length).toBeGreaterThanOrEqual(20)
      }
    }
  })

  it('practice strings start with an uppercase letter', () => {
    const entries = Object.entries(bestPracticesMap)
    for (const [, practices] of entries) {
      for (const practice of practices) {
        const firstChar = practice.charAt(0)
        expect(firstChar).toBe(firstChar.toUpperCase())
        expect(firstChar).toMatch(/[A-Z]/)
      }
    }
  })

  it('most practice strings do not end with a period', () => {
    const entries = Object.entries(bestPracticesMap)
    let periodCount = 0
    for (const [, practices] of entries) {
      for (const practice of practices) {
        if (practice.endsWith('.')) periodCount++
      }
    }
    expect(periodCount).toBeLessThanOrEqual(2)
  })
})

// ─── Specific rule content checks ───

describe('bestPracticesMap: specific rule content', () => {
  it('no-eval mentions JSON.parse', () => {
    const practices = bestPracticesMap['no-eval']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('JSON.parse'))
    expect(mentions).toBe(true)
  })

  it('prefer-const mentions const', () => {
    const practices = bestPracticesMap['prefer-const']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('const'))
    expect(mentions).toBe(true)
  })

  it('eq-eq-eq mentions ===', () => {
    const practices = bestPracticesMap['eq-eq-eq']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('==='))
    expect(mentions).toBe(true)
  })

  it('max-params mentions options object', () => {
    const practices = bestPracticesMap['max-params']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.toLowerCase().includes('options object') || p.toLowerCase().includes('options'))
    expect(mentions).toBe(true)
  })

  it('no-console-log mentions logging library', () => {
    const practices = bestPracticesMap['no-console-log']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.toLowerCase().includes('logging library'))
    expect(mentions).toBe(true)
  })

  it('no-var mentions const or let', () => {
    const practices = bestPracticesMap['no-var']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('const') || p.includes('let'))
    expect(mentions).toBe(true)
  })

  it('no-explicit-any mentions unknown or specific type', () => {
    const practices = bestPracticesMap['no-explicit-any']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('unknown') || p.includes('specific type'))
    expect(mentions).toBe(true)
  })

  it('prefer-optional-chain mentions optional chaining', () => {
    const practices = bestPracticesMap['prefer-optional-chain']
    expect(practices).toBeDefined()
    const mentions = practices.some((p) => p.includes('optional chain'))
    expect(mentions).toBe(true)
  })
})
