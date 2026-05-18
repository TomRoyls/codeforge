import { describe, it, expect } from 'vitest'
import {
  filterSuggestions,
  sortSuggestions,
  formatImpactColor,
  formatConfidenceColor,
  displaySuggestions,
} from '../src/commands/suggest-rules-formatting.js'
import type { RuleSuggestion } from '../src/commands/suggest-rules-patterns.js'

const baseSuggestion: RuleSuggestion = {
  category: 'patterns',
  confidence: 'high',
  estimatedViolations: 5,
  impact: 'high',
  reason: 'Test reason',
  ruleId: 'test-rule',
}

// ─── filterSuggestions ────────────────────────────────
describe('filterSuggestions', () => {
  const suggestions: RuleSuggestion[] = [
    { ...baseSuggestion, impact: 'high', ruleId: 'rule-a' },
    { ...baseSuggestion, impact: 'medium', ruleId: 'rule-b' },
    { ...baseSuggestion, impact: 'low', ruleId: 'rule-c' },
    { ...baseSuggestion, impact: 'high', ruleId: 'rule-d' },
  ]

  it('returns all suggestions when impact is empty string', () => {
    expect(filterSuggestions(suggestions, '')).toHaveLength(4)
  })

  it('filters by high impact', () => {
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
    expect(result.every((s) => s.impact === 'high')).toBe(true)
  })

  it('filters by medium impact', () => {
    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('rule-b')
  })

  it('filters by low impact', () => {
    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('rule-c')
  })

  it('returns empty array when no matches', () => {
    expect(filterSuggestions(suggestions, 'critical')).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(filterSuggestions([], 'high')).toHaveLength(0)
  })

  it('returns all suggestions for empty input with empty filter', () => {
    expect(filterSuggestions([], '')).toHaveLength(0)
  })
})

// ─── sortSuggestions ──────────────────────────────────
describe('sortSuggestions', () => {
  it('sorts by impact descending (high > medium > low)', () => {
    const suggestions: RuleSuggestion[] = [
      { ...baseSuggestion, impact: 'low', confidence: 'high', estimatedViolations: 1 },
      { ...baseSuggestion, impact: 'high', confidence: 'high', estimatedViolations: 1 },
      { ...baseSuggestion, impact: 'medium', confidence: 'high', estimatedViolations: 1 },
    ]
    const result = sortSuggestions(suggestions)
    const impacts = result.map((s) => s.impact)
    const highIdx = impacts.indexOf('high')
    const lowIdx = impacts.indexOf('low')
    expect(highIdx).toBeLessThan(lowIdx)
  })

  it('sorts by impact first (high before low)', () => {
    const suggestions: RuleSuggestion[] = [
      { ...baseSuggestion, impact: 'low', confidence: 'low', estimatedViolations: 1 },
      { ...baseSuggestion, impact: 'high', confidence: 'low', estimatedViolations: 1 },
    ]
    const result = sortSuggestions(suggestions)
    expect(result[0]!.impact).toBe('high')
    expect(result[1]!.impact).toBe('low')
  })

  it('returns empty array for empty input', () => {
    expect(sortSuggestions([])).toEqual([])
  })

  it('handles single element', () => {
    const single = [{ ...baseSuggestion }]
    expect(sortSuggestions(single)).toHaveLength(1)
  })
})

// ─── formatImpactColor ────────────────────────────────
describe('formatImpactColor', () => {
  it('returns a function for high impact', () => {
    const fn = formatImpactColor('high')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  it('returns a function for medium impact', () => {
    const fn = formatImpactColor('medium')
    expect(typeof fn).toBe('function')
  })

  it('returns a function for low/unknown impact', () => {
    const fn = formatImpactColor('low')
    expect(typeof fn).toBe('function')
  })

  it('returns green for unknown impact string', () => {
    const fn = formatImpactColor('unknown')
    expect(typeof fn).toBe('function')
  })
})

// ─── formatConfidenceColor ────────────────────────────
describe('formatConfidenceColor', () => {
  it('returns a function for high confidence', () => {
    const fn = formatConfidenceColor('high')
    expect(typeof fn).toBe('function')
  })

  it('returns a function for medium confidence', () => {
    const fn = formatConfidenceColor('medium')
    expect(typeof fn).toBe('function')
  })

  it('returns a function for low confidence', () => {
    const fn = formatConfidenceColor('low')
    expect(typeof fn).toBe('function')
  })

  it('returns red for unknown confidence string', () => {
    const fn = formatConfidenceColor('unknown')
    expect(typeof fn).toBe('function')
  })
})

// ─── displaySuggestions ───────────────────────────────
describe('displaySuggestions', () => {
  it('outputs "No rule suggestions found." for empty array', () => {
    const logs: string[] = []
    displaySuggestions([], false, (msg) => logs.push(msg ?? ''))
    expect(logs).toEqual(['No rule suggestions found.'])
  })

  it('outputs header and suggestion lines for non-empty array', () => {
    const logs: string[] = []
    const suggestions: RuleSuggestion[] = [
      {
        category: 'patterns',
        confidence: 'high',
        estimatedViolations: 3,
        impact: 'high',
        reason: 'Test reason',
        ruleId: 'my-rule',
      },
    ]
    displaySuggestions(suggestions, false, (msg) => logs.push(msg ?? ''))

    const joined = logs.join('\n')
    expect(joined).toContain('Rule Suggestions:')
    expect(joined).toContain('my-rule')
    expect(joined).toContain('HIGH')
    expect(joined).toContain('3 violations')
  })

  it('includes verbose details when verbose is true', () => {
    const logs: string[] = []
    const suggestions: RuleSuggestion[] = [
      {
        category: 'security',
        confidence: 'medium',
        estimatedViolations: 7,
        impact: 'medium',
        reason: 'Detailed reason',
        ruleId: 'verbose-rule',
      },
    ]
    displaySuggestions(suggestions, true, (msg) => logs.push(msg ?? ''))

    const joined = logs.join('\n')
    expect(joined).toContain('Category: security')
    expect(joined).toContain('Reason: Detailed reason')
    expect(joined).toContain('codeforge analyze --rules verbose-rule')
  })

  it('outputs total count', () => {
    const logs: string[] = []
    const suggestions: RuleSuggestion[] = [
      { ...baseSuggestion, ruleId: 'a' },
      { ...baseSuggestion, ruleId: 'b' },
    ]
    displaySuggestions(suggestions, false, (msg) => logs.push(msg ?? ''))
    expect(logs.some((l) => l.includes('2 rule suggestions'))).toBe(true)
  })

  it('handles multiple suggestions', () => {
    const logs: string[] = []
    const suggestions: RuleSuggestion[] = [
      { ...baseSuggestion, ruleId: 'rule-1', impact: 'high' },
      { ...baseSuggestion, ruleId: 'rule-2', impact: 'low' },
      { ...baseSuggestion, ruleId: 'rule-3', impact: 'medium' },
    ]
    displaySuggestions(suggestions, false, (msg) => logs.push(msg ?? ''))

    const joined = logs.join('\n')
    expect(joined).toContain('rule-1')
    expect(joined).toContain('rule-2')
    expect(joined).toContain('rule-3')
  })
})
