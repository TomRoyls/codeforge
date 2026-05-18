import { describe, it, expect } from 'vitest'

import Why from '../src/commands/why.js'
import {
  analyzeViolation,
  displayWhyOutput,
  formatBestPractices,
  formatCommonViolations,
  formatFixes,
  getBestPractices,
  getCommonViolations,
  getFixes,
} from '../src/commands/why-helpers.js'

// ─── Static metadata ────────────────────────────────────
describe('Why command - static metadata', () => {
  it('has a description', () => {
    expect(Why.description).toBe('Explain why a specific rule violation occurs and how to fix it')
  })

  it('has examples array', () => {
    expect(Array.isArray(Why.examples)).toBe(true)
    expect(Why.examples.length).toBeGreaterThanOrEqual(2)
  })

  it('has ruleId arg that is required', () => {
    expect(Why.args.ruleId).toBeDefined()
    expect(Why.args.ruleId.required).toBe(true)
  })

  it('has violation flag with char v', () => {
    expect(Why.flags.violation).toBeDefined()
    expect(Why.flags.violation.char).toBe('v')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Why command - class structure', () => {
  it('exports a default class', () => {
    expect(Why).toBeDefined()
    expect(typeof Why).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Why.prototype.run).toBe('function')
  })
})

// ─── getBestPractices ────────────────────────────────────
describe('Why command - getBestPractices', () => {
  it('returns default for unknown rule', () => {
    const result = getBestPractices('unknown-rule-xyz')
    expect(result).toEqual(['Follow general code quality guidelines'])
  })

  it('returns array', () => {
    expect(Array.isArray(getBestPractices('any'))).toBe(true)
  })
})

// ─── getCommonViolations ─────────────────────────────────
describe('Why command - getCommonViolations', () => {
  it('returns default for unknown rule', () => {
    const result = getCommonViolations('unknown-rule-xyz')
    expect(result).toEqual(['Various violations may occur depending on usage'])
  })

  it('returns array', () => {
    expect(Array.isArray(getCommonViolations('any'))).toBe(true)
  })
})

// ─── getFixes ────────────────────────────────────────────
describe('Why command - getFixes', () => {
  it('returns default for unknown rule', () => {
    const result = getFixes('unknown-rule-xyz')
    expect(result).toEqual(['Check the rule documentation for specific fixes'])
  })
})

// ─── analyzeViolation ────────────────────────────────────
describe('Why command - analyzeViolation', () => {
  it('returns default suggestion for generic violation', () => {
    const suggestions = analyzeViolation('any-rule', 'something went wrong')
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toContain('documentation')
  })

  it('suggests options object for parameter violations', () => {
    const suggestions = analyzeViolation('max-params', 'too many parameter count')
    expect(suggestions.some(s => s.includes('options object'))).toBe(true)
  })

  it('suggests early returns for nested violations', () => {
    const suggestions = analyzeViolation('max-nesting', 'too much nested depth')
    expect(suggestions.some(s => s.includes('return early'))).toBe(true)
  })

  it('suggests extraction for long line violations', () => {
    const suggestions = analyzeViolation('max-line', 'function too long line count')
    expect(suggestions.some(s => s.includes('responsibilities'))).toBe(true)
  })
})

// ─── formatBestPractices ─────────────────────────────────
describe('Why command - formatBestPractices', () => {
  it('logs practices with bullet prefix', () => {
    const logs: string[] = []
    formatBestPractices('unknown-rule-xyz', (msg) => logs.push(msg))
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatch(/^  • /)
  })
})

// ─── formatCommonViolations ──────────────────────────────
describe('Why command - formatCommonViolations', () => {
  it('logs violations with bullet prefix', () => {
    const logs: string[] = []
    formatCommonViolations('unknown-rule-xyz', (msg) => logs.push(msg))
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0]).toMatch(/^  • /)
  })
})

// ─── formatFixes ─────────────────────────────────────────
describe('Why command - formatFixes', () => {
  it('logs fixes with bullet prefix', () => {
    const logs: string[] = []
    formatFixes('unknown-rule-xyz', (msg) => logs.push(msg))
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0]).toMatch(/^  • /)
  })
})

// ─── displayWhyOutput ────────────────────────────────────
describe('Why command - displayWhyOutput', () => {
  it('outputs rule header and sections', () => {
    const logs: string[] = []
    displayWhyOutput('max-params', { description: 'test desc' }, undefined, 'codeforge', (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('max-params')
    expect(output).toContain('Common violations')
    expect(output).toContain('How to fix')
    expect(output).toContain('Best practices')
    expect(output).toContain('codeforge explain max-params')
  })

  it('shows description when ruleMeta has one', () => {
    const logs: string[] = []
    displayWhyOutput('test', { description: 'my desc' }, undefined, 'cf', (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('my desc')
  })

  it('skips description when ruleMeta lacks one', () => {
    const logs: string[] = []
    displayWhyOutput('test', {}, undefined, 'cf', (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).not.toContain('Description:')
  })

  it('shows violation analysis when violation is provided', () => {
    const logs: string[] = []
    displayWhyOutput('test', {}, 'too many parameter', 'cf', (msg) => logs.push(msg))
    const output = logs.join('\n')
    expect(output).toContain('too many parameter')
    expect(output).toContain('Your specific violation')
  })

  it('handles undefined ruleMeta', () => {
    const logs: string[] = []
    displayWhyOutput('test', undefined, undefined, 'cf', (msg) => logs.push(msg))
    expect(logs.length).toBeGreaterThan(0)
  })
})
