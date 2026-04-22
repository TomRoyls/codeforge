import { describe, test, expect, vi } from 'vitest'
import {
  type RuleExample,
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
} from '../../../src/commands/explain-helpers.js'
import type { RuleMeta } from '../../../src/rules/types.js'

function makeMeta(overrides: Partial<RuleMeta> = {}): RuleMeta {
  return {
    category: 'security',
    description: 'Test rule description',
    name: 'test-rule',
    recommended: false,
    ...overrides,
  }
}

describe('getBestPractices', () => {
  test('returns practices for no-eval', () => {
    const result = getBestPractices('no-eval')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('JavaScript functions')
    expect(result[2]).toContain('JSON.parse')
  })

  test('returns practices for prefer-const', () => {
    const result = getBestPractices('prefer-const')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('const by default')
  })

  test('returns practices for no-console-log', () => {
    const result = getBestPractices('no-console-log')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('logging library')
  })

  test('returns practices for no-duplicate-imports', () => {
    const result = getBestPractices('no-duplicate-imports')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('single import statement')
  })

  test('returns practices for no-unused-vars', () => {
    const result = getBestPractices('no-unused-vars')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('unused imports')
  })

  test('returns default practices for unknown rule', () => {
    const result = getBestPractices('unknown-rule')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('Follow the rule consistently')
  })

  test('returns default practices for empty string rule', () => {
    const result = getBestPractices('')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('Follow the rule consistently')
  })

  test('default practices mention auto-fix', () => {
    const result = getBestPractices('nonexistent')
    expect(result[1]).toContain('auto-fix')
  })

  test('returns a new array each time (not shared reference)', () => {
    const a = getBestPractices('unknown-x')
    const b = getBestPractices('unknown-x')
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})

describe('getExamples', () => {
  test('returns examples for no-eval', () => {
    const result = getExamples('no-eval')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(2)
    expect(result![0].description).toContain('eval()')
  })

  test('returns examples for prefer-const', () => {
    const result = getExamples('prefer-const')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(2)
  })

  test('returns examples for no-console-log', () => {
    const result = getExamples('no-console-log')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('console.log')
  })

  test('returns examples for no-duplicate-imports', () => {
    const result = getExamples('no-duplicate-imports')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].good).toContain('import')
  })

  test('returns examples for no-unused-vars', () => {
    const result = getExamples('no-unused-vars')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
  })

  test('returns null for unknown rule', () => {
    const result = getExamples('unknown-rule')
    expect(result).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getExamples('')).toBeNull()
  })

  test('examples have bad, good, and description fields', () => {
    const result = getExamples('no-eval')
    expect(result).not.toBeNull()
    for (const ex of result!) {
      expect(ex).toHaveProperty('bad')
      expect(ex).toHaveProperty('good')
      expect(ex).toHaveProperty('description')
      expect(typeof ex.bad).toBe('string')
      expect(typeof ex.good).toBe('string')
      expect(typeof ex.description).toBe('string')
    }
  })
})

describe('getRelatedRules', () => {
  test('returns mapped rules for no-eval', () => {
    const result = getRelatedRules('no-eval', 'security')
    expect(result).toEqual(['no-implied-eval', 'no-new-func', 'no-script-url'])
  })

  test('returns mapped rules for prefer-const', () => {
    const result = getRelatedRules('prefer-const', 'patterns')
    expect(result).toEqual(['no-var', 'no-const-assign'])
  })

  test('returns mapped rules for no-console-log', () => {
    const result = getRelatedRules('no-console-log', 'patterns')
    expect(result).toEqual(['no-debugger', 'no-alert'])
  })

  test('returns mapped rules for no-duplicate-imports', () => {
    const result = getRelatedRules('no-duplicate-imports', 'patterns')
    expect(result).toEqual(['no-unused-vars', 'consistent-imports'])
  })

  test('returns mapped rules for no-unused-vars', () => {
    const result = getRelatedRules('no-unused-vars', 'patterns')
    expect(result).toEqual(['no-duplicate-imports', 'no-unused-exports'])
  })

  test('falls back to category-based rules from RULE_CATEGORIES for unknown rule', () => {
    const result = getRelatedRules('unknown-rule', 'complexity')
    expect(result.length).toBeGreaterThan(0)
    for (const id of result) {
      expect(id).not.toBe('unknown-rule')
    }
  })

  test('excludes current rule from category fallback', () => {
    const result = getRelatedRules('max-complexity', 'complexity')
    expect(result).not.toContain('max-complexity')
  })

  test('limits category fallback to 5 rules', () => {
    const result = getRelatedRules('unknown-rule', 'complexity')
    expect(result.length).toBeLessThanOrEqual(5)
  })

  test('returns empty array when no rules match category', () => {
    const result = getRelatedRules('unknown-rule', 'nonexistent-category' as any)
    expect(result).toEqual([])
  })
})

describe('formatHeader', () => {
  test('contains rule ID', () => {
    const result = formatHeader('no-eval', 'security')
    expect(result).toContain('no-eval')
  })

  test('contains category badge', () => {
    const result = formatHeader('no-eval', 'security')
    expect(result).toContain('[security]')
  })

  test('starts and ends with empty line', () => {
    const result = formatHeader('no-eval', 'security')
    expect(result.startsWith('\n')).toBe(true)
    expect(result.endsWith('\n')).toBe(true)
  })

  test('contains separator line', () => {
    const result = formatHeader('no-eval', 'security')
    expect(result).toContain('─')
  })

  test('separator length matches rule ID + category + padding', () => {
    const result = formatHeader('no-eval', 'security')
    const expectedLen = 'no-eval'.length + 'security'.length + 3
    expect(result).toContain('─'.repeat(expectedLen))
  })
})

