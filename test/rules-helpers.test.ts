import { describe, it, expect } from 'vitest'
import {
  mapRulesToInfo,
  filterRules,
  formatTable,
  formatTree,
  colorizeSeverity,
} from '../src/commands/rules-helpers.js'

import type { RuleInfo } from '../src/commands/rules-helpers.js'

// ─── mapRulesToInfo ────────────────────────────────────
describe('mapRulesToInfo', () => {
  it('maps rule definitions to RuleInfo objects', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console calls' } },
      'no-eval': { meta: { description: 'No eval usage' } },
    }
    const result = mapRulesToInfo(loaded, () => 'security')
    expect(result).toHaveLength(2)
  })

  it('uses meta.category when available', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console', category: 'style' } },
    }
    const result = mapRulesToInfo(loaded, () => 'security')
    expect(result[0]!.category).toBe('style')
  })

  it('falls back to getRuleCategoryFn when meta.category is undefined', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console' } },
    }
    const result = mapRulesToInfo(loaded, () => 'fallback')
    expect(result[0]!.category).toBe('fallback')
  })

  it('detects fixable from meta.fixable', () => {
    const loaded = {
      'prefer-const': { meta: { description: 'Prefer const', fixable: 'code' as const } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.fixable).toBe(true)
  })

  it('detects fixable from fix method', () => {
    const loaded = {
      'prefer-const': { fix: () => {}, meta: { description: 'Prefer const' } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.fixable).toBe(true)
  })

  it('marks non-fixable rules correctly', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console' } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.fixable).toBe(false)
  })

  it('uses meta.recommended when available', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console', recommended: true } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.recommended).toBe(true)
  })

  it('defaults recommended to false', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console' } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.recommended).toBe(false)
  })

  it('uses meta.severity when available', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console', severity: 'error' } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.severity).toBe('error')
  })

  it('defaults severity to info', () => {
    const loaded = {
      'no-console': { meta: { description: 'No console' } },
    }
    const result = mapRulesToInfo(loaded, () => 'style')
    expect(result[0]!.severity).toBe('info')
  })

  it('sorts rules by name', () => {
    const loaded = {
      'zebra-rule': { meta: { description: 'Z' } },
      'alpha-rule': { meta: { description: 'A' } },
    }
    const result = mapRulesToInfo(loaded, () => 'test')
    expect(result[0]!.name).toBe('alpha-rule')
    expect(result[1]!.name).toBe('zebra-rule')
  })

  it('handles empty rules', () => {
    expect(mapRulesToInfo({}, () => 'test')).toEqual([])
  })
})

