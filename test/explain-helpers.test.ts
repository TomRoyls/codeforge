import { describe, it, expect, vi } from 'vitest'
import {
  getBestPractices,
  getExamples,
  getRelatedRules,
  formatHeader,
  formatDescription,
  formatSeverity,
  formatFixable,
  formatMetadata,
  formatExamples,
  formatBestPractices,
  formatRelatedRules,
  formatUrl,
  displayExplainOutput,
} from '../src/commands/explain-helpers.js'
import type { RuleMeta } from '../src/rules/types.js'
import type { RuleExample } from '../src/commands/explain-data-examples.js'

function makeMeta(overrides: Partial<RuleMeta> = {}): RuleMeta {
  return {
    category: 'patterns',
    description: 'Test rule description',
    name: 'test-rule',
    recommended: false,
    ...overrides,
  }
}

// ─── getBestPractices ──────────────────────────────────
describe('getBestPractices', () => {
  it('returns default practices for unknown rule', () => {
    const practices = getBestPractices('unknown-rule-xyz')
    expect(practices.length).toBeGreaterThan(0)
    expect(practices).toContain('Follow the rule consistently throughout your codebase')
  })

  it('returns specific practices for known rule', () => {
    const practices = getBestPractices('curly')
    expect(practices.length).toBeGreaterThan(0)
  })

  it('returns a copy (not reference) of defaults', () => {
    const p1 = getBestPractices('unknown')
    const p2 = getBestPractices('unknown')
    expect(p1).toEqual(p2)
    p1.push('modified')
    expect(p2).not.toContain('modified')
  })
})

// ─── getExamples ───────────────────────────────────────
describe('getExamples', () => {
  it('returns null for unknown rule', () => {
    expect(getExamples('unknown-rule-xyz')).toBeNull()
  })

  it('returns examples for known rule', () => {
    const examples = getExamples('curly')
    expect(examples).not.toBeNull()
    expect(examples!.length).toBeGreaterThan(0)
  })

  it('returns examples with bad and good code', () => {
    const examples = getExamples('eq-eq-eq')
    expect(examples).not.toBeNull()
    for (const ex of examples!) {
      expect(ex).toHaveProperty('bad')
      expect(ex).toHaveProperty('good')
      expect(ex).toHaveProperty('description')
    }
  })
})

// ─── getRelatedRules ───────────────────────────────────
describe('getRelatedRules', () => {
  it('returns related rules for known rule', () => {
    const related = getRelatedRules('curly', 'patterns')
    expect(related.length).toBeGreaterThan(0)
  })

  it('returns rules from same category for unknown rule', () => {
    const related = getRelatedRules('unknown-rule', 'patterns')
    expect(related.length).toBeGreaterThan(0)
    expect(related.length).toBeLessThanOrEqual(5)
  })

  it('excludes the current rule from category results', () => {
    const related = getRelatedRules('unknown-rule', 'patterns')
    expect(related).not.toContain('unknown-rule')
  })

  it('returns at most 5 category-based related rules', () => {
    const related = getRelatedRules('unknown-rule', 'patterns')
    expect(related.length).toBeLessThanOrEqual(5)
  })
})

// ─── formatHeader ──────────────────────────────────────
describe('formatHeader', () => {
  it('includes the rule id', () => {
    const output = formatHeader('no-eval', 'security')
    expect(output).toContain('no-eval')
  })

  it('includes the category', () => {
    const output = formatHeader('no-eval', 'security')
    expect(output).toContain('security')
  })

  it('includes a separator line', () => {
    const output = formatHeader('no-eval', 'security')
    expect(output).toContain('─')
  })

  it('has multiple lines', () => {
    const output = formatHeader('no-eval', 'security')
    expect(output.split('\n').length).toBeGreaterThan(2)
  })
})

// ─── formatDescription ─────────────────────────────────
describe('formatDescription', () => {
  it('uses meta description by default', () => {
    const output = formatDescription(makeMeta({ description: 'My rule desc' }))
    expect(output).toContain('My rule desc')
  })

  it('uses docs description as fallback', () => {
    const output = formatDescription(
      makeMeta({ description: undefined, docs: { description: 'Docs desc' } }),
    )
    expect(output).toContain('Docs desc')
  })

  it('shows fallback for missing descriptions', () => {
    const output = formatDescription(makeMeta({ description: undefined }))
    expect(output).toContain('No description available')
  })

  it('includes "Description" header', () => {
    const output = formatDescription(makeMeta())
    expect(output).toContain('Description')
  })
})

// ─── formatSeverity ────────────────────────────────────
describe('formatSeverity', () => {
  it('formats error severity', () => {
    const output = formatSeverity(makeMeta({ severity: 'error' }))
    expect(output).toContain('Error')
    expect(output).toContain('Severity')
  })

  it('formats warning severity', () => {
    const output = formatSeverity(makeMeta({ severity: 'warning' }))
    expect(output).toContain('Warning')
  })

  it('formats info severity', () => {
    const output = formatSeverity(makeMeta({ severity: 'info' }))
    expect(output).toContain('Info')
  })

  it('uses docs severity as fallback', () => {
    const output = formatSeverity(makeMeta({ docs: { severity: 'warning' } }))
    expect(output).toContain('Warning')
  })

  it('defaults to error', () => {
    const output = formatSeverity(makeMeta())
    expect(output).toContain('Error')
  })
})

