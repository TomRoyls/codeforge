import chalk from 'chalk'
import { describe, expect, it } from 'vitest'

import {
  displaySuggestions,
  filterSuggestions,
  formatConfidenceColor,
  formatImpactColor,
  sortSuggestions,
} from '../../src/commands/suggest-rules-formatting.js'
import type { RuleSuggestion } from '../../src/commands/suggest-rules-patterns.js'

// ─── Helpers ───

function makeSuggestion(overrides: Partial<RuleSuggestion> = {}): RuleSuggestion {
  return {
    ruleId: 'test-rule',
    impact: 'medium',
    confidence: 'medium',
    estimatedViolations: 5,
    category: 'patterns',
    reason: 'test reason',
    ...overrides,
  }
}

const strip = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

// ─── filterSuggestions ───

describe('filterSuggestions', () => {
  const suggestions: RuleSuggestion[] = [
    makeSuggestion({ ruleId: 'a', impact: 'high' }),
    makeSuggestion({ ruleId: 'b', impact: 'medium' }),
    makeSuggestion({ ruleId: 'c', impact: 'low' }),
    makeSuggestion({ ruleId: 'd', impact: 'high' }),
  ]

  it('returns all suggestions when impact is empty string', () => {
    const result = filterSuggestions(suggestions, '')
    expect(result).toHaveLength(4)
    expect(result).toEqual(suggestions)
  })

  it('filters to matching impact only (high)', () => {
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
    expect(result.every((s) => s.impact === 'high')).toBe(true)
    expect(result.map((s) => s.ruleId)).toEqual(['a', 'd'])
  })

  it('filters to matching impact only (medium)', () => {
    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('b')
  })

  it('returns empty array when no matches', () => {
    const result = filterSuggestions([], 'high')
    expect(result).toEqual([])
  })

  it('returns empty array when no items match impact', () => {
    const onlyLows = [makeSuggestion({ impact: 'low' }), makeSuggestion({ impact: 'low' })]
    const result = filterSuggestions(onlyLows, 'high')
    expect(result).toEqual([])
  })
})

// ─── sortSuggestions ───