// ─── filterRules ───────────────────────────────────────
describe('filterRules', () => {
  const rules: RuleInfo[] = [
    { category: 'security', description: 'No eval usage', fixable: true, name: 'no-eval', recommended: true, severity: 'error' },
    { category: 'style', description: 'Prefer const', fixable: true, name: 'prefer-const', recommended: true, severity: 'warning' },
    { category: 'security', description: 'No unsafe regex', fixable: false, name: 'no-unsafe-regex', recommended: false, severity: 'info' },
    { category: 'complexity', description: 'Max params', fixable: false, name: 'max-params', recommended: false, severity: 'warning' },
  ]

  it('returns all rules with no filters', () => {
    expect(filterRules(rules, {})).toHaveLength(4)
  })

  it('filters by category', () => {
    const result = filterRules(rules, { category: 'security' })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.category === 'security')).toBe(true)
  })

  it('filters by fixable', () => {
    const result = filterRules(rules, { fixable: true })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.fixable)).toBe(true)
  })

  it('filters by search term in description', () => {
    const result = filterRules(rules, { search: 'eval' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-eval')
  })

  it('search is case-insensitive', () => {
    const result = filterRules(rules, { search: 'EVAL' })
    expect(result).toHaveLength(1)
  })

  it('filters by severity', () => {
    const result = filterRules(rules, { severity: 'error' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-eval')
  })

  it('combines multiple filters', () => {
    const result = filterRules(rules, { category: 'security', fixable: true })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-eval')
  })

  it('returns empty when no matches', () => {
    expect(filterRules(rules, { category: 'nonexistent' })).toEqual([])
  })

  it('handles empty rules array', () => {
    expect(filterRules([], { category: 'security' })).toEqual([])
  })
})

// ─── formatTable ───────────────────────────────────────
describe('formatTable', () => {
  it('outputs table header and rows', () => {
    const messages: string[] = []
    const rules: RuleInfo[] = [
      { category: 'security', description: 'No eval', fixable: true, name: 'no-eval', recommended: true, severity: 'error' },
    ]
    formatTable(rules, (m) => messages.push(m))
    expect(messages.length).toBeGreaterThan(0)
  })

  it('includes total count', () => {
    const messages: string[] = []
    const rules: RuleInfo[] = [
      { category: 'security', description: 'A', fixable: false, name: 'rule1', recommended: false, severity: 'info' },
      { category: 'style', description: 'B', fixable: false, name: 'rule2', recommended: false, severity: 'info' },
    ]
    formatTable(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('2 rules'))).toBe(true)
  })

  it('includes legend for recommended and fixable', () => {
    const messages: string[] = []
    formatTable(
      [{ category: 'test', description: 'Test', fixable: true, name: 'test', recommended: true, severity: 'info' }],
      (m) => messages.push(m),
    )
    expect(messages.some((m) => m.includes('recommended'))).toBe(true)
    expect(messages.some((m) => m.includes('fixable'))).toBe(true)
  })

  it('handles empty rules list', () => {
    const messages: string[] = []
    formatTable([], (m) => messages.push(m))
    expect(messages.some((m) => m.includes('0 rules'))).toBe(true)
  })
})

// ─── formatTree ────────────────────────────────────────
describe('formatTree', () => {
  it('outputs tree header', () => {
    const messages: string[] = []
    formatTree([], (m) => messages.push(m))
    expect(messages.some((m) => m.includes('CodeForge Rules'))).toBe(true)
  })

  it('groups rules by category', () => {
    const messages: string[] = []
    const rules: RuleInfo[] = [
      { category: 'security', description: 'No eval', fixable: false, name: 'no-eval', recommended: false, severity: 'error' },
      { category: 'style', description: 'Prefer const', fixable: true, name: 'prefer-const', recommended: true, severity: 'warning' },
    ]
    formatTree(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('security'))).toBe(true)
    expect(messages.some((m) => m.includes('style'))).toBe(true)
  })

  it('shows rule counts per category', () => {
    const messages: string[] = []
    const rules: RuleInfo[] = [
      { category: 'security', description: 'A', fixable: false, name: 'rule1', recommended: false, severity: 'info' },
      { category: 'security', description: 'B', fixable: false, name: 'rule2', recommended: false, severity: 'info' },
    ]
    formatTree(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('(2)'))).toBe(true)
  })

  it('shows summary with totals', () => {
    const messages: string[] = []
    const rules: RuleInfo[] = [
      { category: 'test', description: 'A', fixable: true, name: 'rule1', recommended: true, severity: 'info' },
      { category: 'test', description: 'B', fixable: false, name: 'rule2', recommended: false, severity: 'info' },
    ]
    formatTree(rules, (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Total: 2 rules'))).toBe(true)
    expect(messages.some((m) => m.includes('1 recommended'))).toBe(true)
    expect(messages.some((m) => m.includes('1 fixable'))).toBe(true)
  })

  it('handles empty rules', () => {
    const messages: string[] = []
    formatTree([], (m) => messages.push(m))
    expect(messages.some((m) => m.includes('Total: 0 rules'))).toBe(true)
  })
})

// ─── colorizeSeverity (re-export) ──────────────────────
describe('colorizeSeverity', () => {
  it('colorizes error', () => {
    const result = colorizeSeverity('error')
    expect(result).toContain('error')
  })

  it('colorizes warning', () => {
    const result = colorizeSeverity('warning')
    expect(result).toContain('warning')
  })

  it('colorizes info', () => {
    const result = colorizeSeverity('info')
    expect(result).toContain('info')
  })

  it('returns unknown severity as-is', () => {
    const result = colorizeSeverity('debug')
    expect(result).toBe('debug')
  })
})
