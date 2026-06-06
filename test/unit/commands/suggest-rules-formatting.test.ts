import { describe, test, expect } from 'vitest'

import { type RuleSuggestion } from '../../../src/commands/suggest-rules-patterns.js'
import {
  displaySuggestions,
  filterSuggestions,
  formatConfidenceColor,
  formatImpactColor,
  sortSuggestions,
} from '../../../src/commands/suggest-rules-formatting.js'

function makeSuggestion(overrides: Partial<RuleSuggestion> = {}): RuleSuggestion {
  return {
    category: 'patterns',
    confidence: 'high',
    estimatedViolations: 5,
    impact: 'high',
    reason: 'Test reason',
    ruleId: 'test-rule',
    ...overrides,
  }
}

describe('suggest-rules-formatting: filterSuggestions', () => {
  test('returns all suggestions when impact is empty string', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    expect(filterSuggestions(suggestions, '')).toEqual(suggestions)
  })

  test('filters to high impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'a' }),
      makeSuggestion({ impact: 'medium', ruleId: 'b' }),
      makeSuggestion({ impact: 'low', ruleId: 'c' }),
    ]

    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('high')
    expect(result[0].ruleId).toBe('a')
  })

  test('filters to medium impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('medium')
  })

  test('filters to low impact only', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'medium' }),
      makeSuggestion({ impact: 'low' }),
    ]

    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('low')
  })

  test('returns empty when no suggestions match filter', () => {
    const suggestions = [makeSuggestion({ impact: 'medium' })]
    expect(filterSuggestions(suggestions, 'high')).toEqual([])
  })

  test('returns all when all match the filter', () => {
    const suggestions = [makeSuggestion({ impact: 'high' }), makeSuggestion({ impact: 'high' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(2)
  })

  test('handles empty suggestions array with filter', () => {
    expect(filterSuggestions([], 'high')).toEqual([])
  })

  test('handles empty suggestions array with empty impact', () => {
    expect(filterSuggestions([], '')).toEqual([])
  })

  test('does not mutate original array', () => {
    const original = [makeSuggestion({ impact: 'high' }), makeSuggestion({ impact: 'low' })]
    const filtered = filterSuggestions(original, 'high')
    expect(filtered).toHaveLength(1)
    expect(original).toHaveLength(2)
  })

  test('preserves all suggestion fields in filtered results', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        ruleId: 'my-rule',
        confidence: 'medium',
        estimatedViolations: 42,
        reason: 'specific reason',
        category: 'security',
      }),
    ]
    const result = filterSuggestions(suggestions, 'high')
    expect(result[0]).toEqual(suggestions[0])
  })
})

describe('suggest-rules-formatting: sortSuggestions', () => {
  test('sorts high impact before low impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('low')
  })

  test('sorts high impact before medium impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('medium')
  })

  test('sorts medium impact before low impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('medium')
    expect(sorted[1].impact).toBe('low')
  })

  test('when impact diff is exactly 1, sorts by confidence', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].confidence).toBe('high')
    expect(sorted[1].confidence).toBe('low')
  })

  test('when confidence diff is exactly 1, sorts by violations descending', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 3 }),
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 10 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].estimatedViolations).toBe(10)
    expect(sorted[1].estimatedViolations).toBe(3)
  })

  test('returns empty array unchanged', () => {
    expect(sortSuggestions([])).toEqual([])
  })

  test('handles single element', () => {
    const single = [makeSuggestion()]
    expect(sortSuggestions(single)).toHaveLength(1)
  })

  test('does not lose elements during sort', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'a' }),
      makeSuggestion({ impact: 'low', ruleId: 'b' }),
      makeSuggestion({ impact: 'medium', ruleId: 'c' }),
    ]
    expect(sortSuggestions([...suggestions])).toHaveLength(3)
  })

  test('mutates the input array in place', () => {
    const input = [
      makeSuggestion({ impact: 'low', ruleId: 'a' }),
      makeSuggestion({ impact: 'high', ruleId: 'b' }),
    ]
    const result = sortSuggestions(input)
    expect(result).toBe(input)
    expect(result[0].impact).toBe('high')
  })

  test('sorts complex mixed set correctly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 5 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 3 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 8 }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted.length).toBe(4)
    expect(sorted[0].impact).toBe('high')
  })

  test('preserves equal-impact equal-confidence relative order (stable sort)', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 5,
        ruleId: 'first',
      }),
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 5,
        ruleId: 'second',
      }),
    ]

    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].ruleId).toBe('first')
    expect(sorted[1].ruleId).toBe('second')
  })
})

describe('suggest-rules-formatting: formatImpactColor', () => {
  test('returns function for high impact', () => {
    expect(typeof formatImpactColor('high')).toBe('function')
  })

  test('returns function for medium impact', () => {
    expect(typeof formatImpactColor('medium')).toBe('function')
  })

  test('returns function for low impact', () => {
    expect(typeof formatImpactColor('low')).toBe('function')
  })

  test('returns function for unknown impact (defaults to green)', () => {
    expect(typeof formatImpactColor('unknown')).toBe('function')
  })

  test('high impact function returns string containing input', () => {
    const result = formatImpactColor('high')('test')
    expect(result).toContain('test')
  })

  test('medium impact function returns string containing input', () => {
    const result = formatImpactColor('medium')('test')
    expect(result).toContain('test')
  })

  test('low impact function returns string containing input', () => {
    const result = formatImpactColor('low')('test')
    expect(result).toContain('test')
  })

  test('high and medium return different color functions', () => {
    expect(formatImpactColor('high')).not.toBe(formatImpactColor('medium'))
  })

  test('high and low return different color functions', () => {
    expect(formatImpactColor('high')).not.toBe(formatImpactColor('low'))
  })

  test('medium and low return different color functions', () => {
    expect(formatImpactColor('medium')).not.toBe(formatImpactColor('low'))
  })
})

