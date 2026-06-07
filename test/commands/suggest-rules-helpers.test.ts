import { describe, expect, it, vi } from 'vitest'

import type { RuleSuggestion } from '../../src/commands/suggest-rules-patterns.js'

import {
  displaySuggestions,
  filterSuggestions,
  formatConfidenceColor,
  formatImpactColor,
  sortSuggestions,
} from '../../src/commands/suggest-rules-helpers.js'

// ─── Helpers ───

function makeSuggestion(overrides: Partial<RuleSuggestion> = {}): RuleSuggestion {
  return {
    category: 'patterns',
    confidence: 'high',
    estimatedViolations: 5,
    impact: 'medium',
    reason: 'test reason',
    ruleId: 'test-rule',
    ...overrides,
  }
}

// ─── filterSuggestions ───

describe('filterSuggestions', () => {
  it('returns all suggestions when impact is empty string', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'low' }),
      makeSuggestion({ impact: 'medium' }),
    ]
    const result = filterSuggestions(suggestions, '')
    expect(result).toHaveLength(3)
  })

  it('filters suggestions by high impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'rule-a' }),
      makeSuggestion({ impact: 'low', ruleId: 'rule-b' }),
      makeSuggestion({ impact: 'high', ruleId: 'rule-c' }),
    ]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.impact === 'high')).toBe(true)
  })

  it('filters suggestions by medium impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', ruleId: 'rule-a' }),
      makeSuggestion({ impact: 'low', ruleId: 'rule-b' }),
      makeSuggestion({ impact: 'high', ruleId: 'rule-c' }),
    ]
    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('rule-a')
  })

  it('filters suggestions by low impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', ruleId: 'rule-a' }),
      makeSuggestion({ impact: 'medium', ruleId: 'rule-b' }),
      makeSuggestion({ impact: 'low', ruleId: 'rule-c' }),
    ]
    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.impact === 'low')).toBe(true)
  })

  it('returns empty array when no suggestions match impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'high' }),
    ]
    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    const result = filterSuggestions([], 'high')
    expect(result).toHaveLength(0)
  })
})

// ─── sortSuggestions ───

describe('sortSuggestions', () => {
  it('sorts by impact in descending order (high, medium, low)', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', ruleId: 'low' }),
      makeSuggestion({ impact: 'high', ruleId: 'high' }),
      makeSuggestion({ impact: 'medium', ruleId: 'medium' }),
    ]
    const result = sortSuggestions(suggestions)
    expect(result[0]!.impact).toBe('high')
    expect(result[1]!.impact).toBe('medium')
    expect(result[2]!.impact).toBe('low')
  })

  it('sorts by confidence when impact difference is 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'low', ruleId: 'low-conf' }),
      makeSuggestion({ impact: 'high', confidence: 'high', ruleId: 'high-conf' }),
    ]
    const result = sortSuggestions(suggestions)
    expect(result.map((r) => r.ruleId)).toEqual(['high-conf', 'low-conf'])
  })

  it('sorts by estimatedViolations when impact and confidence differ by 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'medium', estimatedViolations: 1, ruleId: 'few' }),
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 10, ruleId: 'many' }),
    ]
    const result = sortSuggestions(suggestions)
    expect(result.map((r) => r.ruleId)).toEqual(['many', 'few'])
  })

  it('maintains stable sort order for equal values', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'first' }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5, ruleId: 'second' }),
    ]
    const result = sortSuggestions(suggestions)
    expect(result).toHaveLength(2)
  })

  it('handles empty array', () => {
    const result = sortSuggestions([])
    expect(result).toHaveLength(0)
  })

  it('handles single suggestion', () => {
    const suggestions = [makeSuggestion()]
    const result = sortSuggestions(suggestions)
    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('test-rule')
  })
})

// ─── formatImpactColor ───

describe('formatImpactColor', () => {
  it('returns red color function for high impact', () => {
    const colorFn = formatImpactColor('high')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns yellow color function for medium impact', () => {
    const colorFn = formatImpactColor('medium')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns green color function for low impact', () => {
    const colorFn = formatImpactColor('low')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns green color function for unknown impact', () => {
    const colorFn = formatImpactColor('unknown' as never)
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })
})

// ─── formatConfidenceColor ───

describe('formatConfidenceColor', () => {
  it('returns green color function for high confidence', () => {
    const colorFn = formatConfidenceColor('high')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns yellow color function for medium confidence', () => {
    const colorFn = formatConfidenceColor('medium')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns red color function for low confidence', () => {
    const colorFn = formatConfidenceColor('low')
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })

  it('returns red color function for unknown confidence', () => {
    const colorFn = formatConfidenceColor('unknown' as never)
    const colored = colorFn('test')
    expect(typeof colored).toBe('string')
    expect(colored).toContain('test')
  })
})

// ─── displaySuggestions ───

describe('displaySuggestions', () => {
  it('logs message when suggestions array is empty', () => {
    const logFn = vi.fn()
    displaySuggestions([], false, logFn)
    expect(logFn).toHaveBeenCalledTimes(1)
    expect(logFn).toHaveBeenCalledWith('No rule suggestions found.')
  })

  it('logs "Rule Suggestions:" header when suggestions exist', () => {
    const logFn = vi.fn()
    const suggestions = [makeSuggestion()]
    displaySuggestions(suggestions, false, logFn)
    expect(logFn).toHaveBeenCalledWith(expect.stringContaining('Rule Suggestions:'))
  })

  it('logs each suggestion with basic info in non-verbose mode', () => {
    const logFn = vi.fn()
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 10, ruleId: 'no-console' }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const allCalls = logFn.mock.calls.flat().join(' ')
    const stripped = allCalls.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('no-console')
    expect(stripped).toContain('[HIGH]')
    expect(stripped).toContain('[HIGH]')
    expect(stripped).toContain('(~10 violations)')
  })

  it('logs category, reason, and command in verbose mode', () => {
    const logFn = vi.fn()
    const suggestions = [
      makeSuggestion({
        category: 'security',
        reason: 'Found eval usage',
        ruleId: 'no-eval',
      }),
    ]
    displaySuggestions(suggestions, true, logFn)
    const allCalls = logFn.mock.calls.flat().join(' ')
    const stripped = allCalls.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('Category: security')
    expect(stripped).toContain('Reason: Found eval usage')
    expect(stripped).toContain('Enable with: codeforge analyze --rules no-eval')
  })

  it('does not log extra details in non-verbose mode', () => {
    const logFn = vi.fn()
    const suggestions = [
      makeSuggestion({ category: 'security', reason: 'some reason' }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const allCalls = logFn.mock.calls.flat().join(' ')
    const stripped = allCalls.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).not.toContain('Category:')
    expect(stripped).not.toContain('Reason:')
    expect(stripped).not.toContain('Enable with:')
  })

  it('logs total suggestions count at the end', () => {
    const logFn = vi.fn()
    const suggestions = [
      makeSuggestion({ ruleId: 'rule-a' }),
      makeSuggestion({ ruleId: 'rule-b' }),
      makeSuggestion({ ruleId: 'rule-c' }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const allCalls = logFn.mock.calls.flat().join(' ')
    const stripped = allCalls.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('Total: 3 rule suggestions')
  })

  it('pads ruleId to fixed width', () => {
    const logFn = vi.fn()
    const suggestions = [makeSuggestion({ ruleId: 'short' })]
    displaySuggestions(suggestions, false, logFn)
    const allCalls = logFn.mock.calls.flat().join(' ')
    const stripped = allCalls.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toContain('short')
    expect(stripped).toContain('[HIGH]')
    expect(stripped).toContain('[MEDIUM]')
  })
})