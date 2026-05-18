import { describe, it, expect } from 'vitest'

import Explain from '../src/commands/explain.js'
import {
  getBestPractices,
  getExamples,
  getRelatedRules,
} from '../src/commands/explain-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Explain command - static metadata', () => {
  it('has a description', () => {
    expect(Explain.description).toBe('Explain a specific rule in detail')
  })

  it('has examples array', () => {
    expect(Array.isArray(Explain.examples)).toBe(true)
    expect(Explain.examples.length).toBeGreaterThanOrEqual(2)
  })

  it('has rule-id arg that is required', () => {
    expect(Explain.args['rule-id']).toBeDefined()
    expect(Explain.args['rule-id'].required).toBe(true)
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Explain command - class structure', () => {
  it('exports a default class', () => {
    expect(Explain).toBeDefined()
    expect(typeof Explain).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Explain.prototype.run).toBe('function')
  })
})

// ─── Helper functions used by command ────────────────────
describe('Explain command - helper functions', () => {
  it('getBestPractices returns default practices for unknown rule', () => {
    const practices = getBestPractices('nonexistent-rule-xyz')
    expect(Array.isArray(practices)).toBe(true)
    expect(practices.length).toBeGreaterThan(0)
  })

  it('getExamples returns null for unknown rule', () => {
    const examples = getExamples('nonexistent-rule-xyz')
    expect(examples).toBeNull()
  })

  it('getRelatedRules returns array for any ruleId', () => {
    const related = getRelatedRules('nonexistent-rule-xyz', 'complexity')
    expect(Array.isArray(related)).toBe(true)
  })
})