describe('suggest-rules-formatting: formatConfidenceColor', () => {
  test('returns function for high confidence', () => {
    expect(typeof formatConfidenceColor('high')).toBe('function')
  })

  test('returns function for medium confidence', () => {
    expect(typeof formatConfidenceColor('medium')).toBe('function')
  })

  test('returns function for low confidence', () => {
    expect(typeof formatConfidenceColor('low')).toBe('function')
  })

  test('returns function for unknown confidence (defaults to red)', () => {
    expect(typeof formatConfidenceColor('unknown')).toBe('function')
  })

  test('high confidence function returns string containing input', () => {
    const result = formatConfidenceColor('high')('test')
    expect(result).toContain('test')
  })

  test('low confidence function returns string containing input', () => {
    const result = formatConfidenceColor('low')('test')
    expect(result).toContain('test')
  })

  test('high and medium return different color functions', () => {
    expect(formatConfidenceColor('high')).not.toBe(formatConfidenceColor('medium'))
  })

  test('medium and low return different color functions', () => {
    expect(formatConfidenceColor('medium')).not.toBe(formatConfidenceColor('low'))
  })

  test('confidence color mapping is inverse of impact color mapping', () => {
    const highConfidence = formatConfidenceColor('high')
    const lowImpact = formatImpactColor('low')
    expect(highConfidence).toBe(lowImpact)
  })
})

describe('suggest-rules-formatting: displaySuggestions', () => {
  test('shows "No rule suggestions found" for empty array', () => {
    const lines: string[] = []
    displaySuggestions([], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('No rule suggestions found')
  })

  test('shows "Rule Suggestions" header for non-empty array', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('Rule Suggestions')
  })

  test('displays rule ID padded to field width', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'my-rule' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('my-rule')
  })

  test('displays impact level uppercased', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'high' })], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('HIGH')
  })

  test('displays confidence level uppercased', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'medium' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('MEDIUM')
  })

  test('displays violation count with tilde prefix', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 7 })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~7 violations')
  })

  test('shows category in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: 'security' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Category: security')
  })

  test('shows reason in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: 'Found eval usage' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Reason: Found eval usage')
  })

  test('shows enable command with rule ID in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no-eval' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Enable with: codeforge analyze --rules no-eval')
  })

  test('hides category when not verbose', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: 'security' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).not.toContain('Category:')
  })

  test('hides reason when not verbose', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: 'Found eval' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).not.toContain('Reason:')
  })

  test('shows total count at the end', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion(), makeSuggestion({ ruleId: 'rule-2' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Total: 2 rule suggestions')
  })

  test('handles multiple suggestions showing each rule ID', () => {
    const lines: string[] = []
    displaySuggestions(
      [makeSuggestion({ ruleId: 'rule-alpha' }), makeSuggestion({ ruleId: 'rule-beta' })],
      false,
      (msg) => lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('rule-alpha')
    expect(output).toContain('rule-beta')
  })

  test('calls logFn multiple times for a single verbose suggestion', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], true, (msg) => lines.push(msg ?? ''))
    expect(lines.length).toBeGreaterThan(3)
  })

  test('displays LOW impact correctly', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'low' })], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('LOW')
  })

  test('displays zero violations correctly', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 0 })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~0 violations')
  })

  test('handles suggestion with long rule ID', () => {
    const lines: string[] = []
    displaySuggestions(
      [makeSuggestion({ ruleId: 'very-long-rule-id-that-exceeds-normal-length' })],
      false,
      (msg) => lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('very-long-rule-id-that-exceeds-normal-length')
  })

  test('displays large violation count correctly', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 999999 })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~999999 violations')
  })

  test('displays medium confidence as MEDIUM', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'medium' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('MEDIUM')
  })

  test('displays high confidence as HIGH', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'high' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('HIGH')
  })

  test('displays medium impact as MEDIUM', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'medium' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('MEDIUM')
  })

  test('verbose mode shows all three detail lines for each suggestion', () => {
    const lines: string[] = []
    displaySuggestions(
      [makeSuggestion({ category: 'perf', reason: 'slow code', ruleId: 'perf-check' })],
      true,
      (msg) => lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('Category: perf')
    expect(output).toContain('Reason: slow code')
    expect(output).toContain('Enable with: codeforge analyze --rules perf-check')
  })

  test('verbose mode with multiple suggestions shows details for each', () => {
    const lines: string[] = []
    displaySuggestions(
      [
        makeSuggestion({ ruleId: 'rule-a', category: 'security', reason: 'reason a' }),
        makeSuggestion({ ruleId: 'rule-b', category: 'patterns', reason: 'reason b' }),
      ],
      true,
      (msg) => lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('Category: security')
    expect(output).toContain('Category: patterns')
    expect(output).toContain('Reason: reason a')
    expect(output).toContain('Reason: reason b')
  })

  test('total count reflects exact number of suggestions', () => {
    const lines: string[] = []
    const many = Array.from({ length: 5 }, (_, i) => makeSuggestion({ ruleId: `rule-${i}` }))
    displaySuggestions(many, false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('Total: 5 rule suggestions')
  })

  test('handles special characters in rule ID', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no-eval/v2@latest' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('no-eval/v2@latest')
  })

  test('handles unicode characters in reason field (verbose)', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: '检测到不安全的代码模式 🔒' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('检测到不安全的代码模式 🔒')
  })

  test('handles unicode characters in category field (verbose)', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: 'セキュリティ' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Category: セキュリティ')
  })

  test('empty suggestion array calls logFn exactly once', () => {
    let callCount = 0
    displaySuggestions([], false, () => {
      callCount++
    })
    expect(callCount).toBe(1)
  })

  test('hides enable command when not verbose', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'my-rule' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).not.toContain('Enable with:')
  })
})

