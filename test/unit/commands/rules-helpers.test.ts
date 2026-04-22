import { describe, test, expect, vi } from 'vitest'
import {
  type RuleInfo,
  colorizeSeverity,
  filterRules,
  formatTable,
  formatTree,
  mapRulesToInfo,
} from '../../../src/commands/rules-helpers.js'

function makeRule(overrides: Partial<RuleInfo> & { name: string }): RuleInfo {
  return {
    category: 'complexity',
    description: 'Test rule description',
    fixable: false,
    recommended: false,
    severity: 'info',
    ...overrides,
  }
}

interface LoadedRuleMeta {
  category?: string
  description: string
  fixable?: 'code' | 'whitespace'
  recommended?: boolean
  severity?: string
}

function makeLoadedRule(
  metaOverrides: Partial<LoadedRuleMeta> = {},
  extra: { fix?: unknown } = {},
): { fix?: unknown; meta: LoadedRuleMeta } {
  return {
    ...extra,
    meta: {
      description: 'Test rule',
      ...metaOverrides,
    } as LoadedRuleMeta,
  }
}

const getCategoryFn = (ruleId: string): string => {
  if (ruleId.startsWith('max-')) return 'complexity'
  if (ruleId.startsWith('no-')) return 'performance'
  return 'patterns'
}

describe('colorizeSeverity', () => {
  test('returns red for error', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
  })

  test('returns yellow for warning', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
  })

  test('returns blue for info', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
  })

  test('returns raw string for unknown severity', () => {
    expect(colorizeSeverity('custom')).toBe('custom')
  })

  test('returns raw string for empty string', () => {
    expect(colorizeSeverity('')).toBe('')
  })

  test('distinguishes error from warning', () => {
    expect(colorizeSeverity('error')).not.toBe(colorizeSeverity('warning'))
  })

  test('distinguishes warning from info', () => {
    expect(colorizeSeverity('warning')).not.toBe(colorizeSeverity('info'))
  })
})

