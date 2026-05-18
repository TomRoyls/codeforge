import { describe, expect, it } from 'vitest'

import {
  getBestPractices,
  getRelatedRules,
  formatDescription,
  formatSeverity,
  formatFixable,
  formatMetadata,
  formatExamples,
  formatBestPractices,
  formatRelatedRules,
  formatUrl,
  displayExplainOutput,
} from '../../src/commands/explain-helpers.js'

import type { RuleMeta, RuleExample } from '../../src/rules/types.js'

// ─── getBestPractices ───

describe('getBestPractices', () => {
  it('returns default practices for unknown rule', () => {
    const practices = getBestPractices('nonexistent-rule')
    expect(practices.length).toBeGreaterThan(0)
    expect(practices).toContain('Follow the rule consistently throughout your codebase')
  })

  it('returns default practices copy', () => {
    const a = getBestPractices('nonexistent')
    const b = getBestPractices('nonexistent')
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})

// ─── getRelatedRules ───

describe('getRelatedRules', () => {
  it('returns rules from same category as fallback', () => {
    const related = getRelatedRules('some-random-rule', 'complexity')
    expect(Array.isArray(related)).toBe(true)
  })

  it('limits to 5 rules in fallback', () => {
    const related = getRelatedRules('unknown-rule', 'complexity')
    expect(related.length).toBeLessThanOrEqual(5)
  })
})

// ─── formatDescription ───

describe('formatDescription', () => {
  it('uses meta.docs.description when available', () => {
    const meta = { docs: { description: 'Detailed desc' } } as any as RuleMeta
    const result = formatDescription(meta)
    expect(result).toContain('Detailed desc')
  })

  it('falls back to meta.description', () => {
    const meta = { description: 'Fallback desc' } as any as RuleMeta
    const result = formatDescription(meta)
    expect(result).toContain('Fallback desc')
  })

  it('shows no description message when missing', () => {
    const meta = {} as any as RuleMeta
    const result = formatDescription(meta)
    expect(result).toContain('No description available')
  })
})

// ─── formatSeverity ───

describe('formatSeverity', () => {
  it('includes error severity', () => {
    const meta = { severity: 'error' } as any as RuleMeta
    expect(formatSeverity(meta)).toContain('Error')
  })

  it('includes warning severity', () => {
    const meta = { severity: 'warning' } as any as RuleMeta
    expect(formatSeverity(meta)).toContain('Warning')
  })

  it('includes info severity', () => {
    const meta = { severity: 'info' } as any as RuleMeta
    expect(formatSeverity(meta)).toContain('Info')
  })
})

// ─── formatFixable ───

describe('formatFixable', () => {
  it('shows Yes for fixable rule', () => {
    const meta = { fixable: 'code' as const } as any as RuleMeta
    expect(formatFixable(meta)).toContain('Yes')
  })

  it('shows No for non-fixable rule', () => {
    const meta = {} as any as RuleMeta
    expect(formatFixable(meta)).toContain('No')
  })
})

// ─── formatMetadata ───

describe('formatMetadata', () => {
  it('shows Yes for recommended rule', () => {
    const meta = { recommended: true } as any as RuleMeta
    expect(formatMetadata(meta)).toContain('Yes')
  })

  it('shows No for non-recommended rule', () => {
    const meta = {} as any as RuleMeta
    expect(formatMetadata(meta)).toContain('No')
  })
})

// ─── formatExamples ───

describe('formatExamples', () => {
  it('formats bad and good examples', () => {
    const examples: RuleExample[] = [
      { description: 'Avoid eval', bad: 'eval(code)', good: 'Function(code)' },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('Avoid eval')
    expect(result).toContain('eval(code)')
    expect(result).toContain('Function(code)')
  })

  it('handles multiple examples', () => {
    const examples: RuleExample[] = [
      { description: 'First', bad: 'bad1', good: 'good1' },
      { description: 'Second', bad: 'bad2', good: 'good2' },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('First')
    expect(result).toContain('Second')
  })
})

// ─── formatBestPractices ───

describe('formatBestPractices', () => {
  it('formats practices with bullet points', () => {
    const result = formatBestPractices(['Do A', 'Do B'])
    expect(result).toContain('• Do A')
    expect(result).toContain('• Do B')
  })
})

// ─── formatRelatedRules ───

describe('formatRelatedRules', () => {
  it('returns empty for empty array', () => {
    expect(formatRelatedRules([])).toBe('')
  })

  it('formats related rules with bullets', () => {
    const result = formatRelatedRules(['rule-a', 'rule-b'])
    expect(result).toContain('rule-a')
    expect(result).toContain('rule-b')
  })
})

// ─── formatUrl ───

describe('formatUrl', () => {
  it('returns empty when no URL', () => {
    const meta = {} as any as RuleMeta
    expect(formatUrl(meta)).toBe('')
  })

  it('formats URL when present', () => {
    const meta = { docs: { url: 'https://example.com' } } as any as RuleMeta
    const result = formatUrl(meta)
    expect(result).toContain('https://example.com')
  })
})

// ─── displayExplainOutput ───

describe('displayExplainOutput', () => {
  it('outputs all sections via log function', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    displayExplainOutput(
      'no-eval',
      'security',
      { description: 'No eval', severity: 'error' } as any as RuleMeta,
      [{ description: 'Example', bad: 'eval()', good: 'Function()' }],
      ['Follow the rule'],
      ['no-implied-eval'],
      logFn,
    )

    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some((m) => m.includes('no-eval'))).toBe(true)
    expect(messages.some((m) => m.includes('No eval'))).toBe(true)
    expect(messages.some((m) => m.includes('Follow the rule'))).toBe(true)
  })
})