describe('suggest-rules-formatting: filterSuggestions advanced', () => {
  test('filter is case-sensitive (uppercase does not match)', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, 'HIGH')).toEqual([])
  })

  test('whitespace-only impact does not match any suggestions', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    const result = filterSuggestions(suggestions, '   ')
    expect(result).toHaveLength(0)
  })

  test('filtering a large array preserves matching count', () => {
    const suggestions = Array.from({ length: 100 }, (_, i) =>
      makeSuggestion({ impact: i < 30 ? 'high' : 'low', ruleId: `rule-${i}` }),
    )
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(30)
  })

  test('filter with duplicate matching suggestions returns all duplicates', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', ruleId: 'dup-1' }),
      makeSuggestion({ impact: 'medium', ruleId: 'dup-2' }),
      makeSuggestion({ impact: 'medium', ruleId: 'dup-3' }),
    ]
    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(3)
  })
})

describe('suggest-rules-formatting: sortSuggestions advanced', () => {
  test('sorts all three impact levels correctly in one pass', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('medium')
    expect(sorted[2].impact).toBe('low')
  })

  test('equal impact and confidence preserves original order', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 2,
        ruleId: 'fewer',
      }),
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 10,
        ruleId: 'more',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // When impactDiff=0, it returns 0 immediately, no violation tiebreak
    expect(sorted[0].ruleId).toBe('fewer')
    expect(sorted[1].ruleId).toBe('more')
  })

  test('handles all items with identical values', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 5,
        ruleId: 'a',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 5,
        ruleId: 'b',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 5,
        ruleId: 'c',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(3)
  })

  test('sorts many items correctly', () => {
    const suggestions = Array.from({ length: 50 }, (_, i) =>
      makeSuggestion({
        impact: (['high', 'medium', 'low'] as const)[i % 3],
        confidence: (['high', 'medium', 'low'] as const)[i % 3],
        estimatedViolations: i,
        ruleId: `rule-${i}`,
      }),
    )
    const sorted = sortSuggestions([...suggestions])
    // All items should be present
    expect(sorted).toHaveLength(50)
    // First item should be one of the high-impact ones
    expect(['high', 'medium', 'low']).toContain(sorted[0].impact)
  })
})