// ─── formatFixable ─────────────────────────────────────
describe('formatFixable', () => {
  it('shows Yes for fixable rules', () => {
    const output = formatFixable(makeMeta({ fixable: 'code' }))
    expect(output).toContain('Yes')
    expect(output).toContain('Auto-fixable')
  })

  it('shows No for non-fixable rules', () => {
    const output = formatFixable(makeMeta())
    expect(output).toContain('No')
  })

  it('uses docs fixable as fallback', () => {
    const output = formatFixable(makeMeta({ docs: { fixable: 'code' } }))
    expect(output).toContain('Yes')
  })
})

// ─── formatMetadata ────────────────────────────────────
describe('formatMetadata', () => {
  it('shows Yes for recommended rules', () => {
    const output = formatMetadata(makeMeta({ recommended: true }))
    expect(output).toContain('Yes')
    expect(output).toContain('Recommended')
  })

  it('shows No for non-recommended rules', () => {
    const output = formatMetadata(makeMeta({ recommended: false }))
    expect(output).toContain('No')
  })

  it('uses docs recommended as fallback', () => {
    const output = formatMetadata(makeMeta({ recommended: false, docs: { recommended: true } }))
    expect(output).toContain('Yes')
  })
})

// ─── formatExamples ────────────────────────────────────
describe('formatExamples', () => {
  const examples: RuleExample[] = [
    { bad: 'eval("x")', description: 'Using eval', good: 'parseInt("x")' },
  ]

  it('includes Examples header', () => {
    const output = formatExamples(examples)
    expect(output).toContain('Examples')
  })

  it('includes example description', () => {
    const output = formatExamples(examples)
    expect(output).toContain('Using eval')
  })

  it('includes bad code marker', () => {
    const output = formatExamples(examples)
    expect(output).toContain('Bad')
  })

  it('includes good code marker', () => {
    const output = formatExamples(examples)
    expect(output).toContain('Good')
  })

  it('handles multiple examples', () => {
    const multi = [
      { bad: 'a', description: 'first', good: 'b' },
      { bad: 'c', description: 'second', good: 'd' },
    ]
    const output = formatExamples(multi)
    expect(output).toContain('first')
    expect(output).toContain('second')
  })
})

// ─── formatBestPractices ───────────────────────────────
describe('formatBestPractices', () => {
  it('includes Best Practices header', () => {
    const output = formatBestPractices(['Do this'])
    expect(output).toContain('Best Practices')
  })

  it('lists each practice with bullet', () => {
    const output = formatBestPractices(['First', 'Second'])
    expect(output).toContain('• First')
    expect(output).toContain('• Second')
  })

  it('handles empty practices', () => {
    const output = formatBestPractices([])
    expect(output).toContain('Best Practices')
  })
})

// ─── formatRelatedRules ────────────────────────────────
describe('formatRelatedRules', () => {
  it('returns empty string for no related rules', () => {
    expect(formatRelatedRules([])).toBe('')
  })

  it('includes Related Rules header', () => {
    const output = formatRelatedRules(['no-eval', 'no-console'])
    expect(output).toContain('Related Rules')
  })

  it('lists each rule', () => {
    const output = formatRelatedRules(['no-eval', 'no-console'])
    expect(output).toContain('no-eval')
    expect(output).toContain('no-console')
  })
})

// ─── formatUrl ─────────────────────────────────────────
describe('formatUrl', () => {
  it('returns empty string when no URL', () => {
    expect(formatUrl(makeMeta())).toBe('')
  })

  it('includes Documentation header and URL', () => {
    const output = formatUrl(makeMeta({ docs: { url: 'https://example.com' } }))
    expect(output).toContain('Documentation')
    expect(output).toContain('https://example.com')
  })
})

// ─── displayExplainOutput ──────────────────────────────
describe('displayExplainOutput', () => {
  it('calls logFn multiple times for full output', () => {
    const logFn = vi.fn()
    displayExplainOutput(
      'no-eval',
      'security',
      makeMeta({ description: 'No eval' }),
      null,
      ['Practice 1'],
      [],
      logFn,
    )
    expect(logFn).toHaveBeenCalled()
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('no-eval')
    expect(calls).toContain('security')
    expect(calls).toContain('Description')
  })

  it('includes examples when provided', () => {
    const logFn = vi.fn()
    const examples = [{ bad: 'eval(x)', description: 'test', good: 'foo(x)' }]
    displayExplainOutput('rule', 'cat', makeMeta(), examples, [], [], logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('Examples')
    expect(calls).toContain('test')
  })

  it('includes related rules when provided', () => {
    const logFn = vi.fn()
    displayExplainOutput('rule', 'cat', makeMeta(), null, [], ['other-rule'], logFn)
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('Related Rules')
    expect(calls).toContain('other-rule')
  })

  it('includes URL when available', () => {
    const logFn = vi.fn()
    displayExplainOutput(
      'rule',
      'cat',
      makeMeta({ docs: { url: 'https://docs.example.com' } }),
      null,
      [],
      [],
      logFn,
    )
    const calls = logFn.mock.calls.flat().join('\n')
    expect(calls).toContain('https://docs.example.com')
  })
})
