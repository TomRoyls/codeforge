import { describe, expect, it } from 'vitest'

import type { RuleInfo } from '../../src/commands/rules-helpers.js'

import { filterRules, mapRulesToInfo } from '../../src/commands/rules-helpers.js'

// ─── Helpers ───

function makeRuleInfo(overrides: Partial<RuleInfo> = {}): RuleInfo {
  return {
    category: overrides.category ?? 'complexity',
    description: overrides.description ?? 'A test rule',
    fixable: overrides.fixable ?? false,
    name: overrides.name ?? 'test-rule',
    recommended: overrides.recommended ?? false,
    severity: overrides.severity ?? 'warning',
  }
}

// ─── filterRules ───

describe('filterRules', () => {
  const rules = [
    makeRuleInfo({ name: 'no-eval', category: 'security', severity: 'error', fixable: true, description: 'Disallow eval' }),
    makeRuleInfo({ name: 'max-params', category: 'complexity', severity: 'warning', description: 'Limit parameters' }),
    makeRuleInfo({ name: 'prefer-const', category: 'patterns', severity: 'info', fixable: true, description: 'Use const' }),
  ]

  it('returns all rules when no filters', () => {
    expect(filterRules(rules, {})).toHaveLength(3)
  })

  it('filters by category', () => {
    expect(filterRules(rules, { category: 'security' })).toHaveLength(1)
    expect(filterRules(rules, { category: 'security' })[0]!.name).toBe('no-eval')
  })

  it('filters by fixable', () => {
    const result = filterRules(rules, { fixable: true })
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.fixable)).toBe(true)
  })

  it('filters by search term', () => {
    const result = filterRules(rules, { search: 'eval' })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('no-eval')
  })

  it('search is case-insensitive', () => {
    expect(filterRules(rules, { search: 'DISALLOW' })).toHaveLength(1)
  })

  it('filters by severity', () => {
    expect(filterRules(rules, { severity: 'error' })).toHaveLength(1)
    expect(filterRules(rules, { severity: 'warning' })).toHaveLength(1)
    expect(filterRules(rules, { severity: 'info' })).toHaveLength(1)
  })

  it('combines multiple filters', () => {
    expect(filterRules(rules, { category: 'security', fixable: true })).toHaveLength(1)
    expect(filterRules(rules, { category: 'complexity', fixable: true })).toHaveLength(0)
  })

  it('returns empty for no matches', () => {
    expect(filterRules(rules, { category: 'nonexistent' })).toHaveLength(0)
  })
})

// ─── mapRulesToInfo ───

describe('mapRulesToInfo', () => {
  it('maps loaded rules to RuleInfo array', () => {
    const loaded = {
      'no-eval': { meta: { description: 'No eval', category: 'security', severity: 'error' } },
      'max-params': { meta: { description: 'Max params', category: 'complexity' } },
    }
    const info = mapRulesToInfo(loaded as any, () => 'patterns')
    expect(info).toHaveLength(2)
  })

  it('detects fixable rules via fix function', () => {
    const loaded = {
      'fixable-rule': { meta: { description: 'Fixable' }, fix: () => {} },
    }
    const info = mapRulesToInfo(loaded as any, () => 'patterns')
    expect(info[0]!.fixable).toBe(true)
  })

  it('detects fixable rules via meta.fixable', () => {
    const loaded = {
      'fixable-rule': { meta: { description: 'Fixable', fixable: 'code' as const } },
    }
    const info = mapRulesToInfo(loaded as any, () => 'patterns')
    expect(info[0]!.fixable).toBe(true)
  })

  it('uses getRuleCategoryFn as fallback for category', () => {
    const loaded = {
      'no-cat': { meta: { description: 'No cat' } },
    }
    const info = mapRulesToInfo(loaded as any, () => 'fallback-cat')
    expect(info[0]!.category).toBe('fallback-cat')
  })

  it('sorts by name', () => {
    const loaded = {
      'z-rule': { meta: { description: 'Z' } },
      'a-rule': { meta: { description: 'A' } },
    }
    const info = mapRulesToInfo(loaded as any, () => 'patterns')
    expect(info[0]!.name).toBe('a-rule')
  })

  it('uses default severity info when not specified', () => {
    const loaded = {
      'my-rule': { meta: { description: 'My rule' } },
    }
    const info = mapRulesToInfo(loaded as any, () => 'patterns')
    expect(info[0]!.severity).toBe('info')
  })
})