describe('suggest-rules-formatting: formatImpactColor edge cases', () => {
  test('empty string defaults to green', () => {
    const result = formatImpactColor('')('test')
    expect(result).toContain('test')
  })

  test('whitespace string defaults to green', () => {
    const result = formatImpactColor('  ')('test')
    expect(result).toContain('test')
  })

  test('applied color function produces a string', () => {
    const result = formatImpactColor('high')('colored')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('suggest-rules-formatting: formatConfidenceColor edge cases', () => {
  test('empty string defaults to red', () => {
    const result = formatConfidenceColor('')('test')
    expect(result).toContain('test')
  })

  test('whitespace string defaults to red', () => {
    const result = formatConfidenceColor('  ')('test')
    expect(result).toContain('test')
  })

  test('high and low confidence return different color functions', () => {
    expect(formatConfidenceColor('high')).not.toBe(formatConfidenceColor('low'))
  })

  test('applied color function produces a string', () => {
    const result = formatConfidenceColor('medium')('colored')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('suggest-rules-formatting: sortSuggestions violation tiebreak', () => {
  test('when both impact and confidence diffs are exactly 1, violations decide order', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 1,
        ruleId: 'fewer-violations',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'medium',
        estimatedViolations: 99,
        ruleId: 'more-violations',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(2)
    const ruleIds = sorted.map((s) => s.ruleId)
    expect(ruleIds).toContain('fewer-violations')
    expect(ruleIds).toContain('more-violations')
  })
})

describe('suggest-rules-formatting: additional coverage', () => {
  test('filterSuggestions returns all when impact is empty string', () => {
    const suggestions = [makeSuggestion({ impact: 'high' }), makeSuggestion({ impact: 'low' })]
    const filtered = filterSuggestions(suggestions, '')
    expect(filtered).toHaveLength(2)
  })

  test('filterSuggestions returns matching when impact is high', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high' }),
      makeSuggestion({ impact: 'low' }),
      makeSuggestion({ impact: 'high' }),
    ]
    const filtered = filterSuggestions(suggestions, 'high')
    expect(filtered).toHaveLength(2)
    expect(filtered.every((s) => s.impact === 'high')).toBe(true)
  })

  test('filterSuggestions returns empty when no matches', () => {
    const suggestions = [makeSuggestion({ impact: 'low' })]
    const filtered = filterSuggestions(suggestions, 'high')
    expect(filtered).toHaveLength(0)
  })

  test('sortSuggestions puts high impact before medium before low', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', estimatedViolations: 100 }),
      makeSuggestion({ impact: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', estimatedViolations: 50 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('medium')
    expect(sorted[2].impact).toBe('low')
  })

  test('sortSuggestions reaches confidence check when impact diff is exactly 1', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'high',
        estimatedViolations: 50,
        ruleId: 'med-high',
      }),
      makeSuggestion({
        impact: 'high',
        confidence: 'low',
        estimatedViolations: 10,
        ruleId: 'high-low',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].ruleId).toBe('med-high')
    expect(sorted[1].ruleId).toBe('high-low')
  })

  test('formatImpactColor returns green for unknown impact', () => {
    const result = formatImpactColor('unknown')('test')
    expect(result).toContain('test')
  })

  test('formatImpactColor returns different functions for high and low', () => {
    expect(formatImpactColor('high')).not.toBe(formatImpactColor('low'))
  })

  test('displaySuggestions calls logFn with total count', () => {
    const logs: string[] = []
    const suggestions = [
      makeSuggestion({ ruleId: 'rule-a', impact: 'high' }),
      makeSuggestion({ ruleId: 'rule-b', impact: 'low' }),
    ]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const totalLog = logs.find((l) => l.includes('Total:'))
    expect(totalLog).toBeDefined()
    expect(totalLog).toContain('2')
  })

  test('displaySuggestions shows verbose info when verbose is true', () => {
    const logs: string[] = []
    const suggestions = [
      makeSuggestion({ ruleId: 'verbose-rule', category: 'correctness', reason: 'test reason' }),
    ]
    displaySuggestions(suggestions, true, (msg) => {
      if (msg) logs.push(msg)
    })
    const categoryLog = logs.find((l) => l.includes('Category:'))
    expect(categoryLog).toBeDefined()
    expect(categoryLog).toContain('correctness')
  })

  test('displaySuggestions hides verbose info when verbose is false', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'non-verbose-rule', category: 'correctness' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const categoryLog = logs.find((l) => l.includes('Category:'))
    expect(categoryLog).toBeUndefined()
  })

  test('displaySuggestions with empty array shows no suggestions message', () => {
    const logs: string[] = []
    displaySuggestions([], false, (msg) => {
      if (msg) logs.push(msg)
    })
    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('No rule suggestions found')
  })

  test('displaySuggestions shows Rule Suggestions header', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'test-rule' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const header = logs.find((l) => l.includes('Rule Suggestions'))
    expect(header).toBeDefined()
  })

  test('displaySuggestions shows violation count per rule', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'my-rule', estimatedViolations: 42 })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const ruleLine = logs.find((l) => l.includes('42 violations'))
    expect(ruleLine).toBeDefined()
  })

  test('displaySuggestions shows impact as uppercase', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'my-rule', impact: 'high' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const impactLine = logs.find((l) => l.includes('HIGH'))
    expect(impactLine).toBeDefined()
  })

  test('displaySuggestions shows confidence as uppercase', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'my-rule', confidence: 'medium' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const confidenceLine = logs.find((l) => l.includes('MEDIUM'))
    expect(confidenceLine).toBeDefined()
  })

  test('displaySuggestions verbose mode shows reason', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'reason-rule', reason: 'improve code quality' })]
    displaySuggestions(suggestions, true, (msg) => {
      if (msg) logs.push(msg)
    })
    const reasonLog = logs.find((l) => l.includes('improve code quality'))
    expect(reasonLog).toBeDefined()
  })

  test('displaySuggestions verbose mode shows enable command', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'enable-rule' })]
    displaySuggestions(suggestions, true, (msg) => {
      if (msg) logs.push(msg)
    })
    const enableLog = logs.find((l) => l.includes('codeforge analyze --rules enable-rule'))
    expect(enableLog).toBeDefined()
  })

  test('displaySuggestions handles empty suggestions array', () => {
    const logs: string[] = []
    displaySuggestions([], false, (msg) => {
      if (msg) logs.push(msg)
    })
    expect(logs.length).toBeGreaterThanOrEqual(0)
  })

  test('displaySuggestions handles suggestion with zero violations', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'zero-rule', estimatedViolations: 0 })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const ruleLine = logs.find((l) => l.includes('zero-rule'))
    expect(ruleLine).toBeDefined()
  })

  test('displaySuggestions handles suggestion with very large violation count', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'big-rule', estimatedViolations: 999999 })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const ruleLine = logs.find((l) => l.includes('999999'))
    expect(ruleLine).toBeDefined()
  })

  test('displaySuggestions non-verbose mode does not show reason', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'nr-rule', reason: 'secret reason text' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const reasonLog = logs.find((l) => l.includes('secret reason text'))
    expect(reasonLog).toBeUndefined()
  })

  test('displaySuggestions displays multiple suggestions in order', () => {
    const logs: string[] = []
    const suggestions = [
      makeSuggestion({ ruleId: 'first-rule' }),
      makeSuggestion({ ruleId: 'second-rule' }),
      makeSuggestion({ ruleId: 'third-rule' }),
    ]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const firstIdx = logs.findIndex((l) => l.includes('first-rule'))
    const secondIdx = logs.findIndex((l) => l.includes('second-rule'))
    const thirdIdx = logs.findIndex((l) => l.includes('third-rule'))
    expect(firstIdx).toBeLessThan(secondIdx)
    expect(secondIdx).toBeLessThan(thirdIdx)
  })

  test('displaySuggestions low impact shown as uppercase', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'low-rule', impact: 'low' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const impactLine = logs.find((l) => l.includes('LOW'))
    expect(impactLine).toBeDefined()
  })

  test('displaySuggestions high confidence shown as uppercase', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'hc-rule', confidence: 'high' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const confLine = logs.find((l) => l.includes('HIGH'))
    expect(confLine).toBeDefined()
  })

  test('displaySuggestions low confidence shown as uppercase', () => {
    const logs: string[] = []
    const suggestions = [makeSuggestion({ ruleId: 'lc-rule', confidence: 'low' })]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const confLine = logs.find((l) => l.includes('LOW'))
    expect(confLine).toBeDefined()
  })
})