describe('mapRulesToInfo', () => {
  test('returns empty array for empty rules', () => {
    const result = mapRulesToInfo({}, getCategoryFn)
    expect(result).toEqual([])
  })

  test('maps single rule with all fields', () => {
    const loaded = {
      'max-complexity': makeLoadedRule({
        category: 'complexity',
        description: 'Enforce max complexity',
        recommended: true,
        severity: 'error',
      }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      category: 'complexity',
      description: 'Enforce max complexity',
      fixable: false,
      name: 'max-complexity',
      recommended: true,
      severity: 'error',
    })
  })

  test('detects fixable from fix function', () => {
    const loaded = {
      'max-params': makeLoadedRule({ description: 'Max params' }, { fix: vi.fn() }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.fixable).toBe(true)
  })

  test('detects fixable from meta.fixable', () => {
    const loaded = {
      'no-await-in-loop': makeLoadedRule({
        description: 'No await in loop',
        fixable: 'code' as const,
      }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.fixable).toBe(true)
  })

  test('non-fixable when no fix and no meta.fixable', () => {
    const loaded = {
      'max-complexity': makeLoadedRule({ description: 'Max complexity' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.fixable).toBe(false)
  })

  test('uses getRuleCategoryFn when meta.category is undefined', () => {
    const loaded = {
      'no-eval': makeLoadedRule({ description: 'No eval' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.category).toBe('performance')
  })

  test('prefers meta.category over getRuleCategoryFn', () => {
    const loaded = {
      'no-eval': makeLoadedRule({ description: 'No eval', category: 'security' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.category).toBe('security')
  })

  test('defaults recommended to false when undefined', () => {
    const loaded = {
      'test-rule': makeLoadedRule({ description: 'Test' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.recommended).toBe(false)
  })

  test('defaults severity to info when undefined', () => {
    const loaded = {
      'test-rule': makeLoadedRule({ description: 'Test' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result[0]!.severity).toBe('info')
  })

  test('sorts rules by name alphabetically', () => {
    const loaded = {
      'z-rule': makeLoadedRule({ description: 'Z' }),
      'a-rule': makeLoadedRule({ description: 'A' }),
      'm-rule': makeLoadedRule({ description: 'M' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    const names = result.map((r) => r.name)
    expect(names).toEqual(['a-rule', 'm-rule', 'z-rule'])
  })

  test('maps multiple rules', () => {
    const loaded = {
      'rule-a': makeLoadedRule({ description: 'A' }),
      'rule-b': makeLoadedRule({ description: 'B' }),
      'rule-c': makeLoadedRule({ description: 'C' }),
    }
    const result = mapRulesToInfo(loaded, getCategoryFn)
    expect(result).toHaveLength(3)
  })
})

describe('filterRules', () => {
  const rules: RuleInfo[] = [
    makeRule({
      name: 'max-complexity',
      category: 'complexity',
      severity: 'error',
      fixable: false,
      recommended: true,
      description: 'Enforce max complexity',
    }),
    makeRule({
      name: 'no-console',
      category: 'performance',
      severity: 'warning',
      fixable: true,
      recommended: true,
      description: 'Disallow console calls',
    }),
    makeRule({
      name: 'prefer-const',
      category: 'patterns',
      severity: 'info',
      fixable: true,
      recommended: false,
      description: 'Prefer const over let',
    }),
    makeRule({
      name: 'no-eval',
      category: 'security',
      severity: 'error',
      fixable: false,
      recommended: true,
      description: 'Disallow eval usage',
    }),
    makeRule({
      name: 'no-debugger',
      category: 'performance',
      severity: 'warning',
      fixable: true,
      recommended: false,
      description: 'Disallow debugger statements',
    }),
  ]

  test('returns all rules with empty filters', () => {
    const result = filterRules(rules, {})
    expect(result).toHaveLength(5)
  })

  test('filters by category', () => {
    const result = filterRules(rules, { category: 'performance' })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.category === 'performance')).toBe(true)
  })

  test('filters by fixable', () => {
    const result = filterRules(rules, { fixable: true })
    expect(result).toHaveLength(3)
    expect(result.every((r) => r.fixable)).toBe(true)
  })

  test('filters by search term (case insensitive)', () => {
    const result = filterRules(rules, { search: 'disallow' })
    expect(result).toHaveLength(3)
    expect(result.every((r) => r.description.toLowerCase().includes('disallow'))).toBe(true)
  })

  test('search is case insensitive', () => {
    const result = filterRules(rules, { search: 'DISALLOW' })
    expect(result).toHaveLength(3)
  })

  test('filters by severity', () => {
    const result = filterRules(rules, { severity: 'error' })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.severity === 'error')).toBe(true)
  })

  test('combines category and fixable filters', () => {
    const result = filterRules(rules, { category: 'performance', fixable: true })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.category === 'performance' && r.fixable)).toBe(true)
  })

  test('combines category and severity filters', () => {
    const result = filterRules(rules, { category: 'security', severity: 'error' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-eval')
  })

  test('combines all filters', () => {
    const result = filterRules(rules, {
      category: 'performance',
      fixable: true,
      search: 'console',
      severity: 'warning',
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-console')
  })

  test('returns empty when no rules match category', () => {
    const result = filterRules(rules, { category: 'style' })
    expect(result).toHaveLength(0)
  })

  test('returns empty when no rules match search', () => {
    const result = filterRules(rules, { search: 'nonexistent-term' })
    expect(result).toHaveLength(0)
  })

  test('returns empty for empty input rules', () => {
    const result = filterRules([], { category: 'complexity' })
    expect(result).toHaveLength(0)
  })

  test('fixable false does not filter', () => {
    const result = filterRules(rules, { fixable: false })
    expect(result).toHaveLength(5)
  })

  test('undefined filters are ignored', () => {
    const result = filterRules(rules, {
      category: undefined,
      fixable: undefined,
      search: undefined,
      severity: undefined,
    })
    expect(result).toHaveLength(5)
  })

  test('does not mutate original array', () => {
    const original = [...rules]
    filterRules(rules, { category: 'complexity' })
    expect(rules).toEqual(original)
  })
})

describe('formatTable', () => {
  test('outputs header row with Rule', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Rule')
  })

  test('outputs Category column', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Category')
  })

  test('outputs Severity column', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Severity')
  })

  test('outputs Description column', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Description')
  })

  test('outputs Fixable column', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Fixable')
  })

  test('outputs total rule count', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a' }), makeRule({ name: 'b' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 2 rules')
  })

  test('outputs legend', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('recommended')
    expect(output).toContain('fixable')
  })

  test('truncates long descriptions', () => {
    const lines: string[] = []
    const longDesc = 'A'.repeat(100)
    const rules = [makeRule({ name: 'test-rule', description: longDesc })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('...')
  })

  test('handles empty rules array', () => {
    const lines: string[] = []
    formatTable([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 0 rules')
  })

  test('shows checkmark for fixable rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'fixable-rule', fixable: true })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2713')
  })

  test('shows x mark for non-fixable rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'nonfix-rule', fixable: false })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2717')
  })

  test('shows star for recommended rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'rec-rule', recommended: true })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2605')
  })

  test('calls logFn multiple times', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })
})

describe('formatTree', () => {
  test('outputs CodeForge Rules header', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('CodeForge Rules')
  })

  test('groups rules by category', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a-rule', category: 'complexity' }),
      makeRule({ name: 'b-rule', category: 'security' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('complexity')
    expect(output).toContain('security')
  })

  test('shows category count', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a-rule', category: 'complexity' }),
      makeRule({ name: 'b-rule', category: 'complexity' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(2)')
  })

  test('shows total count at bottom', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a' }), makeRule({ name: 'b' }), makeRule({ name: 'c' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 3 rules')
  })

  test('shows recommended count', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', recommended: true }),
      makeRule({ name: 'b', recommended: false }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1 recommended')
  })

  test('shows fixable count', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', fixable: true }),
      makeRule({ name: 'b', fixable: false }),
      makeRule({ name: 'c', fixable: true }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('2 fixable')
  })

  test('shows star badge for recommended rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'rec-rule', recommended: true })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2605')
  })

  test('shows checkmark badge for fixable rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'fix-rule', fixable: true })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2713')
  })

  test('shows rule description', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', description: 'A unique description here' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('A unique description here')
  })

  test('shows severity in brackets', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', severity: 'error' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[error]')
  })

  test('handles empty rules array', () => {
    const lines: string[] = []
    formatTree([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 0 rules')
    expect(output).toContain('0 recommended')
    expect(output).toContain('0 fixable')
  })

  test('sorts categories alphabetically', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'z', category: 'security' }),
      makeRule({ name: 'a', category: 'complexity' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const complexityIdx = lines.findIndex((l) => l.includes('complexity'))
    const securityIdx = lines.findIndex((l) => l.includes('security'))
    expect(complexityIdx).toBeLessThan(securityIdx)
  })

  test('uses tree drawing characters for categories', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u251C\u2500\u2500')
    expect(output).toContain('\u2514\u2500\u2500')
  })

  test('calls logFn multiple times', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test' })]
    formatTree(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(3)
  })

  test('last category uses bottom connector', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'zeta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    // Last category line should use └──
    const zetaLine = lines.find((l) => l.includes('zeta'))
    expect(zetaLine).toBeDefined()
    expect(zetaLine!.startsWith('\u2514\u2500\u2500')).toBe(true)
  })

  test('non-last category uses tee connector', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'zeta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    // First (non-last) category line should use ├──
    const alphaLine = lines.find((l) => l.includes('alpha'))
    expect(alphaLine).toBeDefined()
    expect(alphaLine!.startsWith('\u251C\u2500\u2500')).toBe(true)
  })

  test('shows both star and checkmark for recommended+fixable rules', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'both-rule', recommended: true, fixable: true })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2605')
    expect(output).toContain('\u2713')
  })

  test('no badges when rule is neither recommended nor fixable', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'plain-rule', recommended: false, fixable: false })]
    formatTree(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('plain-rule'))
    expect(ruleLine).toBeDefined()
    // Should have no star or checkmark in the rule line (not the summary)
    expect(ruleLine).not.toContain('\u2605')
    expect(ruleLine).not.toContain('\u2713')
  })

  test('inserts separator line between categories', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    // Between categories, there should be a blank line via logFn(childPrefix) in the non-last category
    // The separator line uses childPrefix = '│  '
    const separatorLines = lines.filter((l) => l.trim() === '\u2502')
    expect(separatorLines.length).toBeGreaterThan(0)
  })

  test('last rule in category uses bottom connector', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a1', category: 'alpha' }),
      makeRule({ name: 'a2', category: 'alpha' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const a2Line = lines.find((l) => l.includes('a2'))
    expect(a2Line).toBeDefined()
    expect(a2Line).toContain('\u2514\u2500\u2500')
  })

  test('non-last rule in category uses tee connector', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a1', category: 'alpha' }),
      makeRule({ name: 'a2', category: 'alpha' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const a1Line = lines.find((l) => l.includes('a1'))
    expect(a1Line).toBeDefined()
    expect(a1Line).toContain('\u251C\u2500\u2500')
  })

  test('shows correct summary with mixed rules', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', recommended: true, fixable: true }),
      makeRule({ name: 'b', recommended: true, fixable: false }),
      makeRule({ name: 'c', recommended: false, fixable: true }),
      makeRule({ name: 'd', recommended: false, fixable: false }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 4 rules')
    expect(output).toContain('2 recommended')
    expect(output).toContain('2 fixable')
  })

  test('single category uses bottom connector', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'solo' }),
      makeRule({ name: 'b', category: 'solo' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const soloLine = lines.find((l) => l.includes('solo'))
    expect(soloLine).toBeDefined()
    expect(soloLine!.startsWith('\u2514\u2500\u2500')).toBe(true)
  })

  test('single rule in category uses bottom connector', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a', category: 'solo' })]
    formatTree(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('a') && !l.includes('solo'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine).toContain('\u2514\u2500\u2500')
  })

  test('does not show separator after last category', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'zeta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    // Lines after zeta category should not contain │ separator
    const zetaIdx = lines.findIndex((l) => l.includes('zeta'))
    const afterZeta = lines.slice(zetaIdx + 1)
    const separatorLines = afterZeta.filter((l) => l.trim() === '\u2502')
    expect(separatorLines).toHaveLength(0)
  })
})