describe('sortSuggestions', () => {
  it('returns empty array for empty input', () => {
    expect(sortSuggestions([])).toEqual([])
  })

  it('returns single-element array unchanged', () => {
    const single = [makeSuggestion({ ruleId: 'only' })]
    const result = sortSuggestions(single)
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('only')
  })

  it('sorts high impact before low impact', () => {
    const items = [
      makeSuggestion({ ruleId: 'low', impact: 'low', confidence: 'high', estimatedViolations: 10 }),
      makeSuggestion({ ruleId: 'high', impact: 'high', confidence: 'low', estimatedViolations: 1 }),
    ]
    const result = sortSuggestions(items)
    expect(result[0].ruleId).toBe('high')
    expect(result[1].ruleId).toBe('low')
  })

  it('sorts by confidence when impact is tied', () => {
    const items = [
      makeSuggestion({ ruleId: 'low-conf', impact: 'high', confidence: 'low', estimatedViolations: 20 }),
      makeSuggestion({ ruleId: 'high-conf', impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]
    const result = sortSuggestions(items)
    expect(result[0].ruleId).toBe('high-conf')
    expect(result[1].ruleId).toBe('low-conf')
  })

  it('sorts by estimatedViolations when impact and confidence are tied', () => {
    const items = [
      makeSuggestion({ ruleId: 'few', impact: 'high', confidence: 'high', estimatedViolations: 3 }),
      makeSuggestion({ ruleId: 'many', impact: 'high', confidence: 'high', estimatedViolations: 15 }),
    ]
    const result = sortSuggestions(items)
    expect(result[0].ruleId).toBe('many')
    expect(result[1].ruleId).toBe('few')
  })

  it('sorts a multi-element array with high/low correctly', () => {
    const items = [
      makeSuggestion({ ruleId: 'low1', impact: 'low', confidence: 'high', estimatedViolations: 2 }),
      makeSuggestion({ ruleId: 'high1', impact: 'high', confidence: 'low', estimatedViolations: 5 }),
      makeSuggestion({ ruleId: 'low2', impact: 'low', confidence: 'low', estimatedViolations: 8 }),
    ]
    const result = sortSuggestions(items)
    // high1 first (high impact > low impact, diff = 2)
    expect(result[0].ruleId).toBe('high1')
    // low1 and low2 sorted by confidence (high > low, diff = 2)
    expect(result[1].ruleId).toBe('low1')
    expect(result[2].ruleId).toBe('low2')
  })

  it('preserves stable ordering for equal elements', () => {
    const items = [
      makeSuggestion({ ruleId: 'first', impact: 'high', confidence: 'high', estimatedViolations: 5 }),
      makeSuggestion({ ruleId: 'second', impact: 'high', confidence: 'high', estimatedViolations: 5 }),
    ]
    const result = sortSuggestions(items)
    expect(result.map((s) => s.ruleId)).toEqual(['first', 'second'])
  })
})

// ─── formatImpactColor ───

describe('formatImpactColor', () => {
  it('returns chalk.red for high impact', () => {
    const fn = formatImpactColor('high')
    const result = fn('test')
    const redResult = chalk.red('test')
    expect(result).toBe(redResult)
  })

  it('returns chalk.yellow for medium impact', () => {
    const fn = formatImpactColor('medium')
    const result = fn('test')
    const yellowResult = chalk.yellow('test')
    expect(result).toBe(yellowResult)
  })

  it('returns chalk.green for low impact', () => {
    const fn = formatImpactColor('low')
    const result = fn('test')
    const greenResult = chalk.green('test')
    expect(result).toBe(greenResult)
  })

  it('returns chalk.green for unknown impact (default)', () => {
    const fn = formatImpactColor('unknown')
    const result = fn('test')
    const greenResult = chalk.green('test')
    expect(result).toBe(greenResult)
  })
})

// ─── formatConfidenceColor ───

describe('formatConfidenceColor', () => {
  it('returns chalk.green for high confidence', () => {
    const fn = formatConfidenceColor('high')
    const result = fn('test')
    const greenResult = chalk.green('test')
    expect(result).toBe(greenResult)
  })

  it('returns chalk.yellow for medium confidence', () => {
    const fn = formatConfidenceColor('medium')
    const result = fn('test')
    const yellowResult = chalk.yellow('test')
    expect(result).toBe(yellowResult)
  })

  it('returns chalk.red for low confidence', () => {
    const fn = formatConfidenceColor('low')
    const result = fn('test')
    const redResult = chalk.red('test')
    expect(result).toBe(redResult)
  })

  it('returns chalk.red for unknown confidence (default)', () => {
    const fn = formatConfidenceColor('anything')
    const result = fn('test')
    const redResult = chalk.red('test')
    expect(result).toBe(redResult)
  })
})

// ─── displaySuggestions ───

describe('displaySuggestions', () => {
  it('prints "No rule suggestions found." for empty array', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) logs.push(msg)
    }
    displaySuggestions([], false, logFn)
    expect(logs).toHaveLength(1)
    expect(logs[0]).toBe('No rule suggestions found.')
  })

  it('prints header and suggestion lines for non-empty input', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) logs.push(msg)
    }
    const suggestions = [
      makeSuggestion({
        ruleId: 'no-console',
        impact: 'high',
        confidence: 'medium',
        estimatedViolations: 7,
      }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const strippedLogs = logs.map(strip)
    expect(strippedLogs[0]).toContain('Rule Suggestions:')
    expect(strippedLogs.some((l) => l.includes('no-console'))).toBe(true)
    expect(strippedLogs.some((l) => l.includes('HIGH'))).toBe(true)
    expect(strippedLogs.some((l) => l.includes('MEDIUM'))).toBe(true)
    expect(strippedLogs.some((l) => l.includes('~7 violations'))).toBe(true)
  })

  it('prints total count at the end', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) logs.push(msg)
    }
    const suggestions = [
      makeSuggestion({ ruleId: 'a' }),
      makeSuggestion({ ruleId: 'b' }),
      makeSuggestion({ ruleId: 'c' }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const strippedLogs = logs.map(strip)
    expect(strippedLogs[strippedLogs.length - 1]).toContain('Total: 3 rule suggestions')
  })

  it('prints category, reason, and enable command in verbose mode', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) logs.push(msg)
    }
    const suggestions = [
      makeSuggestion({
        ruleId: 'no-eval',
        category: 'security',
        reason: 'eval is dangerous',
      }),
    ]
    displaySuggestions(suggestions, true, logFn)
    const strippedLogs = logs.map(strip)
    expect(strippedLogs.some((l) => l.includes('Category: security'))).toBe(true)
    expect(strippedLogs.some((l) => l.includes('Reason: eval is dangerous'))).toBe(true)
    expect(strippedLogs.some((l) => l.includes('codeforge analyze --rules no-eval'))).toBe(true)
  })

  it('does not print verbose details when verbose is false', () => {
    const logs: string[] = []
    const logFn = (msg?: string) => {
      if (msg !== undefined) logs.push(msg)
    }
    const suggestions = [
      makeSuggestion({ ruleId: 'no-eval', category: 'security', reason: 'danger' }),
    ]
    displaySuggestions(suggestions, false, logFn)
    const strippedLogs = logs.map(strip)
    expect(strippedLogs.some((l) => l.includes('Category:'))).toBe(false)
    expect(strippedLogs.some((l) => l.includes('Reason:'))).toBe(false)
    expect(strippedLogs.some((l) => l.includes('Enable with:'))).toBe(false)
  })
})