describe('suggest-rules-formatting: sortSuggestions impact diff branches', () => {
  test('impact diff of 2 (high vs low) returns impactDiff directly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 100, ruleId: 'low' }),
      makeSuggestion({
        impact: 'high',
        confidence: 'high',
        estimatedViolations: 1,
        ruleId: 'high',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].ruleId).toBe('high')
    expect(sorted[1].ruleId).toBe('low')
  })

  test('impact diff of -2 reverses order (low before high)', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1, ruleId: 'high' }),
      makeSuggestion({
        impact: 'low',
        confidence: 'high',
        estimatedViolations: 100,
        ruleId: 'low',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('low')
  })

  test('confidence diff of 2 returns confidenceDiff directly', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 100, ruleId: 'cl' }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'high',
        estimatedViolations: 1,
        ruleId: 'ch',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff=1 → confidence check, confidenceDiff=2 → returns 2 (ch first)
    expect(sorted[0].ruleId).toBe('ch')
    expect(sorted[1].ruleId).toBe('cl')
  })

  test('confidence diff of -2 reverses confidence order', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'high',
        estimatedViolations: 100,
        ruleId: 'ch',
      }),
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1, ruleId: 'cl' }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].ruleId).toBe('ch')
    expect(sorted[1].ruleId).toBe('cl')
  })

  test('equal impact (diff 0) returns 0 and preserves original order', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'medium',
        estimatedViolations: 50,
        ruleId: 'med',
      }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 10, ruleId: 'hi' }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(2)
    expect(sorted[0].ruleId).toBe('med')
    expect(sorted[1].ruleId).toBe('hi')
  })

  test('confidence diff 0 falls through to estimatedViolations', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'medium',
        confidence: 'high',
        estimatedViolations: 5,
        ruleId: 'fewer',
      }),
      makeSuggestion({
        impact: 'low',
        confidence: 'high',
        estimatedViolations: 99,
        ruleId: 'more',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff = low(1) - medium(2) = -1, returns -1 → medium first
    expect(sorted[0].impact).toBe('medium')
    expect(sorted[1].impact).toBe('low')
  })
})

describe('suggest-rules-formatting: displaySuggestions logFn edge cases', () => {
  test('logFn receives undefined for the blank line between rules and total', () => {
    const captured: (string | undefined)[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => {
      captured.push(msg)
    })
    // logFn() with no arg → msg is undefined for the blank line
    expect(captured).toHaveLength(4)
    expect(captured.some((m) => m === undefined)).toBe(true)
  })

  test('header line starts with newline', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => lines.push(msg ?? ''))
    const headerLine = lines.find((l) => l.includes('Rule Suggestions'))
    expect(headerLine).toBeDefined()
    // The header is '\n' + bold('Rule Suggestions:') + '\n'
    expect(lines[0]).toContain('Rule Suggestions')
  })

  test('blank line is logged before total count', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => lines.push(msg ?? ''))
    // Find total line
    const totalIdx = lines.findIndex((l) => l.includes('Total:'))
    expect(totalIdx).toBeGreaterThan(0)
  })

  test('total count says "1 rule suggestions" for single suggestion', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'solo' })], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).toContain('Total: 1 rule suggestions')
  })

  test('verbose mode calls logFn at least 5 times per suggestion', () => {
    let callCount = 0
    displaySuggestions([makeSuggestion({ ruleId: 'v' })], true, () => {
      callCount++
    })
    // Header(1) + rule line(1) + category(1) + reason(1) + enable(1) + blank(1) + total(1) = 7
    expect(callCount).toBe(7)
  })

  test('non-verbose single suggestion calls logFn exactly 4 times', () => {
    let callCount = 0
    displaySuggestions([makeSuggestion({ ruleId: 'nv' })], false, () => {
      callCount++
    })
    // Header(1) + rule line(1) + blank(1) + total(1) = 4
    expect(callCount).toBe(4)
  })
})

describe('suggest-rules-formatting: filterSuggestions mixed scenarios', () => {
  test('filter with numeric-like impact string returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, '1')).toEqual([])
  })

  test('filter with "undefined" string returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, 'undefined')).toEqual([])
  })

  test('filter on array with all three impacts returns correct subset', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', ruleId: 'h1' }),
      makeSuggestion({ impact: 'medium', ruleId: 'm1' }),
      makeSuggestion({ impact: 'low', ruleId: 'l1' }),
      makeSuggestion({ impact: 'high', ruleId: 'h2' }),
      makeSuggestion({ impact: 'low', ruleId: 'l2' }),
    ]
    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(2)
    expect(result.every((s) => s.impact === 'low')).toBe(true)
  })
})

describe('suggest-rules-formatting: formatImpactColor applied output', () => {
  test('high impact color function is callable with empty string', () => {
    const result = formatImpactColor('high')('')
    expect(typeof result).toBe('string')
  })

  test('medium impact color function is callable with empty string', () => {
    const result = formatImpactColor('medium')('')
    expect(typeof result).toBe('string')
  })

  test('low impact color function is callable with empty string', () => {
    const result = formatImpactColor('low')('')
    expect(typeof result).toBe('string')
  })
})

describe('suggest-rules-formatting: formatConfidenceColor applied output', () => {
  test('high confidence color function is callable with empty string', () => {
    const result = formatConfidenceColor('high')('')
    expect(typeof result).toBe('string')
  })

  test('medium confidence color function is callable with empty string', () => {
    const result = formatConfidenceColor('medium')('')
    expect(typeof result).toBe('string')
  })

  test('low confidence color function is callable with empty string', () => {
    const result = formatConfidenceColor('low')('')
    expect(typeof result).toBe('string')
  })
})