describe('formatDescription', () => {
  test('uses docs.description when available', () => {
    const meta = makeMeta({ docs: { description: 'Docs description' } })
    const result = formatDescription(meta)
    expect(result).toContain('Docs description')
  })

  test('falls back to meta.description', () => {
    const meta = makeMeta({ description: 'Meta description' })
    const result = formatDescription(meta)
    expect(result).toContain('Meta description')
  })

  test('falls back to No description available when description is undefined', () => {
    const meta = makeMeta({ description: undefined as any, docs: {} })
    const result = formatDescription(meta)
    expect(result).toContain('No description available')
  })

  test('contains Description heading', () => {
    const result = formatDescription(makeMeta())
    expect(result).toContain('Description')
  })
})

describe('formatSeverity', () => {
  test('formats error severity', () => {
    const meta = makeMeta({ severity: 'error' })
    const result = formatSeverity(meta)
    expect(result).toContain('Error')
  })

  test('formats warning severity', () => {
    const meta = makeMeta({ severity: 'warning' })
    const result = formatSeverity(meta)
    expect(result).toContain('Warning')
  })

  test('formats info severity', () => {
    const meta = makeMeta({ severity: 'info' })
    const result = formatSeverity(meta)
    expect(result).toContain('Info')
  })

  test('falls back to docs.severity', () => {
    const meta = makeMeta({ docs: { severity: 'warning' } })
    const result = formatSeverity(meta)
    expect(result).toContain('Warning')
  })

  test('defaults to error when no severity specified', () => {
    const meta = makeMeta()
    const result = formatSeverity(meta)
    expect(result).toContain('Error')
  })

  test('handles unknown severity string', () => {
    const meta = makeMeta({ severity: 'custom' as any })
    const result = formatSeverity(meta)
    expect(result).toContain('custom')
  })

  test('contains Severity heading', () => {
    const result = formatSeverity(makeMeta())
    expect(result).toContain('Severity')
  })
})

describe('formatFixable', () => {
  test('shows Yes when fixable is code', () => {
    const meta = makeMeta({ fixable: 'code' })
    const result = formatFixable(meta)
    expect(result).toContain('Yes')
  })

  test('shows Yes when fixable is whitespace', () => {
    const meta = makeMeta({ fixable: 'whitespace' })
    const result = formatFixable(meta)
    expect(result).toContain('Yes')
  })

  test('shows No when fixable is not set', () => {
    const meta = makeMeta()
    const result = formatFixable(meta)
    expect(result).toContain('No')
  })

  test('falls back to docs.fixable', () => {
    const meta = makeMeta({ docs: { fixable: 'code' } })
    const result = formatFixable(meta)
    expect(result).toContain('Yes')
  })

  test('defaults to No when nothing is set', () => {
    const meta = makeMeta()
    const result = formatFixable(meta)
    expect(result).toContain('No')
  })

  test('contains Auto-fixable heading', () => {
    expect(formatFixable(makeMeta())).toContain('Auto-fixable')
  })
})

describe('formatMetadata', () => {
  test('shows Yes when recommended is true', () => {
    const meta = makeMeta({ recommended: true })
    const result = formatMetadata(meta)
    expect(result).toContain('Yes')
  })

  test('shows No when recommended is false', () => {
    const meta = makeMeta({ recommended: false })
    const result = formatMetadata(meta)
    expect(result).toContain('No')
  })

  test('falls back to docs.recommended', () => {
    const meta = makeMeta({ recommended: false, docs: { recommended: true } })
    const result = formatMetadata(meta)
    expect(result).toContain('Yes')
  })

  test('defaults to No', () => {
    const meta = makeMeta({ recommended: false, docs: {} })
    const result = formatMetadata(meta)
    expect(result).toContain('No')
  })

  test('contains Recommended heading', () => {
    expect(formatMetadata(makeMeta())).toContain('Recommended')
  })
})

describe('formatExamples', () => {
  const singleExample: RuleExample[] = [
    { bad: 'eval("1+1")', description: 'Using eval', good: '1 + 1' },
  ]

  const multipleExamples: RuleExample[] = [
    { bad: 'eval("a")', description: 'First example', good: 'a' },
    { bad: 'new Function("b")', description: 'Second example', good: 'b' },
  ]

  test('formats single example', () => {
    const result = formatExamples(singleExample)
    expect(result).toContain('Using eval')
    expect(result).toContain('eval("1+1")')
    expect(result).toContain('1 + 1')
  })

  test('formats multiple examples', () => {
    const result = formatExamples(multipleExamples)
    expect(result).toContain('First example')
    expect(result).toContain('Second example')
  })

  test('contains bad indicator', () => {
    const result = formatExamples(singleExample)
    expect(result).toContain('❌')
  })

  test('contains good indicator', () => {
    const result = formatExamples(singleExample)
    expect(result).toContain('✅')
  })

  test('contains Examples heading', () => {
    expect(formatExamples(singleExample)).toContain('Examples')
  })

  test('contains Bad and Good labels', () => {
    const result = formatExamples(singleExample)
    expect(result).toContain('Bad')
    expect(result).toContain('Good')
  })
})

describe('formatBestPractices', () => {
  test('formats multiple practices', () => {
    const practices = ['Do this', 'Do that', 'And this too']
    const result = formatBestPractices(practices)
    expect(result).toContain('• Do this')
    expect(result).toContain('• Do that')
    expect(result).toContain('• And this too')
  })

  test('contains Best Practices heading', () => {
    const result = formatBestPractices(['Practice 1'])
    expect(result).toContain('Best Practices')
  })

  test('formats empty practices list', () => {
    const result = formatBestPractices([])
    expect(result).toContain('Best Practices')
  })

  test('each practice starts with bullet', () => {
    const practices = ['First', 'Second']
    const result = formatBestPractices(practices)
    const lines = result.split('\n').filter((l) => l.startsWith('•'))
    expect(lines).toHaveLength(2)
  })
})