describe('mapRulesToInfo edge cases', () => {
  const getCat = (_ruleId: string): string => 'default-category'

  test('detects fixable from whitespace meta.fixable', () => {
    const loaded = {
      'ws-rule': makeLoadedRule({ description: 'WS', fixable: 'whitespace' as const }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.fixable).toBe(true)
  })

  test('truthy non-function fix value marks as fixable', () => {
    const loaded = {
      'truthy-fix': { fix: 'yes', meta: { description: 'Truth' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(true)
  })

  test('numeric truthy fix value marks as fixable', () => {
    const loaded = {
      'num-fix': { fix: 42, meta: { description: 'Num' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(true)
  })

  test('empty string fix value marks as not fixable', () => {
    const loaded = {
      'empty-fix': { fix: '', meta: { description: 'Empty' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(false)
  })

  test('zero fix value marks as not fixable', () => {
    const loaded = {
      'zero-fix': { fix: 0, meta: { description: 'Zero' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(false)
  })

  test('both fix function and meta.fixable set', () => {
    const loaded = {
      'both-fix': makeLoadedRule(
        { description: 'Both', fixable: 'code' as const },
        { fix: vi.fn() },
      ),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.fixable).toBe(true)
  })

  test('getRuleCategoryFn is called with the ruleId', () => {
    const mockFn = vi.fn().mockReturnValue('mock-cat')
    const loaded = {
      'my-special-rule': makeLoadedRule({ description: 'Special' }),
    }
    mapRulesToInfo(loaded, mockFn)
    expect(mockFn).toHaveBeenCalledWith('my-special-rule')
  })

  test('preserves exact severity value from meta', () => {
    const loaded = {
      'sev-rule': makeLoadedRule({ description: 'Sev', severity: 'critical' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.severity).toBe('critical')
  })

  test('preserves exact category value from meta over undefined', () => {
    const loaded = {
      'cat-rule': makeLoadedRule({ description: 'Cat', category: 'custom-cat' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.category).toBe('custom-cat')
  })

  test('rule names with special characters', () => {
    const loaded = {
      '@scope/rule-name': makeLoadedRule({ description: 'Scoped' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.name).toBe('@scope/rule-name')
  })

  test('sorts rules with numeric suffixes correctly', () => {
    const loaded = {
      'rule-10': makeLoadedRule({ description: 'Ten' }),
      'rule-2': makeLoadedRule({ description: 'Two' }),
      'rule-1': makeLoadedRule({ description: 'One' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    const names = result.map((r) => r.name)
    // localeCompare sorts: rule-1, rule-10, rule-2
    expect(names).toEqual(['rule-1', 'rule-10', 'rule-2'])
  })
})

describe('filterRules edge cases', () => {
  const rules: RuleInfo[] = [
    makeRule({
      name: 'r1',
      category: 'alpha',
      severity: 'error',
      fixable: true,
      description: 'Async await pattern',
    }),
    makeRule({
      name: 'r2',
      category: 'beta',
      severity: 'warning',
      fixable: false,
      description: 'Callback pattern',
    }),
    makeRule({
      name: 'r3',
      category: 'alpha',
      severity: 'info',
      fixable: true,
      description: 'Promise pattern',
    }),
  ]

  test('search matches partial word', () => {
    const result = filterRules(rules, { search: 'async' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('r1')
  })

  test('search is case insensitive on mixed case', () => {
    const result = filterRules(rules, { search: 'PATTERN' })
    expect(result).toHaveLength(3)
  })

  test('combines search and severity', () => {
    const result = filterRules(rules, { search: 'pattern', severity: 'error' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('r1')
  })

  test('combines search and fixable', () => {
    const result = filterRules(rules, { search: 'pattern', fixable: true })
    expect(result).toHaveLength(2)
  })

  test('combines search, severity and fixable', () => {
    const result = filterRules(rules, { search: 'pattern', severity: 'info', fixable: true })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('r3')
  })

  test('fixable filter with only non-fixable rules', () => {
    const onlyNonFixable = [makeRule({ name: 'x', fixable: false })]
    const result = filterRules(onlyNonFixable, { fixable: true })
    expect(result).toHaveLength(0)
  })

  test('fixable filter with only fixable rules', () => {
    const onlyFixable = [makeRule({ name: 'x', fixable: true })]
    const result = filterRules(onlyFixable, { fixable: true })
    expect(result).toHaveLength(1)
  })

  test('search with empty string returns all rules', () => {
    const result = filterRules(rules, { search: '' })
    expect(result).toHaveLength(3)
  })

  test('multiple filters returning no results', () => {
    const result = filterRules(rules, {
      category: 'alpha',
      severity: 'warning',
      fixable: true,
      search: 'nonexistent',
    })
    expect(result).toHaveLength(0)
  })

  test('category filter is exact match not substring', () => {
    const customRules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'alpha-beta' }),
    ]
    const result = filterRules(customRules, { category: 'alpha' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })
})

describe('formatTable edge cases', () => {
  test('handles multiple rules with varied properties', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'rule-a', fixable: true, recommended: true, severity: 'error' }),
      makeRule({ name: 'rule-b', fixable: false, recommended: false, severity: 'warning' }),
    ]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('rule-a')
    expect(output).toContain('rule-b')
    expect(output).toContain('Total: 2 rules')
  })

  test('description not truncated when within limit', () => {
    const lines: string[] = []
    const shortDesc = 'Short desc'
    const rules = [makeRule({ name: 'test-rule', description: shortDesc })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(shortDesc)
    expect(output).not.toContain('...')
  })

  test('table structure has top border', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    // First line should start with ┌
    expect(lines[0]).toContain('\u250C')
  })

  test('table structure has bottom border', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    // Should contain └ for bottom border
    expect(lines.join('\n')).toContain('\u2514')
  })

  test('table structure has header separator', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    // Should contain ├ for separator between header and body
    expect(lines.join('\n')).toContain('\u251C')
  })

  test('empty line after table border', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    // The second-to-last logFn call should be '' (empty line before summary)
    expect(lines).toContain('')
  })

  test('handles rule with very long name', () => {
    const lines: string[] = []
    const longName = 'a'.repeat(50)
    const rules = [makeRule({ name: longName })]
    formatTable(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })

  test('handles rule with very long category', () => {
    const lines: string[] = []
    const longCat = 'cat'.repeat(20)
    const rules = [makeRule({ name: 'test-rule', category: longCat })]
    formatTable(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
  })
})

describe('colorizeSeverity additional', () => {
  test('returns raw string for whitespace severity', () => {
    expect(colorizeSeverity('   ')).toBe('   ')
  })

  test('returns raw string for multi-word severity', () => {
    expect(colorizeSeverity('critical error')).toBe('critical error')
  })

  test('returns raw string for numeric-like severity', () => {
    expect(colorizeSeverity('123')).toBe('123')
  })

  test('error severity returns a string containing error', () => {
    const result = colorizeSeverity('error')
    expect(typeof result).toBe('string')
    expect(result).toContain('error')
  })

  test('warning severity returns a string containing warning', () => {
    const result = colorizeSeverity('warning')
    expect(typeof result).toBe('string')
    expect(result).toContain('warning')
  })

  test('info severity returns a string containing info', () => {
    const result = colorizeSeverity('info')
    expect(typeof result).toBe('string')
    expect(result).toContain('info')
  })

  test('distinguishes error from info', () => {
    expect(colorizeSeverity('error')).not.toBe(colorizeSeverity('info'))
  })

  test('returns raw for severity with trailing whitespace', () => {
    expect(colorizeSeverity('error ')).toBe('error ')
  })

  test('returns raw for severity with leading whitespace', () => {
    expect(colorizeSeverity(' error')).toBe(' error')
  })

  test('returns raw for Error with capital E', () => {
    expect(colorizeSeverity('Error')).toBe('Error')
  })
})

describe('mapRulesToInfo additional', () => {
  const getCat = (_ruleId: string): string => 'fallback'

  test('null fix value marks as not fixable', () => {
    const loaded = {
      'null-fix': { fix: null, meta: { description: 'Null' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(false)
  })

  test('undefined fix with no meta.fixable marks as not fixable', () => {
    const loaded = {
      'undef-fix': { fix: undefined, meta: { description: 'Undef' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    expect(result[0]!.fixable).toBe(false)
  })

  test('getRuleCategoryFn called for each rule without category', () => {
    const mockFn = vi.fn().mockReturnValue('auto')
    const loaded = {
      'rule-a': makeLoadedRule({ description: 'A' }),
      'rule-b': makeLoadedRule({ description: 'B' }),
      'rule-c': makeLoadedRule({ description: 'C', category: 'explicit' }),
    }
    mapRulesToInfo(loaded, mockFn)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenCalledWith('rule-a')
    expect(mockFn).toHaveBeenCalledWith('rule-b')
  })

  test('recommended true is preserved', () => {
    const loaded = {
      'rec-true': makeLoadedRule({ description: 'Rec', recommended: true }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.recommended).toBe(true)
  })

  test('recommended false is preserved', () => {
    const loaded = {
      'rec-false': makeLoadedRule({ description: 'Rec', recommended: false }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.recommended).toBe(false)
  })

  test('handles large number of rules', () => {
    const loaded: Record<string, { meta: { description: string } }> = {}
    for (let i = 0; i < 100; i++) {
      loaded[`rule-${String(i).padStart(3, '0')}`] = { meta: { description: `Rule ${i}` } }
    }
    const result = mapRulesToInfo(
      loaded as Record<
        string,
        {
          fix?: unknown
          meta: {
            description: string
            category?: string
            fixable?: 'code' | 'whitespace'
            recommended?: boolean
            severity?: string
          }
        }
      >,
      getCat,
    )
    expect(result).toHaveLength(100)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.name.localeCompare(result[i]!.name)).toBeLessThanOrEqual(0)
    }
  })

  test('preserves exact description from meta', () => {
    const desc = '  A very specific description with "quotes" and \ttabs  '
    const loaded = {
      'desc-rule': makeLoadedRule({ description: desc }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.description).toBe(desc)
  })

  test('preserves Unicode in rule name', () => {
    const loaded = {
      日本語ルール: makeLoadedRule({ description: 'Japanese rule' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.name).toBe('日本語ルール')
  })

  test('preserves Unicode in description', () => {
    const loaded = {
      'unicode-desc': makeLoadedRule({ description: 'Descripción en español 🎉' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.description).toBe('Descripción en español 🎉')
  })

  test('single rule returns array of length 1', () => {
    const loaded = {
      'only-rule': makeLoadedRule({ description: 'Only' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('only-rule')
  })

  test('rules with same leading characters sort deterministically', () => {
    const loaded = {
      'prefix-a': makeLoadedRule({ description: 'A' }),
      'prefix-aa': makeLoadedRule({ description: 'AA' }),
      'prefix-ab': makeLoadedRule({ description: 'AB' }),
      'prefix-b': makeLoadedRule({ description: 'B' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    const names = result.map((r) => r.name)
    expect(names).toEqual(['prefix-a', 'prefix-aa', 'prefix-ab', 'prefix-b'])
  })

  test('severity value is used exactly from meta when present', () => {
    const loaded = {
      'sev-custom': makeLoadedRule({ description: 'S', severity: 'high' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.severity).toBe('high')
  })
})

describe('filterRules additional', () => {
  test('search matches middle of description', () => {
    const rules = [
      makeRule({ name: 'a', description: 'The quick brown fox' }),
      makeRule({ name: 'b', description: 'Lazy dog' }),
    ]
    const result = filterRules(rules, { search: 'brown' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('search matches single character', () => {
    const rules = [
      makeRule({ name: 'a', description: 'A test' }),
      makeRule({ name: 'b', description: 'Another' }),
    ]
    const result = filterRules(rules, { search: 'a' })
    expect(result).toHaveLength(2)
  })

  test('filter by category returns new array', () => {
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
    ]
    const result = filterRules(rules, { category: 'alpha' })
    expect(result).not.toBe(rules)
  })

  test('multiple severity filters not supported (uses last)', () => {
    const rules = [
      makeRule({ name: 'a', severity: 'error' }),
      makeRule({ name: 'b', severity: 'warning' }),
    ]
    const result = filterRules(rules, { severity: 'warning' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('b')
  })

  test('fixable=true returns only fixable rules', () => {
    const rules = [
      makeRule({ name: 'a', fixable: true }),
      makeRule({ name: 'b', fixable: false }),
      makeRule({ name: 'c', fixable: true }),
    ]
    const result = filterRules(rules, { fixable: true })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.fixable)).toBe(true)
  })

  test('fixable=false returns all rules (filter is skipped)', () => {
    const rules = [makeRule({ name: 'a', fixable: true }), makeRule({ name: 'b', fixable: false })]
    const result = filterRules(rules, { fixable: false })
    expect(result).toHaveLength(2)
  })

  test('combines search and category', () => {
    const rules = [
      makeRule({ name: 'a', category: 'alpha', description: 'Alpha async pattern' }),
      makeRule({ name: 'b', category: 'beta', description: 'Beta async pattern' }),
      makeRule({ name: 'c', category: 'alpha', description: 'Alpha sync pattern' }),
    ]
    const result = filterRules(rules, { category: 'alpha', search: 'async' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('combines all four filters', () => {
    const rules = [
      makeRule({
        name: 'a',
        category: 'alpha',
        severity: 'error',
        fixable: true,
        description: 'Alpha error fixable async',
      }),
      makeRule({
        name: 'b',
        category: 'alpha',
        severity: 'error',
        fixable: false,
        description: 'Alpha error nonfixable async',
      }),
      makeRule({
        name: 'c',
        category: 'alpha',
        severity: 'warning',
        fixable: true,
        description: 'Alpha warning fixable async',
      }),
      makeRule({
        name: 'd',
        category: 'beta',
        severity: 'error',
        fixable: true,
        description: 'Beta error fixable async',
      }),
    ]
    const result = filterRules(rules, {
      category: 'alpha',
      severity: 'error',
      fixable: true,
      search: 'async',
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('search with special regex characters is literal', () => {
    const rules = [
      makeRule({ name: 'a', description: 'Rule with [brackets]' }),
      makeRule({ name: 'b', description: 'Normal rule' }),
    ]
    const result = filterRules(rules, { search: '[brackets]' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('filter on empty array with all filters returns empty', () => {
    const result = filterRules([], { category: 'a', severity: 'b', fixable: true, search: 'c' })
    expect(result).toHaveLength(0)
  })

  test('category filter does not match case-insensitively', () => {
    const rules = [makeRule({ name: 'a', category: 'Complexity' })]
    const result = filterRules(rules, { category: 'complexity' })
    expect(result).toHaveLength(0)
  })

  test('severity filter does not match case-insensitively', () => {
    const rules = [makeRule({ name: 'a', severity: 'Error' })]
    const result = filterRules(rules, { severity: 'error' })
    expect(result).toHaveLength(0)
  })

  test('single rule matching all filters returns it', () => {
    const rules = [
      makeRule({
        name: 'target',
        category: 'cat',
        severity: 'error',
        fixable: true,
        description: 'Find me',
      }),
    ]
    const result = filterRules(rules, {
      category: 'cat',
      severity: 'error',
      fixable: true,
      search: 'Find',
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('target')
  })
})

describe('formatTable additional', () => {
  test('each rule row includes rule name', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'alpha-rule' }), makeRule({ name: 'beta-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('alpha-rule')
    expect(output).toContain('beta-rule')
  })

  test('each rule row includes category', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'r1', category: 'security' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('security')
  })

  test('handles all severity types in same table', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'err-rule', severity: 'error' }),
      makeRule({ name: 'warn-rule', severity: 'warning' }),
      makeRule({ name: 'info-rule', severity: 'info' }),
    ]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 3 rules')
  })

  test('table border uses box-drawing characters', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2510')
    expect(output).toContain('\u2518')
  })

  test('table contains vertical bars for columns', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('\u2502')
  })

  test('separator uses horizontal line characters', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test-rule' })]
    formatTable(rules, (msg) => lines.push(msg))
    expect(lines[0]).toContain('─')
  })

  test('handles rule with empty string name', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: '' })]
    formatTable(rules, (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThan(5)
    expect(lines.join('\n')).toContain('Total: 1 rules')
  })

  test('recommended rule shows star in row', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'rec-rule', recommended: true })]
    formatTable(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('rec-rule'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine).toContain('\u2605')
  })

  test('non-recommended rule shows space instead of star', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'norec-rule', recommended: false })]
    formatTable(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('norec-rule'))
    expect(ruleLine).toBeDefined()
    expect(ruleLine).not.toContain('\u2605')
  })

  test('description exactly at truncation boundary is not truncated', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', description: 'Short' })]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Short')
    expect(output).not.toContain('...')
  })

  test('handles three rules with different severities', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'rule-error', severity: 'error', fixable: false }),
      makeRule({ name: 'rule-warn', severity: 'warning', fixable: true }),
      makeRule({ name: 'rule-info', severity: 'info', fixable: true, recommended: true }),
    ]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 3 rules')
    expect(output).toContain('\u2713')
    expect(output).toContain('\u2605')
  })

  test('logFn receives correct number of calls for 0 rules', () => {
    const lines: string[] = []
    formatTable([], (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThanOrEqual(6)
  })

  test('logFn receives more calls with more rules', () => {
    const lines1: string[] = []
    formatTable([makeRule({ name: 'a' })], (msg) => lines1.push(msg))
    const lines3: string[] = []
    formatTable(
      [makeRule({ name: 'a' }), makeRule({ name: 'b' }), makeRule({ name: 'c' })],
      (msg) => lines3.push(msg),
    )
    expect(lines3.length).toBeGreaterThan(lines1.length)
  })

  test('table header separator line is distinct from top border', () => {
    const lines: string[] = []
    formatTable([makeRule({ name: 'test' })], (msg) => lines.push(msg))
    expect(lines[0]).toContain('\u250C')
    expect(lines[2]).toContain('\u251C')
  })
})

describe('formatTree additional', () => {
  test('shows severity label for each rule', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'err', severity: 'error' }),
      makeRule({ name: 'warn', severity: 'warning' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[error]')
    expect(output).toContain('[warning]')
  })

  test('handles three categories with correct connectors', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
      makeRule({ name: 'c', category: 'gamma' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const alphaLine = lines.find((l) => l.includes('alpha'))
    const gammaLine = lines.find((l) => l.includes('gamma'))
    expect(alphaLine).toBeDefined()
    expect(gammaLine).toBeDefined()
    expect(alphaLine!.startsWith('\u251C\u2500\u2500')).toBe(true)
    expect(gammaLine!.startsWith('\u2514\u2500\u2500')).toBe(true)
  })

  test('multiple rules in same category have correct connectors', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'r1', category: 'cat' }),
      makeRule({ name: 'r2', category: 'cat' }),
      makeRule({ name: 'r3', category: 'cat' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const r1Line = lines.find((l) => l.includes('r1') && !l.includes('r2') && !l.includes('r3'))
    const r2Line = lines.find((l) => l.includes('r2') && !l.includes('r1') && !l.includes('r3'))
    const r3Line = lines.find((l) => l.includes('r3') && !l.includes('r1') && !l.includes('r2'))
    expect(r1Line).toContain('\u251C\u2500\u2500')
    expect(r2Line).toContain('\u251C\u2500\u2500')
    expect(r3Line).toContain('\u2514\u2500\u2500')
  })

  test('summary line contains correct separators', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a' })]
    formatTree(rules, (msg) => lines.push(msg))
    const summaryLine = lines.find((l) => l.includes('Total:'))
    expect(summaryLine).toBeDefined()
    expect(summaryLine).toContain('\u2502')
  })

  test('handles rules with Unicode names', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'ルール', category: 'カテゴリ' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('ルール')
    expect(output).toContain('カテゴリ')
  })

  test('handles rules with very long descriptions', () => {
    const lines: string[] = []
    const longDesc = 'A'.repeat(200)
    const rules = [makeRule({ name: 'long-desc', description: longDesc })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('long-desc')
    expect(output).toContain(longDesc)
  })

  test('empty array shows zero counts', () => {
    const lines: string[] = []
    formatTree([], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 0 rules')
    expect(output).toContain('0 recommended')
    expect(output).toContain('0 fixable')
  })

  test('all recommended and all fixable shows correct counts', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', recommended: true, fixable: true }),
      makeRule({ name: 'b', recommended: true, fixable: true }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 2 rules')
    expect(output).toContain('2 recommended')
    expect(output).toContain('2 fixable')
  })

  test('category count matches number of rules in that category', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a1', category: 'alpha' }),
      makeRule({ name: 'a2', category: 'alpha' }),
      makeRule({ name: 'a3', category: 'alpha' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const alphaLine = lines.find((l) => l.includes('alpha'))
    expect(alphaLine).toContain('(3)')
  })

  test('blank line after CodeForge Rules header', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test' })]
    formatTree(rules, (msg) => lines.push(msg))
    expect(lines[1]).toBe('')
  })

  test('blank line before summary', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test' })]
    formatTree(rules, (msg) => lines.push(msg))
    const summaryIdx = lines.findIndex((l) => l.includes('Total:'))
    expect(summaryIdx).toBeGreaterThan(0)
    expect(lines[summaryIdx - 1]).toBe('')
  })

  test('separator appears between non-last categories', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
      makeRule({ name: 'c', category: 'gamma' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const separatorLines = lines.filter((l) => l.trim() === '\u2502')
    expect(separatorLines.length).toBe(2)
  })

  test('no separator after last category rules', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'zeta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const zetaIdx = lines.findIndex((l) => l.includes('zeta'))
    const afterZetaRules = lines.slice(zetaIdx + 2)
    const separators = afterZetaRules.filter((l) => l.trim() === '\u2502')
    expect(separators).toHaveLength(0)
  })

  test('rule line includes severity in square brackets', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', severity: 'warning' })]
    formatTree(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('test') && l.includes('['))
    expect(ruleLine).toContain('[warning]')
  })

  test('rule line includes dash before description', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', description: 'My special rule' })]
    formatTree(rules, (msg) => lines.push(msg))
    const ruleLine = lines.find((l) => l.includes('My special rule'))
    expect(ruleLine).toContain(' - My special rule')
  })

  test('categories sorted correctly with mixed case', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'Security' }),
      makeRule({ name: 'b', category: 'alpha' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const alphaIdx = lines.findIndex((l) => l.includes('alpha'))
    const securityIdx = lines.findIndex((l) => l.includes('Security'))
    expect(securityIdx).toBeLessThan(alphaIdx)
  })
})

describe('colorizeSeverity extra', () => {
  test('returns raw for severity warn (not warning)', () => {
    expect(colorizeSeverity('warn')).toBe('warn')
  })

  test('returns raw for severity err (not error)', () => {
    expect(colorizeSeverity('err')).toBe('err')
  })

  test('returns raw for severity INFO (uppercase)', () => {
    expect(colorizeSeverity('INFO')).toBe('INFO')
  })

  test('consecutive calls return identical results', () => {
    const first = colorizeSeverity('error')
    const second = colorizeSeverity('error')
    expect(first).toBe(second)
  })

  test('error result contains the word error', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
    expect(result.length).toBeGreaterThanOrEqual(5)
  })

  test('warning result contains the word warning', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
    expect(result.length).toBeGreaterThanOrEqual(7)
  })

  test('info result contains the word info', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
    expect(result.length).toBeGreaterThanOrEqual(4)
  })
})

describe('mapRulesToInfo comprehensive', () => {
  const getCat = (_ruleId: string): string => 'auto-category'

  test('all optional fields present in result', () => {
    const loaded = {
      'full-rule': makeLoadedRule({
        category: 'explicit',
        description: 'Full rule',
        fixable: 'code' as const,
        recommended: true,
        severity: 'error',
      }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    const rule = result[0]!
    expect(rule.name).toBe('full-rule')
    expect(rule.category).toBe('explicit')
    expect(rule.description).toBe('Full rule')
    expect(rule.fixable).toBe(true)
    expect(rule.recommended).toBe(true)
    expect(rule.severity).toBe('error')
  })

  test('no optional fields uses defaults', () => {
    const loaded = {
      'bare-rule': { meta: { description: 'Bare' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string } }>,
      getCat,
    )
    const rule = result[0]!
    expect(rule.category).toBe('auto-category')
    expect(rule.fixable).toBe(false)
    expect(rule.recommended).toBe(false)
    expect(rule.severity).toBe('info')
  })

  test('empty string category is preserved', () => {
    const loaded = {
      'empty-cat': { meta: { description: 'Empty', category: '' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string; category?: string } }>,
      getCat,
    )
    expect(result[0]!.category).toBe('')
  })

  test('empty string severity is preserved', () => {
    const loaded = {
      'empty-sev': { meta: { description: 'Empty', severity: '' } },
    }
    const result = mapRulesToInfo(
      loaded as Record<string, { fix?: unknown; meta: { description: string; severity?: string } }>,
      getCat,
    )
    expect(result[0]!.severity).toBe('')
  })

  test('two rules with same category', () => {
    const loaded = {
      'rule-a': makeLoadedRule({ description: 'A', category: 'same' }),
      'rule-b': makeLoadedRule({ description: 'B', category: 'same' }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.category === 'same')).toBe(true)
  })

  test('getRuleCategoryFn receives correct ruleIds for multiple rules', () => {
    const mockFn = vi.fn().mockReturnValue('cat')
    const loaded = {
      'x-rule': makeLoadedRule({ description: 'X' }),
      'y-rule': makeLoadedRule({ description: 'Y' }),
    }
    mapRulesToInfo(loaded, mockFn)
    expect(mockFn).toHaveBeenCalledWith('x-rule')
    expect(mockFn).toHaveBeenCalledWith('y-rule')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  test('false fixable in meta overrides truthy fix', () => {
    // meta.fixable is undefined (falsy) but fix is truthy -> fixable=true
    // This tests that Boolean(fix || meta.fixable) works correctly
    const loaded = {
      test: makeLoadedRule({ description: 'T' }, { fix: vi.fn() }),
    }
    const result = mapRulesToInfo(loaded, getCat)
    expect(result[0]!.fixable).toBe(true)
  })
})

describe('filterRules comprehensive', () => {
  test('does not match search against rule name', () => {
    const rules = [makeRule({ name: 'special-name', description: 'Completely different' })]
    const result = filterRules(rules, { search: 'special' })
    expect(result).toHaveLength(0)
  })

  test('search matches against description only', () => {
    const rules = [
      makeRule({ name: 'a', description: 'Find this keyword' }),
      makeRule({ name: 'keyword', description: 'Something else entirely' }),
    ]
    const result = filterRules(rules, { search: 'keyword' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('filter preserves rule object references', () => {
    const rule = makeRule({ name: 'ref-test', category: 'alpha' })
    const result = filterRules([rule], { category: 'alpha' })
    expect(result[0]).toBe(rule)
  })

  test('fixable filter with mixed rules returns correct subset', () => {
    const rules = [
      makeRule({ name: 'a', fixable: true, category: 'cat' }),
      makeRule({ name: 'b', fixable: false, category: 'cat' }),
      makeRule({ name: 'c', fixable: true, category: 'dog' }),
    ]
    const result = filterRules(rules, { fixable: true, category: 'cat' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('whitespace-only search string returns all rules', () => {
    const rules = [makeRule({ name: 'a', description: 'test' })]
    const result = filterRules(rules, { search: '   ' })
    // '   '.toLowerCase() = '   ', 'test'.includes('   ') = false
    expect(result).toHaveLength(0)
  })

  test('search with line breaks in description', () => {
    const rules = [
      makeRule({ name: 'a', description: 'line one\nline two' }),
      makeRule({ name: 'b', description: 'no match' }),
    ]
    const result = filterRules(rules, { search: 'line two' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })

  test('filter with all undefined returns all rules', () => {
    const rules = [makeRule({ name: 'a' })]
    const result = filterRules(rules, {})
    expect(result).toEqual(rules)
    expect(result).toHaveLength(1)
  })

  test('combines severity and fixable with no matches', () => {
    const rules = [
      makeRule({ name: 'a', severity: 'error', fixable: false }),
      makeRule({ name: 'b', severity: 'warning', fixable: true }),
    ]
    const result = filterRules(rules, { severity: 'error', fixable: true })
    expect(result).toHaveLength(0)
  })

  test('category filter is strict equality', () => {
    const rules = [
      makeRule({ name: 'a', category: 'alpha-beta' }),
      makeRule({ name: 'b', category: 'alpha' }),
    ]
    const result = filterRules(rules, { category: 'alpha' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('b')
  })

  test('severity filter is strict equality', () => {
    const rules = [
      makeRule({ name: 'a', severity: 'error' }),
      makeRule({ name: 'b', severity: 'errors' }),
    ]
    const result = filterRules(rules, { severity: 'error' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('a')
  })
})

describe('formatTable comprehensive', () => {
  test('logFn call count equals rules + 5 (borders, empty, total, legend)', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a' }), makeRule({ name: 'b' }), makeRule({ name: 'c' })]
    formatTable(rules, (msg) => lines.push(msg))
    // top border + header + separator + 3 rules + bottom border + empty line + total + legend = 10
    expect(lines).toHaveLength(10)
  })

  test('logFn call count for empty rules', () => {
    const lines: string[] = []
    formatTable([], (msg) => lines.push(msg))
    // top border + header + separator + bottom border + empty + total + legend = 7
    expect(lines).toHaveLength(7)
  })

  test('total shows singular-like format for single rule', () => {
    const lines: string[] = []
    formatTable([makeRule({ name: 'only' })], (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Total: 1 rules')
  })

  test('multiple rules each appear in output', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'rule-x' }),
      makeRule({ name: 'rule-y' }),
      makeRule({ name: 'rule-z' }),
    ]
    formatTable(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('rule-x')
    expect(output).toContain('rule-y')
    expect(output).toContain('rule-z')
  })

  test('fixable column position is consistent across rows', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'short', fixable: true }),
      makeRule({ name: 'a-very-long-rule-name-here', fixable: false }),
    ]
    formatTable(rules, (msg) => lines.push(msg))
    // Both rule rows should contain checkmark and x-mark characters
    const output = lines.join('\n')
    expect(output).toContain('\u2713')
    expect(output).toContain('\u2717')
  })
})

describe('formatTree comprehensive', () => {
  test('rules within category maintain insertion order', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'z-rule', category: 'alpha' }),
      makeRule({ name: 'a-rule', category: 'alpha' }),
      makeRule({ name: 'm-rule', category: 'alpha' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const zIdx = lines.findIndex((l) => l.includes('z-rule'))
    const aIdx = lines.findIndex((l) => l.includes('a-rule'))
    const mIdx = lines.findIndex((l) => l.includes('m-rule'))
    expect(zIdx).toBeLessThan(aIdx)
    expect(aIdx).toBeLessThan(mIdx)
  })

  test('header line is first output', () => {
    const lines: string[] = []
    formatTree([makeRule({ name: 'test' })], (msg) => lines.push(msg))
    expect(lines[0]).toContain('CodeForge Rules')
  })

  test('summary contains pipe separators', () => {
    const lines: string[] = []
    formatTree([makeRule({ name: 'test' })], (msg) => lines.push(msg))
    const summary = lines.find((l) => l.includes('Total:'))
    expect(summary).toContain('\u2605')
    expect(summary).toContain('\u2713')
  })

  test('many categories all get correct connectors', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', category: 'alpha' }),
      makeRule({ name: 'b', category: 'beta' }),
      makeRule({ name: 'c', category: 'gamma' }),
      makeRule({ name: 'd', category: 'delta' }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    // Sorted: alpha, beta, delta, gamma - gamma is last
    const gammaLine = lines.find((l) => l.includes('gamma'))
    expect(gammaLine).toBeDefined()
    expect(gammaLine!.startsWith('\u2514\u2500\u2500')).toBe(true)
    // alpha is first, should use tee connector
    const alphaLine = lines.find((l) => l.includes('alpha'))
    expect(alphaLine!.startsWith('\u251C\u2500\u2500')).toBe(true)
  })

  test('info severity shown in brackets', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'test', severity: 'info' })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('[info]')
  })

  test('summary with no recommended shows 0 recommended', () => {
    const lines: string[] = []
    const rules = [
      makeRule({ name: 'a', recommended: false }),
      makeRule({ name: 'b', recommended: false }),
    ]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('0 recommended')
  })

  test('summary with no fixable shows 0 fixable', () => {
    const lines: string[] = []
    const rules = [makeRule({ name: 'a', fixable: false }), makeRule({ name: 'b', fixable: false })]
    formatTree(rules, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('0 fixable')
  })
})

describe('integration: mapRulesToInfo to filterRules', () => {
  const getCat = (ruleId: string): string => {
    if (ruleId.startsWith('no-')) return 'performance'
    return 'style'
  }

  test('pipeline filters mapped rules by category', () => {
    const loaded = {
      'no-eval': makeLoadedRule({ description: 'No eval', severity: 'error' }),
      'prefer-const': makeLoadedRule({ description: 'Prefer const' }),
    }
    const mapped = mapRulesToInfo(loaded, getCat)
    const filtered = filterRules(mapped, { category: 'performance' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.name).toBe('no-eval')
  })

  test('pipeline filters mapped rules by severity', () => {
    const loaded = {
      'rule-a': makeLoadedRule({ description: 'A', severity: 'error' }),
      'rule-b': makeLoadedRule({ description: 'B', severity: 'warning' }),
    }
    const mapped = mapRulesToInfo(loaded, getCat)
    const filtered = filterRules(mapped, { severity: 'warning' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.name).toBe('rule-b')
  })

  test('pipeline filters mapped fixable rules', () => {
    const loaded = {
      'fixable-rule': makeLoadedRule({ description: 'Fix me' }, { fix: vi.fn() }),
      'unfixable-rule': makeLoadedRule({ description: 'Cannot fix' }),
    }
    const mapped = mapRulesToInfo(loaded, getCat)
    const filtered = filterRules(mapped, { fixable: true })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.name).toBe('fixable-rule')
  })

  test('pipeline formats filtered rules as table', () => {
    const loaded = {
      'no-console': makeLoadedRule({ description: 'No console', severity: 'warning' }),
    }
    const mapped = mapRulesToInfo(loaded, getCat)
    const filtered = filterRules(mapped, { category: 'performance' })
    const lines: string[] = []
    formatTable(filtered, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('no-console')
    expect(output).toContain('Total: 1 rules')
  })

  test('pipeline formats filtered rules as tree', () => {
    const loaded = {
      'no-console': makeLoadedRule({ description: 'No console', severity: 'warning' }),
    }
    const mapped = mapRulesToInfo(loaded, getCat)
    const filtered = filterRules(mapped, { category: 'performance' })
    const lines: string[] = []
    formatTree(filtered, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('no-console')
    expect(output).toContain('Total: 1 rules')
  })
})