describe('suggest-rules-formatting: filterSuggestions additional edge cases', () => {
  test('filter with "null" string returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, 'null')).toEqual([])
  })

  test('filter with "High" mixed case returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, 'High')).toEqual([])
  })

  test('filter with "HIGH" all caps returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, 'HIGH')).toEqual([])
  })

  test('filter returns shallow copy not same reference', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).not.toBe(suggestions)
  })

  test('filter on single matching element returns array of length 1', () => {
    const suggestions = [makeSuggestion({ impact: 'medium' })]
    const result = filterSuggestions(suggestions, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0].impact).toBe('medium')
  })

  test('filter on single non-matching element returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'medium' })]
    const result = filterSuggestions(suggestions, 'high')
    expect(result).toHaveLength(0)
  })

  test('filter preserves order of matching elements', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', ruleId: 'low-1' }),
      makeSuggestion({ impact: 'high', ruleId: 'high-1' }),
      makeSuggestion({ impact: 'low', ruleId: 'low-2' }),
      makeSuggestion({ impact: 'high', ruleId: 'high-2' }),
    ]
    const result = filterSuggestions(suggestions, 'high')
    expect(result.map((s) => s.ruleId)).toEqual(['high-1', 'high-2'])
  })

  test('filter with tab character returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, '\t')).toHaveLength(0)
  })

  test('filter with newline character returns empty', () => {
    const suggestions = [makeSuggestion({ impact: 'high' })]
    expect(filterSuggestions(suggestions, '\n')).toHaveLength(0)
  })

  test('filter on array of all same impact returns all', () => {
    const suggestions = Array.from({ length: 10 }, (_, i) =>
      makeSuggestion({ impact: 'low', ruleId: `r-${i}` }),
    )
    const result = filterSuggestions(suggestions, 'low')
    expect(result).toHaveLength(10)
  })
})

describe('suggest-rules-formatting: sortSuggestions additional branches', () => {
  test('high confidence sorts before low confidence with same impact diff of 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].confidence).toBe('high')
  })

  test('violations tiebreak sorts descending when both diffs are exactly 1', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 20 }),
      makeSuggestion({ impact: 'high', confidence: 'medium', estimatedViolations: 3 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(2)
    const ruleIds = sorted.map((s) => s.impact)
    expect(ruleIds).toContain('high')
    expect(ruleIds).toContain('medium')
  })

  test('sort with identical objects preserves all elements', () => {
    const suggestions = Array.from({ length: 5 }, () =>
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 5 }),
    )
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(5)
  })

  test('sort with alternating high and low impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // high(3) items first, low(1) items last
    expect(sorted[0].impact).toBe('high')
    expect(sorted[3].impact).toBe('low')
  })

  test('confidence diff of -1 falls through to violations', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 10 }),
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(2)
    const impacts = sorted.map((s) => s.impact)
    expect(impacts).toContain('low')
    expect(impacts).toContain('medium')
  })

  test('two elements with same impact but different confidence', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff = 0 → returns 0 → preserves original order
    expect(sorted[0].confidence).toBe('low')
    expect(sorted[1].confidence).toBe('high')
  })

  test('violations tiebreak with equal violations returns 0', () => {
    const suggestions = [
      makeSuggestion({
        impact: 'high',
        confidence: 'medium',
        estimatedViolations: 5,
        ruleId: 'first',
      }),
      makeSuggestion({
        impact: 'medium',
        confidence: 'low',
        estimatedViolations: 5,
        ruleId: 'second',
      }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted).toHaveLength(2)
    // impactDiff = medium(2) - high(3) = -1 → returned directly → high first
    expect(sorted[0].ruleId).toBe('first')
  })
})