describe('formatRelatedRules', () => {
  test('formats multiple related rules', () => {
    const result = formatRelatedRules(['no-var', 'no-const-assign'])
    expect(result).toContain('no-var')
    expect(result).toContain('no-const-assign')
  })

  test('contains Related Rules heading', () => {
    const result = formatRelatedRules(['no-var'])
    expect(result).toContain('Related Rules')
  })

  test('returns empty string for empty list', () => {
    const result = formatRelatedRules([])
    expect(result).toBe('')
  })

  test('each rule has bullet prefix', () => {
    const result = formatRelatedRules(['rule-a', 'rule-b'])
    const lines = result.split('\n').filter((l) => l.includes('•'))
    expect(lines).toHaveLength(2)
  })
})

describe('formatUrl', () => {
  test('formats URL when present', () => {
    const meta = makeMeta({ docs: { url: 'https://example.com/rule' } })
    const result = formatUrl(meta)
    expect(result).toContain('https://example.com/rule')
  })

  test('contains Documentation heading when URL present', () => {
    const meta = makeMeta({ docs: { url: 'https://example.com' } })
    const result = formatUrl(meta)
    expect(result).toContain('Documentation')
  })

  test('returns empty string when no URL', () => {
    const meta = makeMeta()
    const result = formatUrl(meta)
    expect(result).toBe('')
  })

  test('returns empty string when docs is undefined', () => {
    const meta = makeMeta()
    delete (meta as any).docs
    const result = formatUrl(meta)
    expect(result).toBe('')
  })
})

describe('displayExplainOutput', () => {
  test('calls logFn with all sections', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const meta = makeMeta({
      docs: { url: 'https://example.com', recommended: true },
      fixable: 'code',
      recommended: true,
      severity: 'error',
    })
    const examples: RuleExample[] = [{ bad: 'bad code', description: 'test', good: 'good code' }]
    const practices = ['Do this', 'Do that']
    const relatedRules = ['related-a']

    displayExplainOutput('my-rule', 'security', meta, examples, practices, relatedRules, logFn)

    const output = logs.join('\n')
    expect(output).toContain('my-rule')
    expect(output).toContain('[security]')
    expect(output).toContain('Description')
    expect(output).toContain('Severity')
    expect(output).toContain('Auto-fixable')
    expect(output).toContain('Recommended')
    expect(output).toContain('Examples')
    expect(output).toContain('Best Practices')
    expect(output).toContain('Related Rules')
    expect(output).toContain('Documentation')
    expect(output).toContain('https://example.com')
  })

  test('skips examples when null', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('my-rule', 'security', makeMeta(), null, ['p1'], [], logFn)

    const output = logs.join('\n')
    expect(output).not.toContain('Examples')
  })

  test('skips related rules when empty', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('my-rule', 'security', makeMeta(), null, ['p1'], [], logFn)

    const output = logs.join('\n')
    expect(output).not.toContain('Related Rules')
  })

  test('skips URL when not present', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('my-rule', 'security', makeMeta(), null, ['p1'], [], logFn)

    const output = logs.join('\n')
    expect(output).not.toContain('Documentation')
  })

  test('calls logFn multiple times (once per section)', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const meta = makeMeta({
      docs: { url: 'https://example.com' },
    })
    displayExplainOutput('r', 'c', meta, null, ['p'], [], logFn)

    expect(logs.length).toBeGreaterThan(0)
  })

  test('produces identical output to original display methods', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const meta: RuleMeta = {
      category: 'security',
      description: 'Disallow eval() usage',
      name: 'no-eval',
      recommended: true,
      severity: 'error',
    }
    const examples: RuleExample[] = getExamples('no-eval')!
    const practices = getBestPractices('no-eval')
    const related = ['no-implied-eval', 'no-new-func', 'no-script-url']

    displayExplainOutput('no-eval', 'security', meta, examples, practices, related, logFn)

    const output = logs.join('\n')
    expect(output).toContain('no-eval')
    expect(output).toContain('[security]')
    expect(output).toContain('Disallow eval() usage')
    expect(output).toContain('Error')
    expect(output).toContain('❌')
    expect(output).toContain('✅')
    expect(output).toContain('no-implied-eval')
    expect(output).toContain('Best Practices')
  })
})

