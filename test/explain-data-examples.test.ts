import { describe, it, expect } from 'vitest'
import { examplesMap, type RuleExample } from '../src/commands/explain-data-examples.js'

// ─── Structure ──────────────────────────────────────────
describe('examplesMap', () => {
  it('is a non-empty object', () => {
    expect(typeof examplesMap).toBe('object')
    expect(Object.keys(examplesMap).length).toBeGreaterThan(0)
  })

  it('maps every key to a non-empty array', () => {
    for (const [ruleId, examples] of Object.entries(examplesMap)) {
      expect(Array.isArray(examples), `${ruleId} should be an array`).toBe(true)
      expect(examples.length, `${ruleId} should have at least 1 example`).toBeGreaterThan(0)
    }
  })
})

// ─── Entry Shape ────────────────────────────────────────
describe('examplesMap entry shape', () => {
  const requiredKeys: (keyof RuleExample)[] = ['bad', 'description', 'good']

  it('every example has bad, description, and good fields', () => {
    for (const [ruleId, examples] of Object.entries(examplesMap)) {
      for (let i = 0; i < examples.length; i++) {
        const ex = examples[i]
        for (const key of requiredKeys) {
          expect(ex[key], `${ruleId}[${i}].${key} should be a string`).toBeDefined()
          expect(typeof ex[key], `${ruleId}[${i}].${key} should be string`).toBe('string')
          expect((ex[key] as string).length, `${ruleId}[${i}].${key} should be non-empty`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('bad and good examples are different for every entry', () => {
    for (const [ruleId, examples] of Object.entries(examplesMap)) {
      for (let i = 0; i < examples.length; i++) {
        expect(examples[i].bad, `${ruleId}[${i}] bad !== good`).not.toBe(examples[i].good)
      }
    }
  })
})

// ─── Known Rule Coverage ────────────────────────────────
describe('examplesMap known rules', () => {
  const knownRules = [
    'curly',
    'eq-eq-eq',
    'max-params',
    'no-eval',
    'prefer-const',
    'no-console',
  ]

  it('contains entries for all known rules', () => {
    for (const rule of knownRules) {
      expect(examplesMap[rule], `${rule} should exist`).toBeDefined()
    }
  })
})

// ─── RuleExample type ───────────────────────────────────
describe('RuleExample type', () => {
  it('has exactly 3 required keys', () => {
    const example: RuleExample = {
      bad: 'bad code',
      description: 'desc',
      good: 'good code',
    }
    expect(Object.keys(example)).toHaveLength(3)
  })
})