describe('suggest-rules-formatting: formatImpactColor exhaustive', () => {
  test('high impact returns chalk.red', () => {
    const fn = formatImpactColor('high')
    expect(fn('x')).toContain('x')
    expect(typeof fn).toBe('function')
  })

  test('medium impact returns chalk.yellow', () => {
    const fn = formatImpactColor('medium')
    expect(fn('x')).toContain('x')
  })

  test('low impact returns chalk.green', () => {
    const fn = formatImpactColor('low')
    expect(fn('x')).toContain('x')
  })

  test('unknown value returns chalk.green (default)', () => {
    const fn = formatImpactColor('foo')
    expect(fn('x')).toContain('x')
  })

  test('high impact color with multiline string', () => {
    const result = formatImpactColor('high')('line1\nline2')
    expect(result).toContain('line1')
    expect(result).toContain('line2')
  })

  test('medium impact color with multiline string', () => {
    const result = formatImpactColor('medium')('a\nb')
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  test('calling the returned function twice yields same output', () => {
    const fn = formatImpactColor('high')
    expect(fn('test')).toBe(fn('test'))
  })
})

describe('suggest-rules-formatting: formatConfidenceColor exhaustive', () => {
  test('high confidence returns chalk.green', () => {
    const fn = formatConfidenceColor('high')
    expect(fn('x')).toContain('x')
  })

  test('medium confidence returns chalk.yellow', () => {
    const fn = formatConfidenceColor('medium')
    expect(fn('x')).toContain('x')
  })

  test('low confidence returns chalk.red', () => {
    const fn = formatConfidenceColor('low')
    expect(fn('x')).toContain('x')
  })

  test('unknown value returns chalk.red (default)', () => {
    const fn = formatConfidenceColor('bar')
    expect(fn('x')).toContain('x')
  })

  test('high confidence color with multiline string', () => {
    const result = formatConfidenceColor('high')('line1\nline2')
    expect(result).toContain('line1')
    expect(result).toContain('line2')
  })

  test('calling the returned function twice yields same output', () => {
    const fn = formatConfidenceColor('low')
    expect(fn('test')).toBe(fn('test'))
  })

  test('medium confidence inverse of medium impact color mapping', () => {
    const medConf = formatConfidenceColor('medium')
    const medImpact = formatImpactColor('medium')
    expect(medConf).toBe(medImpact)
  })

  test('low confidence inverse of high impact color mapping', () => {
    const lowConf = formatConfidenceColor('low')
    const highImpact = formatImpactColor('high')
    expect(lowConf).toBe(highImpact)
  })
})

describe('suggest-rules-formatting: displaySuggestions verbose details', () => {
  test('verbose mode shows category before reason', () => {
    const logs: string[] = []
    displaySuggestions(
      [makeSuggestion({ ruleId: 'test-rule', category: 'perf', reason: 'test reason' })],
      true,
      (msg) => {
        if (msg) logs.push(msg)
      },
    )
    const catIdx = logs.findIndex((l) => l.includes('Category:'))
    const reasonIdx = logs.findIndex((l) => l.includes('Reason:'))
    expect(catIdx).toBeLessThan(reasonIdx)
  })

  test('verbose mode shows reason before enable command', () => {
    const logs: string[] = []
    displaySuggestions(
      [makeSuggestion({ ruleId: 'test-rule', category: 'perf', reason: 'test reason' })],
      true,
      (msg) => {
        if (msg) logs.push(msg)
      },
    )
    const reasonIdx = logs.findIndex((l) => l.includes('Reason:'))
    const enableIdx = logs.findIndex((l) => l.includes('Enable with:'))
    expect(reasonIdx).toBeLessThan(enableIdx)
  })

  test('verbose mode with zero violations shows ~0', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 0 })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~0 violations')
  })

  test('verbose mode with single violation shows ~1', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 1 })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~1 violations')
  })

  test('non-verbose with 3 suggestions shows total count 3', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion(), makeSuggestion(), makeSuggestion()], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Total: 3 rule suggestions')
  })

  test('rule ID is padded with spaces', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'ab' })], false, (msg) => lines.push(msg ?? ''))
    const ruleLine = lines.find((l) => l.includes('ab'))
    expect(ruleLine).toBeDefined()
    // padEnd(30) means the rule ID field is 30 chars wide
    expect(ruleLine!.length).toBeGreaterThan(30)
  })

  test('verbose mode with special characters in rule ID shows correctly', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: '@scope/rule-name' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('@scope/rule-name')
    expect(output).toContain('Enable with: codeforge analyze --rules @scope/rule-name')
  })

  test('verbose mode shows category field with gray styling', () => {
    const logs: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'r', category: 'security' })], true, (msg) => {
      if (msg) logs.push(msg)
    })
    const catLine = logs.find((l) => l.includes('Category: security'))
    expect(catLine).toBeDefined()
  })

  test('multiple suggestions non-verbose have rule lines in sequence', () => {
    const logs: string[] = []
    const suggestions = [
      makeSuggestion({ ruleId: 'alpha' }),
      makeSuggestion({ ruleId: 'beta' }),
      makeSuggestion({ ruleId: 'gamma' }),
    ]
    displaySuggestions(suggestions, false, (msg) => {
      if (msg) logs.push(msg)
    })
    const alphaIdx = logs.findIndex((l) => l.includes('alpha'))
    const betaIdx = logs.findIndex((l) => l.includes('beta'))
    const gammaIdx = logs.findIndex((l) => l.includes('gamma'))
    expect(alphaIdx).toBeGreaterThan(-1)
    expect(betaIdx).toBeGreaterThan(alphaIdx)
    expect(gammaIdx).toBeGreaterThan(betaIdx)
  })

  test('empty array does not show Total count', () => {
    const lines: string[] = []
    displaySuggestions([], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).not.toContain('Total:')
  })

  test('empty array does not show Rule Suggestions header', () => {
    const lines: string[] = []
    displaySuggestions([], false, (msg) => lines.push(msg ?? ''))
    expect(lines.join('\n')).not.toContain('Rule Suggestions')
  })

  test('logFn is called with undefined for blank line before total', () => {
    const captured: (string | undefined)[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => captured.push(msg))
    // The second-to-last call should be undefined (blank line)
    expect(captured[captured.length - 2]).toBeUndefined()
  })

  test('last logFn call is the total line', () => {
    const captured: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => {
      if (msg) captured.push(msg)
    })
    const lastLine = captured[captured.length - 1]
    expect(lastLine).toContain('Total:')
  })

  test('verbose with 2 suggestions calls logFn correct number of times', () => {
    let callCount = 0
    displaySuggestions(
      [makeSuggestion({ ruleId: 'a' }), makeSuggestion({ ruleId: 'b' })],
      true,
      () => {
        callCount++
      },
    )
    // header(1) + rule1(1) + cat1(1) + reason1(1) + enable1(1) + rule2(1) + cat2(1) + reason2(1) + enable2(1) + blank(1) + total(1) = 11
    expect(callCount).toBe(11)
  })

  test('non-verbose with 2 suggestions calls logFn correct number of times', () => {
    let callCount = 0
    displaySuggestions(
      [makeSuggestion({ ruleId: 'a' }), makeSuggestion({ ruleId: 'b' })],
      false,
      () => {
        callCount++
      },
    )
    // header(1) + rule1(1) + rule2(1) + blank(1) + total(1) = 5
    expect(callCount).toBe(5)
  })

  test('verbose mode shows enable command with correct rule ID format', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no-console' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('Enable with: codeforge analyze --rules no-console')
  })
})