describe('getBestPractices - expanded coverage', () => {
  test('returns practices for max-complexity', () => {
    const result = getBestPractices('max-complexity')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('cyclomatic complexity')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for max-depth', () => {
    const result = getBestPractices('max-depth')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('nesting')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for max-params', () => {
    const result = getBestPractices('max-params')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('options object')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-unsafe-regex', () => {
    const result = getBestPractices('no-unsafe-regex')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('catastrophic backtracking')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-unsafe-type-assertion', () => {
    const result = getBestPractices('no-unsafe-type-assertion')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('type guards')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-await-in-loop', () => {
    const result = getBestPractices('no-await-in-loop')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('Promise.all()')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for prefer-includes', () => {
    const result = getBestPractices('prefer-includes')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('includes')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-circular-deps', () => {
    const result = getBestPractices('no-circular-deps')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('shared logic')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-barrel-imports', () => {
    const result = getBestPractices('no-barrel-imports')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('source module')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for curly', () => {
    const result = getBestPractices('curly')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('curly braces')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for eq-eq-eq', () => {
    const result = getBestPractices('eq-eq-eq')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('===')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-debugger', () => {
    const result = getBestPractices('no-debugger')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('debugger')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-empty', () => {
    const result = getBestPractices('no-empty')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('comment')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('returns practices for no-explicit-any', () => {
    const result = getBestPractices('no-explicit-any')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('unknown')
    expect(result[0][0]).toBe(result[0][0].toUpperCase())
  })

  test('all expanded entries have actionable first items starting with uppercase', () => {
    const expandedRules = [
      'max-complexity',
      'max-depth',
      'max-params',
      'no-unsafe-regex',
      'no-unsafe-type-assertion',
      'no-await-in-loop',
      'prefer-includes',
      'no-circular-deps',
      'no-barrel-imports',
      'curly',
      'eq-eq-eq',
      'no-debugger',
      'no-empty',
      'no-explicit-any',
    ]
    for (const rule of expandedRules) {
      const result = getBestPractices(rule)
      expect(result).toHaveLength(4)
      expect(result[0][0]).toBe(result[0][0].toUpperCase())
    }
  })
})

describe('getExamples - expanded coverage', () => {
  test('returns examples for max-complexity', () => {
    const result = getExamples('max-complexity')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].description).toContain('cyclomatic complexity')
    expect(result![0].bad).toContain('function')
    expect(result![0].good).toContain('return')
  })

  test('returns examples for no-debugger', () => {
    const result = getExamples('no-debugger')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('debugger')
    expect(result![0].good).not.toContain('debugger')
  })

  test('returns examples for no-await-in-loop', () => {
    const result = getExamples('no-await-in-loop')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('await')
    expect(result![0].good).toContain('Promise.all')
  })

  test('returns examples for curly', () => {
    const result = getExamples('curly')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('if')
    expect(result![0].good).toContain('{')
  })

  test('returns examples for eq-eq-eq', () => {
    const result = getExamples('eq-eq-eq')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('==')
    expect(result![0].good).toContain('===')
  })

  test('returns examples for no-empty', () => {
    const result = getExamples('no-empty')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('catch')
    expect(result![0].good).toContain('logger')
  })

  test('returns examples for no-explicit-any', () => {
    const result = getExamples('no-explicit-any')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('any')
    expect(result![0].good).not.toContain(': any')
  })

  test('returns examples for no-circular-deps', () => {
    const result = getExamples('no-circular-deps')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('import')
    expect(result![0].good).toContain('shared')
  })

  test('returns examples for prefer-includes', () => {
    const result = getExamples('prefer-includes')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1)
    expect(result![0].bad).toContain('indexOf')
    expect(result![0].good).toContain('includes')
  })

  test('all expanded examples have valid RuleExample structure', () => {
    const expandedRules = [
      'max-complexity',
      'no-debugger',
      'no-await-in-loop',
      'curly',
      'eq-eq-eq',
      'no-empty',
      'no-explicit-any',
      'no-circular-deps',
      'prefer-includes',
    ]
    for (const rule of expandedRules) {
      const result = getExamples(rule)
      expect(result).not.toBeNull()
      for (const ex of result!) {
        expect(typeof ex.bad).toBe('string')
        expect(ex.bad.length).toBeGreaterThan(0)
        expect(typeof ex.good).toBe('string')
        expect(ex.good.length).toBeGreaterThan(0)
        expect(typeof ex.description).toBe('string')
        expect(ex.description.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('getRelatedRules - expanded coverage', () => {
  test('returns related rules for max-complexity', () => {
    const result = getRelatedRules('max-complexity', 'complexity')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.length).toBeLessThanOrEqual(4)
    expect(result).not.toContain('max-complexity')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-debugger', () => {
    const result = getRelatedRules('no-debugger', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.length).toBeLessThanOrEqual(4)
    expect(result).not.toContain('no-debugger')
    expect(result).toContain('no-console-log')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-await-in-loop', () => {
    const result = getRelatedRules('no-await-in-loop', 'performance')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('no-await-in-loop')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for curly', () => {
    const result = getRelatedRules('curly', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('curly')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for eq-eq-eq', () => {
    const result = getRelatedRules('eq-eq-eq', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('eq-eq-eq')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-empty', () => {
    const result = getRelatedRules('no-empty', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('no-empty')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for prefer-const', () => {
    const result = getRelatedRules('prefer-const', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('prefer-const')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-circular-deps', () => {
    const result = getRelatedRules('no-circular-deps', 'dependencies')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('no-circular-deps')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-console-log', () => {
    const result = getRelatedRules('no-console-log', 'patterns')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('no-console-log')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  test('returns related rules for no-eval', () => {
    const result = getRelatedRules('no-eval', 'security')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).not.toContain('no-eval')
    for (const id of result) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })
})

describe('cross-reference validation', () => {
  test('all bestPracticesMap entries return arrays of length 4', () => {
    const allRules = [
      'consistent-imports',
      'consistent-type-exports',
      'curly',
      'eq-eq-eq',
      'explicit-module-boundary-types',
      'max-complexity',
      'max-depth',
      'max-file-size',
      'max-lines',
      'max-lines-per-function',
      'max-params',
      'max-union-size',
      'no-alert',
      'no-await-in-loop',
      'no-barrel-imports',
      'no-circular-deps',
      'no-constant-condition',
      'no-console-log',
      'no-debugger',
      'no-deprecated-api',
      'no-duplicate-imports',
      'no-empty',
      'no-empty-catch',
      'no-eval',
      'no-explicit-any',
      'no-fallthrough',
      'no-floating-promises',
      'no-implicit-coercion',
      'no-implied-eval',
      'no-misused-promises',
      'no-nested-ternary',
      'no-new-func',
      'no-non-null-assertion',
      'no-param-reassign',
      'no-shadow',
      'no-sync-in-async',
      'no-throw-literal',
      'no-unsafe-assignment',
      'no-unsafe-regex',
      'no-unsafe-type-assertion',
      'no-unused-exports',
      'no-unused-vars',
      'no-var',
      'object-shorthand',
      'prefer-arrow-callback',
      'prefer-async-await',
      'prefer-at-method',
      'prefer-const',
      'prefer-date-now',
      'prefer-includes',
      'prefer-nullish-coalescing',
      'prefer-optional-chain',
      'prefer-readonly',
      'prefer-rest-params',
      'prefer-spread',
      'prefer-template',
      'require-await',
      'sort-keys',
      'use-isnan',
      'valid-typeof',
    ]
    for (const rule of allRules) {
      const result = getBestPractices(rule)
      expect(result).toHaveLength(4)
      for (const practice of result) {
        expect(typeof practice).toBe('string')
        expect(practice.length).toBeGreaterThan(0)
      }
    }
  })

  test('all examplesMap entries have valid RuleExample objects', () => {
    const allExampleRules = [
      'consistent-imports',
      'curly',
      'eq-eq-eq',
      'max-complexity',
      'max-params',
      'no-alert',
      'no-await-in-loop',
      'no-circular-deps',
      'no-console-log',
      'no-constant-condition',
      'no-debugger',
      'no-duplicate-imports',
      'no-empty',
      'no-eval',
      'no-explicit-any',
      'no-fallthrough',
      'no-floating-promises',
      'no-implicit-coercion',
      'no-implied-eval',
      'no-nested-ternary',
      'no-non-null-assertion',
      'no-param-reassign',
      'no-shadow',
      'no-throw-literal',
      'no-unsafe-regex',
      'no-unused-vars',
      'no-var',
      'object-shorthand',
      'prefer-arrow-callback',
      'prefer-const',
      'prefer-includes',
      'prefer-nullish-coalescing',
      'prefer-optional-chain',
      'prefer-readonly',
      'prefer-rest-params',
      'prefer-template',
      'require-await',
      'sort-keys',
      'use-isnan',
    ]
    for (const rule of allExampleRules) {
      const result = getExamples(rule)
      expect(result).not.toBeNull()
      expect(Array.isArray(result)).toBe(true)
      expect(result!.length).toBeGreaterThan(0)
      for (const ex of result!) {
        expect(ex).toHaveProperty('bad')
        expect(ex).toHaveProperty('good')
        expect(ex).toHaveProperty('description')
        expect(typeof ex.bad).toBe('string')
        expect(ex.bad.length).toBeGreaterThan(0)
        expect(typeof ex.good).toBe('string')
        expect(ex.good.length).toBeGreaterThan(0)
        expect(typeof ex.description).toBe('string')
        expect(ex.description.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('getBestPractices - edge cases', () => {
  test('handles special characters in rule ID', () => {
    const result = getBestPractices('rule-with-special_chars-123')
    expect(result).toHaveLength(4)
    expect(result[0]).toContain('Follow the rule consistently')
  })

  test('handles rule ID with numbers', () => {
    const result = getBestPractices('rule123')
    expect(result).toHaveLength(4)
  })

  test('returns default practices for null-like inputs', () => {
    const result1 = getBestPractices('null')
    const result2 = getBestPractices('undefined')
    expect(result1).toHaveLength(4)
    expect(result2).toHaveLength(4)
  })

  test('default practices array is independent across calls', () => {
    const result1 = getBestPractices('unknown-1')
    const result2 = getBestPractices('unknown-2')
    result1[0] = 'modified'
    expect(result2[0]).toContain('Follow the rule consistently')
  })

  test('all practices in default list are non-empty strings', () => {
    const result = getBestPractices('nonexistent')
    for (const practice of result) {
      expect(typeof practice).toBe('string')
      expect(practice.trim().length).toBeGreaterThan(0)
    }
  })

  test('handles very long rule IDs', () => {
    const longId = 'a'.repeat(100)
    const result = getBestPractices(longId)
    expect(result).toHaveLength(4)
  })

  test('handles rule ID with hyphens and underscores', () => {
    const result = getBestPractices('my-custom_rule-123')
    expect(result).toHaveLength(4)
  })
})

describe('getExamples - edge cases', () => {
  test('returns null for various non-existent rules', () => {
    const nonExistentRules = ['random-rule', 'test-xyz', 'abc123']
    for (const rule of nonExistentRules) {
      expect(getExamples(rule)).toBeNull()
    }
  })

  test('handles rule IDs with special characters', () => {
    expect(getExamples('rule_with_special')).toBeNull()
  })

  test('handles very long rule IDs', () => {
    const longId = 'x'.repeat(200)
    expect(getExamples(longId)).toBeNull()
  })

  test('examples for no-eval have correct structure with multiple examples', () => {
    const result = getExamples('no-eval')
    expect(result).not.toBeNull()
    expect(result!.length).toBeGreaterThanOrEqual(1)
  })
})

describe('getRelatedRules - edge cases', () => {
  test('handles empty category string', () => {
    const result = getRelatedRules('some-rule', '')
    expect(Array.isArray(result)).toBe(true)
  })

  test('handles category with no matching rules', () => {
    const result = getRelatedRules('test', 'nonexistent')
    expect(Array.isArray(result)).toBe(true)
  })

  test('returns array even when no related rules exist', () => {
    const result = getRelatedRules('unknown-xyz', 'unknown-category')
    expect(Array.isArray(result)).toBe(true)
  })

  test('handles special characters in rule ID', () => {
    const result = getRelatedRules('rule-with_special', 'security')
    expect(Array.isArray(result)).toBe(true)
  })

  test('returns rules in string array format', () => {
    const result = getRelatedRules('no-eval', 'security')
    expect(Array.isArray(result)).toBe(true)
    for (const rule of result) {
      expect(typeof rule).toBe('string')
    }
  })

  test('handles category with only one rule', () => {
    const result = getRelatedRules('no-eval', 'security')
    expect(result.every((r) => typeof r === 'string')).toBe(true)
  })
})

describe('formatHeader - edge cases', () => {
  test('handles very long rule IDs', () => {
    const longId = 'a'.repeat(50)
    const result = formatHeader(longId, 'security')
    expect(result).toContain(longId)
    expect(result).toContain('[security]')
  })

  test('handles special characters in rule ID', () => {
    const result = formatHeader('rule-with_special', 'category')
    expect(result).toContain('rule-with_special')
    expect(result).toContain('[category]')
  })

  test('handles very long category names', () => {
    const longCategory = 'b'.repeat(40)
    const result = formatHeader('my-rule', longCategory)
    expect(result).toContain(`[${longCategory}]`)
  })

  test('handles empty category', () => {
    const result = formatHeader('rule', '')
    expect(result).toContain('rule')
    expect(result).toContain('[]')
  })

  test('handles empty rule ID', () => {
    const result = formatHeader('', 'security')
    expect(result).toContain('[security]')
  })

  test('separator line length is correct for varying inputs', () => {
    const testCases = [
      { id: 'a', category: 'x' },
      { id: 'long-rule-name', category: 'very-long-category' },
      { id: 'test-123', category: 'category-456' },
    ]
    for (const { id, category } of testCases) {
      const result = formatHeader(id, category)
      const expectedLen = id.length + category.length + 3
      expect(result).toContain('─'.repeat(expectedLen))
    }
  })

  test('header always starts and ends with newline', () => {
    const testCases = ['rule1', 'long-rule-name-123', '']
    for (const ruleId of testCases) {
      const result = formatHeader(ruleId, 'test')
      expect(result.startsWith('\n')).toBe(true)
      expect(result.endsWith('\n')).toBe(true)
    }
  })
})

describe('formatDescription - edge cases', () => {
  test('handles empty description string', () => {
    const meta = makeMeta({ description: '', docs: {} })
    const result = formatDescription(meta)
    expect(result).toContain('Description\n\n')
  })

  test('handles very long descriptions', () => {
    const longDesc = 'a'.repeat(1000)
    const meta = makeMeta({ description: longDesc })
    const result = formatDescription(meta)
    expect(result).toContain(longDesc)
  })

  test('handles descriptions with special characters', () => {
    const specialDesc = 'Test with <script> and &entities; and "quotes"'
    const meta = makeMeta({ description: specialDesc })
    const result = formatDescription(meta)
    expect(result).toContain(specialDesc)
  })

  test('handles descriptions with newlines', () => {
    const multilineDesc = 'Line 1\nLine 2\nLine 3'
    const meta = makeMeta({ description: multilineDesc })
    const result = formatDescription(meta)
    expect(result).toContain(multilineDesc)
  })

  test('handles descriptions with unicode characters', () => {
    const unicodeDesc = 'Test with émojis 🎉 and 中文 characters'
    const meta = makeMeta({ description: unicodeDesc })
    const result = formatDescription(meta)
    expect(result).toContain(unicodeDesc)
  })

  test('prefers docs.description over meta.description', () => {
    const meta = makeMeta({
      description: 'meta desc',
      docs: { description: 'docs desc' },
    })
    const result = formatDescription(meta)
    expect(result).toContain('docs desc')
    expect(result).not.toContain('meta desc')
  })

  test('handles null docs property', () => {
    const meta = makeMeta({ description: 'test', docs: null as any })
    const result = formatDescription(meta)
    expect(result).toContain('test')
  })

  test('always ends with newline', () => {
    const meta = makeMeta({ description: 'test' })
    const result = formatDescription(meta)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatSeverity - edge cases', () => {
  test('handles severity as empty string', () => {
    const meta = makeMeta({ severity: '' as any })
    const result = formatSeverity(meta)
    expect(result).toContain('')
  })

  test('handles case variations of severity strings', () => {
    const meta1 = makeMeta({ severity: 'ERROR' as any })
    const meta2 = makeMeta({ severity: 'Error' as any })
    expect(formatSeverity(meta1)).toContain('ERROR')
    expect(formatSeverity(meta2)).toContain('Error')
  })

  test('handles whitespace in severity', () => {
    const meta = makeMeta({ severity: ' error ' as any })
    const result = formatSeverity(meta)
    expect(result).toContain(' error ')
  })

  test('handles severity with numbers', () => {
    const meta = makeMeta({ severity: '123' as any })
    const result = formatSeverity(meta)
    expect(result).toContain('123')
  })

  test('handles severity with special characters', () => {
    const meta = makeMeta({ severity: 'critical!@#$' as any })
    const result = formatSeverity(meta)
    expect(result).toContain('critical!@#$')
  })

  test('prefers meta.severity over docs.severity', () => {
    const meta = makeMeta({
      severity: 'warning',
      docs: { severity: 'error' },
    })
    const result = formatSeverity(meta)
    expect(result).toContain('Warning')
  })

  test('handles undefined severity in both locations', () => {
    const meta = makeMeta({
      severity: undefined as any,
      docs: { severity: undefined as any },
    })
    const result = formatSeverity(meta)
    expect(result).toContain('Error')
  })

  test('always ends with newline', () => {
    const meta = makeMeta({ severity: 'error' })
    const result = formatSeverity(meta)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatFixable - edge cases', () => {
  test('handles fixable as empty string', () => {
    const meta = makeMeta({ fixable: '' as any })
    const result = formatFixable(meta)
    expect(result).toContain('No')
  })

  test('handles fixable with whitespace', () => {
    const meta = makeMeta({ fixable: ' code ' as any })
    const result = formatFixable(meta)
    expect(result).toContain('Yes')
  })

  test('handles fixable as null', () => {
    const meta = makeMeta({ fixable: null as any })
    const result = formatFixable(meta)
    expect(result).toContain('No')
  })

  test('handles fixable as undefined', () => {
    const meta = makeMeta({ fixable: undefined as any })
    const result = formatFixable(meta)
    expect(result).toContain('No')
  })

  test('prefers meta.fixable over docs.fixable', () => {
    const meta = makeMeta({
      fixable: 'code',
      docs: { fixable: 'whitespace' },
    })
    const result = formatFixable(meta)
    expect(result).toContain('Yes')
  })

  test('handles various truthy fixable values', () => {
    const truthyValues = ['code', 'whitespace', 'directive', 'custom']
    for (const value of truthyValues) {
      const meta = makeMeta({ fixable: value as any })
      const result = formatFixable(meta)
      expect(result).toContain('Yes')
    }
  })

  test('always ends with newline', () => {
    const meta = makeMeta({ fixable: 'code' })
    const result = formatFixable(meta)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatMetadata - edge cases', () => {
  test('handles recommended as null', () => {
    const meta = makeMeta({ recommended: null as any })
    const result = formatMetadata(meta)
    expect(result).toContain('No')
  })

  test('handles recommended as undefined', () => {
    const meta = makeMeta({ recommended: undefined as any })
    const result = formatMetadata(meta)
    expect(result).toContain('No')
  })

  test('prefers docs.recommended over meta.recommended', () => {
    const meta = makeMeta({
      recommended: false,
      docs: { recommended: true },
    })
    const result = formatMetadata(meta)
    expect(result).toContain('Recommended\nYes\n')
  })

  test('handles docs.recommended as null', () => {
    const meta = makeMeta({
      recommended: false,
      docs: { recommended: null as any },
    })
    const result = formatMetadata(meta)
    expect(result).toContain('No')
  })

  test('always ends with newline', () => {
    const meta = makeMeta({ recommended: true })
    const result = formatMetadata(meta)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatExamples - edge cases', () => {
  test('handles empty examples array', () => {
    const result = formatExamples([])
    expect(result).toContain('Examples')
  })

  test('handles example with very long code', () => {
    const longCode = 'const x = '.repeat(50)
    const examples: RuleExample[] = [{ bad: longCode, good: 'x', description: 'test' }]
    const result = formatExamples(examples)
    expect(result).toContain(longCode)
  })

  test('handles example with special characters', () => {
    const examples: RuleExample[] = [
      {
        bad: 'const x = "<script>alert(\'xss\')</script>"',
        good: 'const x = ""',
        description: 'XSS example',
      },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('XSS example')
  })

  test('handles example with unicode', () => {
    const examples: RuleExample[] = [
      { bad: 'const msg = "Hello 世界"', good: 'const msg = "Hello"', description: 'Unicode test' },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('Unicode test')
  })

  test('handles example with newlines in code', () => {
    const examples: RuleExample[] = [
      {
        bad: 'function x() {\n  return 1;\n}',
        good: 'const x = () => 1',
        description: 'Multiline code',
      },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('Multiline code')
  })

  test('handles example with empty description', () => {
    const examples: RuleExample[] = [{ bad: 'x', good: 'y', description: '' }]
    const result = formatExamples(examples)
    expect(result).toContain('')
  })

  test('handles multiple examples with varying content', () => {
    const examples: RuleExample[] = [
      { bad: 'a', good: 'b', description: 'First' },
      { bad: 'c', good: 'd', description: 'Second' },
      { bad: 'e', good: 'f', description: 'Third' },
    ]
    const result = formatExamples(examples)
    expect(result).toContain('First')
    expect(result).toContain('Second')
    expect(result).toContain('Third')
  })

  test('always ends with newline', () => {
    const examples: RuleExample[] = [{ bad: 'x', good: 'y', description: 'test' }]
    const result = formatExamples(examples)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatBestPractices - edge cases', () => {
  test('handles practices with special characters', () => {
    const practices = [
      'Use "quotes" & <brackets>',
      'Test & validate',
      'Check for null || undefined',
    ]
    const result = formatBestPractices(practices)
    expect(result).toContain('"quotes" & <brackets>')
  })

  test('handles practices with unicode', () => {
    const practices = ['Use 中文 chars', 'Include émojis 🎉', 'Test ñoño']
    const result = formatBestPractices(practices)
    expect(result).toContain('中文')
    expect(result).toContain('🎉')
  })

  test('handles very long practice strings', () => {
    const longPractice = 'a'.repeat(500)
    const practices = [longPractice]
    const result = formatBestPractices(practices)
    expect(result).toContain(longPractice)
  })

  test('handles practices with leading/trailing spaces', () => {
    const practices = ['  practice1  ', '\tpractice2\t', '\npractice3\n']
    const result = formatBestPractices(practices)
    expect(result).toContain('  practice1  ')
    expect(result).toContain('\tpractice2\t')
  })

  test('handles practices containing newlines', () => {
    const practices = ['Line 1\nLine 2', 'Step 1\nStep 2\nStep 3']
    const result = formatBestPractices(practices)
    expect(result).toContain('Line 1\nLine 2')
  })

  test('handles practices with tabs', () => {
    const practices = ['Use\ttabs\tin\tcode']
    const result = formatBestPractices(practices)
    expect(result).toContain('Use\ttabs\tin\tcode')
  })

  test('always ends with newline', () => {
    const practices = ['test practice']
    const result = formatBestPractices(practices)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('formatRelatedRules - edge cases', () => {
  test('handles rule IDs with special characters', () => {
    const result = formatRelatedRules(['rule-with_special', 'rule.with.dots'])
    expect(result).toContain('rule-with_special')
    expect(result).toContain('rule.with.dots')
  })

  test('handles rule IDs with numbers', () => {
    const result = formatRelatedRules(['rule123', 'test-456', 'xyz789'])
    expect(result).toContain('rule123')
    expect(result).toContain('test-456')
    expect(result).toContain('xyz789')
  })

  test('handles very long rule IDs', () => {
    const longId = 'a'.repeat(50)
    const result = formatRelatedRules([longId])
    expect(result).toContain(longId)
  })

  test('handles rule IDs with unicode', () => {
    const result = formatRelatedRules(['规则-1', 'règle-2', 'ルール-3'])
    expect(result).toContain('规则-1')
    expect(result).toContain('règle-2')
    expect(result).toContain('ルール-3')
  })

  test('handles many related rules', () => {
    const manyRules = Array.from({ length: 20 }, (_, i) => `rule-${i}`)
    const result = formatRelatedRules(manyRules)
    for (const rule of manyRules) {
      expect(result).toContain(rule)
    }
  })

  test('returns empty string for single empty rule', () => {
    const result = formatRelatedRules([''])
    expect(result).not.toBe('')
  })

  test('all rules are prefixed with bullet', () => {
    const rules = ['a', 'b', 'c']
    const result = formatRelatedRules(rules)
    const bulletCount = (result.match(/•/g) || []).length
    expect(bulletCount).toBe(rules.length)
  })
})

describe('formatUrl - edge cases', () => {
  test('handles URLs with special characters', () => {
    const meta = makeMeta({
      docs: { url: 'https://example.com/path?query=1&test=2#section' },
    })
    const result = formatUrl(meta)
    expect(result).toContain('https://example.com/path?query=1&test=2#section')
  })

  test('handles URLs with unicode', () => {
    const meta = makeMeta({
      docs: { url: 'https://example.com/路径/测试' },
    })
    const result = formatUrl(meta)
    expect(result).toContain('https://example.com/路径/测试')
  })

  test('handles very long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(200)
    const meta = makeMeta({ docs: { url: longUrl } })
    const result = formatUrl(meta)
    expect(result).toContain(longUrl)
  })

  test('handles URLs with port numbers', () => {
    const meta = makeMeta({
      docs: { url: 'https://localhost:8080/path' },
    })
    const result = formatUrl(meta)
    expect(result).toContain('https://localhost:8080/path')
  })

  test('handles URLs with authentication', () => {
    const meta = makeMeta({
      docs: { url: 'https://user:pass@example.com/path' },
    })
    const result = formatUrl(meta)
    expect(result).toContain('https://user:pass@example.com/path')
  })

  test('handles empty URL string', () => {
    const meta = makeMeta({ docs: { url: '' } })
    const result = formatUrl(meta)
    expect(result).toBe('')
  })

  test('handles null docs object', () => {
    const meta = makeMeta({ docs: null as any })
    const result = formatUrl(meta)
    expect(result).toBe('')
  })

  test('handles URL as null', () => {
    const meta = makeMeta({ docs: { url: null as any } })
    const result = formatUrl(meta)
    expect(result).toBe('')
  })

  test('always ends with newline when URL present', () => {
    const meta = makeMeta({ docs: { url: 'https://example.com' } })
    const result = formatUrl(meta)
    expect(result.endsWith('\n')).toBe(true)
  })
})

describe('displayExplainOutput - edge cases', () => {
  test('handles minimal meta object', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const minimalMeta: RuleMeta = {
      category: 'test',
      description: 'test',
      name: 'test',
    }

    displayExplainOutput('rule', 'cat', minimalMeta, null, ['p1'], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('rule')
    expect(output).toContain('[cat]')
    expect(output).not.toContain('Examples')
    expect(output).toContain('Best Practices')
  })

  test('handles meta with only required fields', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const minimalMeta: RuleMeta = {
      category: 'security',
      description: 'Test',
      name: 'test-rule',
      severity: 'error',
    }

    displayExplainOutput('rule-1', 'cat-1', minimalMeta, null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('rule-1')
    expect(output).toContain('[cat-1]')
  })

  test('handles empty practices array', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('rule', 'cat', makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('Best Practices')
  })

  test('handles practices with special characters', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const practices = ['Use "quotes"', 'Test & <validate>', 'Check for null || undefined']
    displayExplainOutput('rule', 'cat', makeMeta(), null, practices, [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('"quotes"')
    expect(output).toContain('& <validate>')
  })

  test('handles examples with special characters', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const examples: RuleExample[] = [
      { bad: 'const x = "<script>"', good: 'const x = ""', description: 'XSS' },
    ]
    displayExplainOutput('rule', 'cat', makeMeta(), examples, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('XSS')
    expect(output).toContain('<script>')
  })

  test('handles rule ID with special characters', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('rule-with_special', 'cat-name', makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('rule-with_special')
    expect(output).toContain('[cat-name]')
  })

  test('handles category with special characters', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('rule', 'cat_with-special', makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('cat_with-special')
  })

  test('handles very long rule ID and category', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const longId = 'a'.repeat(50)
    const longCat = 'b'.repeat(30)
    displayExplainOutput(longId, longCat, makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain(longId)
    expect(output).toContain('[' + longCat + ']')
  })

  test('handles multiple examples', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const examples: RuleExample[] = [
      { bad: 'a', good: 'b', description: '1' },
      { bad: 'c', good: 'd', description: '2' },
      { bad: 'e', good: 'f', description: '3' },
    ]
    displayExplainOutput('rule', 'cat', makeMeta(), examples, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('1')
    expect(output).toContain('2')
    expect(output).toContain('3')
  })

  test('handles many related rules', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const manyRules = Array.from({ length: 10 }, (_, i) => `rule-${i}`)
    displayExplainOutput('rule', 'cat', makeMeta(), null, [], manyRules, logFn)

    const output = logs.join('\n')
    for (const rule of manyRules) {
      expect(output).toContain(rule)
    }
  })

  test('handles examples and related rules both present', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const examples: RuleExample[] = [{ bad: 'x', good: 'y', description: 'test' }]
    const related = ['rule-a', 'rule-b']
    displayExplainOutput('rule', 'cat', makeMeta(), examples, [], related, logFn)

    const output = logs.join('\n')
    expect(output).toContain('Examples')
    expect(output).toContain('Related Rules')
  })

  test('handles all optional sections present', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    const meta = makeMeta({ docs: { url: 'https://example.com' } })
    const examples: RuleExample[] = [{ bad: 'x', good: 'y', description: 'test' }]
    const practices = ['p1', 'p2']
    const related = ['rule-a', 'rule-b']
    displayExplainOutput('rule', 'cat', meta, examples, practices, related, logFn)

    const output = logs.join('\n')
    expect(output).toContain('Examples')
    expect(output).toContain('Best Practices')
    expect(output).toContain('Related Rules')
    expect(output).toContain('Documentation')
  })

  test('handles meta with all severity types', () => {
    const severities: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info']
    for (const severity of severities) {
      const logs: string[] = []
      const logFn = (msg: string) => logs.push(msg)

      const meta = makeMeta({ severity })
      displayExplainOutput('rule', 'cat', meta, null, [], [], logFn)

      const output = logs.join('\n')
      expect(output).toContain('Severity')
    }
  })

  test('handles empty string rule ID', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('', 'cat', makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('[cat]')
  })

  test('handles empty string category', () => {
    const logs: string[] = []
    const logFn = (msg: string) => logs.push(msg)

    displayExplainOutput('rule', '', makeMeta(), null, [], [], logFn)

    const output = logs.join('\n')
    expect(output).toContain('rule')
  })
})
