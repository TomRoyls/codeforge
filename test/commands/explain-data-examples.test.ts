import { describe, expect, it } from 'vitest'

import { examplesMap } from '../../src/commands/explain-data-examples.js'
import type { RuleExample } from '../../src/commands/explain-data-examples.js'

// ─── Export existence and type ───

describe('examplesMap: export shape', () => {
  it('is defined', () => {
    expect(examplesMap).toBeDefined()
  })

  it('is a non-null object', () => {
    expect(typeof examplesMap).toBe('object')
    expect(examplesMap).not.toBeNull()
  })
})

// ─── Entry count and common keys ───

describe('examplesMap: keys', () => {
  it('has at least 25 rule entries', () => {
    const keys = Object.keys(examplesMap)
    expect(keys.length).toBeGreaterThanOrEqual(25)
  })

  it('contains well-known rule IDs', () => {
    const keys = Object.keys(examplesMap)
    const expected = [
      'no-eval',
      'prefer-const',
      'no-var',
      'eq-eq-eq',
      'curly',
      'no-console',
      'no-explicit-any',
      'no-unused-vars',
      'no-debugger',
      'max-params',
    ]
    for (const rule of expected) {
      expect(keys).toContain(rule)
    }
  })

  it('has no duplicate keys', () => {
    const keys = Object.keys(examplesMap)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})

// ─── Value types and structure ───

describe('examplesMap: value types', () => {
  it('every value is an array', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      expect(Array.isArray(examples)).toBe(true)
    }
  })

  it('every array is non-empty', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      expect(examples.length).toBeGreaterThan(0)
    }
  })

  it('every array element is a non-null object', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example).toBeDefined()
        expect(typeof example).toBe('object')
        expect(example).not.toBeNull()
      }
    }
  })

  it('every example has bad, description, and good properties', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example).toHaveProperty('bad')
        expect(example).toHaveProperty('description')
        expect(example).toHaveProperty('good')
      }
    }
  })

  it('every property is a string type', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(typeof example.bad).toBe('string')
        expect(typeof example.description).toBe('string')
        expect(typeof example.good).toBe('string')
      }
    }
  })

  it('every property is a non-empty string', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example.bad.length).toBeGreaterThan(0)
        expect(example.description.length).toBeGreaterThan(0)
        expect(example.good.length).toBeGreaterThan(0)
      }
    }
  })

  it('no property is undefined or null', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example.bad).not.toBeUndefined()
        expect(example.bad).not.toBeNull()
        expect(example.description).not.toBeUndefined()
        expect(example.description).not.toBeNull()
        expect(example.good).not.toBeUndefined()
        expect(example.good).not.toBeNull()
      }
    }
  })
})

// ─── Content quality ───

describe('examplesMap: content quality', () => {
  it('bad and good are different strings in every example', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example.bad).not.toBe(example.good)
      }
    }
  })

  it('description strings are at least 10 characters long', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        expect(example.description.length).toBeGreaterThanOrEqual(10)
      }
    }
  })

  it('bad examples contain realistic code (no empty lines only)', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        const trimmed = example.bad.replace(/\s/g, '')
        expect(trimmed.length).toBeGreaterThan(5)
      }
    }
  })

  it('good examples contain realistic code (no empty lines only)', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        const trimmed = example.good.replace(/\s/g, '')
        expect(trimmed.length).toBeGreaterThan(5)
      }
    }
  })
})

// ─── Specific rule checks ───

describe('examplesMap: specific rules', () => {
  it('no-eval has at least 2 examples', () => {
    const examples = examplesMap['no-eval']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThanOrEqual(2)
  })

  it('prefer-const has at least 2 examples', () => {
    const examples = examplesMap['prefer-const']
    expect(examples).toBeDefined()
    expect(examples.length).toBeGreaterThanOrEqual(2)
  })

  it('curly has exactly 1 example', () => {
    const examples = examplesMap['curly']
    expect(examples).toBeDefined()
    expect(examples.length).toBe(1)
  })

  it('eq-eq-eq has exactly 1 example', () => {
    const examples = examplesMap['eq-eq-eq']
    expect(examples).toBeDefined()
    expect(examples.length).toBe(1)
  })

  it('max-complexity has exactly 1 example', () => {
    const examples = examplesMap['max-complexity']
    expect(examples).toBeDefined()
    expect(examples.length).toBe(1)
  })

  it('no-var example references var keyword in bad code', () => {
    const examples = examplesMap['no-var']
    expect(examples).toBeDefined()
    const badCode = examples[0].bad
    expect(badCode).toContain('var')
  })

  it('prefer-const example references let in bad code', () => {
    const examples = examplesMap['prefer-const']
    expect(examples).toBeDefined()
    const badCode = examples[0].bad
    expect(badCode).toContain('let')
  })
})

// ─── RuleExample interface ───

describe('RuleExample interface', () => {
  it('can be used to type a compliant object', () => {
    const example: RuleExample = {
      bad: 'var x = 1',
      description: 'Using var instead of const',
      good: 'const x = 1',
    }
    expect(example.bad).toBe('var x = 1')
    expect(example.description).toBe('Using var instead of const')
    expect(example.good).toBe('const x = 1')
  })

  it('actual map entries conform to the interface shape', () => {
    const entries = Object.entries(examplesMap)
    for (const [, examples] of entries) {
      for (const example of examples) {
        const keys = Object.keys(example)
        expect(keys).toContain('bad')
        expect(keys).toContain('description')
        expect(keys).toContain('good')
      }
    }
  })
})