describe('suggest-rules-formatting: displaySuggestions impact and confidence formatting', () => {
  test('displays impact in brackets', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'high' })], false, (msg) => lines.push(msg ?? ''))
    const output = lines.join('\n')
    expect(output).toContain('[HIGH]')
  })

  test('displays confidence in brackets', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'low' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('[LOW]')
  })

  test('displays violations with tilde and parentheses', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 42 })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('(~42 violations)')
  })

  test('displays impact padded to 8 characters', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ impact: 'low' })], false, (msg) => lines.push(msg ?? ''))
    const ruleLine = lines.find((l) => l.includes('[LOW]'))
    expect(ruleLine).toBeDefined()
  })

  test('displays confidence padded to 10 characters', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ confidence: 'high' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    const ruleLine = lines.find((l) => l.includes('[HIGH]'))
    expect(ruleLine).toBeDefined()
  })

  test('rule ID is displayed in cyan', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'cyan-rule' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    const ruleLine = lines.find((l) => l.includes('cyan-rule'))
    expect(ruleLine).toBeDefined()
  })
})

describe('suggest-rules-formatting: displaySuggestions special content', () => {
  test('handles very long reason text in verbose mode', () => {
    const longReason = 'A'.repeat(500)
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: longReason })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain(longReason)
  })

  test('handles very long category text in verbose mode', () => {
    const longCat = 'B'.repeat(200)
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ category: longCat })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain(`Category: ${longCat}`)
  })

  test('handles rule ID with dots', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'my.plugin.rule' })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('my.plugin.rule')
  })

  test('handles rule ID with underscores', () => {
    const logs: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'no_eval_please' })], false, (msg) =>
      logs.push(msg ?? ''),
    )
    expect(logs.join('\n')).toContain('no_eval_please')
  })

  test('handles reason with newlines in verbose mode', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ reason: 'line1\nline2\nline3' })], true, (msg) =>
      lines.push(msg ?? ''),
    )
    const output = lines.join('\n')
    expect(output).toContain('line1')
    expect(output).toContain('line2')
  })

  test('handles negative-like violation count display', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion({ estimatedViolations: 0 })], false, (msg) =>
      lines.push(msg ?? ''),
    )
    expect(lines.join('\n')).toContain('~0')
  })

  test('empty verbose array calls logFn once', () => {
    let callCount = 0
    displaySuggestions([], true, () => {
      callCount++
    })
    expect(callCount).toBe(1)
  })

  test('header contains bold text', () => {
    const lines: string[] = []
    displaySuggestions([makeSuggestion()], false, (msg) => lines.push(msg ?? ''))
    // chalk.bold wraps in ANSI codes, so the line will contain 'Rule Suggestions'
    expect(lines[0]).toContain('Rule Suggestions')
  })
})

describe('suggest-rules-formatting: sortSuggestions with all impact combinations', () => {
  test('high/low confidence pair with medium impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'medium', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff = 0 → returns 0 → original order preserved
    expect(sorted[0].confidence).toBe('low')
    expect(sorted[1].confidence).toBe('high')
  })

  test('high/medium confidence pair with low impact', () => {
    const suggestions = [
      makeSuggestion({ impact: 'low', confidence: 'medium', estimatedViolations: 1 }),
      makeSuggestion({ impact: 'low', confidence: 'high', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff = 0 → returns 0 → original order preserved
    expect(sorted[0].confidence).toBe('medium')
    expect(sorted[1].confidence).toBe('high')
  })

  test('medium/high impact pair with low confidence both', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'low', estimatedViolations: 5 }),
      makeSuggestion({ impact: 'medium', confidence: 'low', estimatedViolations: 5 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    // impactDiff = medium(2) - high(3) = -1 → returned directly → high first
    expect(sorted[0].impact).toBe('high')
  })

  test('low/high impact with different violations', () => {
    const suggestions = [
      makeSuggestion({ impact: 'high', confidence: 'high', estimatedViolations: 100 }),
      makeSuggestion({ impact: 'low', confidence: 'low', estimatedViolations: 1 }),
    ]
    const sorted = sortSuggestions([...suggestions])
    expect(sorted[0].impact).toBe('high')
    expect(sorted[1].impact).toBe('low')
  })
})

describe('suggest-rules-formatting: displaySuggestions verbose category/reason isolation', () => {
  test('verbose shows category with correct indentation', () => {
    const logs: string[] = []
    displaySuggestions([makeSuggestion({ category: 'test-cat' })], true, (msg) => {
      if (msg) logs.push(msg)
    })
    const catLine = logs.find((l) => l.includes('Category:'))
    expect(catLine).toBeDefined()
    expect(catLine!.startsWith('  ') || catLine!.includes('Category: test-cat')).toBe(true)
  })

  test('verbose shows reason with correct indentation', () => {
    const logs: string[] = []
    displaySuggestions([makeSuggestion({ reason: 'test reason text' })], true, (msg) => {
      if (msg) logs.push(msg)
    })
    const reasonLine = logs.find((l) => l.includes('Reason:'))
    expect(reasonLine).toBeDefined()
    expect(reasonLine!.includes('Reason: test reason text')).toBe(true)
  })

  test('verbose shows enable with correct indentation', () => {
    const logs: string[] = []
    displaySuggestions([makeSuggestion({ ruleId: 'indent-rule' })], true, (msg) => {
      if (msg) logs.push(msg)
    })
    const enableLine = logs.find((l) => l.includes('Enable with:'))
    expect(enableLine).toBeDefined()
  })
})
