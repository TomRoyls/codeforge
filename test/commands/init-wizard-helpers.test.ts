import { describe, expect, it } from 'vitest'

import {
  buildConfigFromSelection,
  getCategorySummaries,
  formatCategoryMenu,
  formatProfileOptions,
  formatRuleList,
  setCategorySeverity,
  setRuleSeverity,
  toggleCategorySelection,
  toggleRuleSelection,
  type WizardRuleInfo,
} from '../../src/commands/init-wizard-helpers.js'

// ─── Helpers ───

function makeRule(overrides: Partial<WizardRuleInfo> = {}): WizardRuleInfo {
  return {
    category: 'security',
    description: 'test rule',
    fixable: false,
    id: 'test-rule',
    recommended: true,
    ...overrides,
  }
}

// ─── formatProfileOptions ───

describe('formatProfileOptions', () => {
  it('formats profile options with key and label', () => {
    const options = [
      { description: 'Low noise', errorCount: 5, key: 'lenient', label: 'Lenient', warningCount: 2 },
    ]
    const lines = formatProfileOptions(options)
    expect(lines[0]).toContain('[lenient]')
    expect(lines[0]).toContain('Lenient')
  })

  it('includes error and warning counts', () => {
    const options = [
      { description: 'desc', errorCount: 3, key: 'test', label: 'Test', warningCount: 7 },
    ]
    const lines = formatProfileOptions(options)
    expect(lines[1]).toContain('3 errors')
    expect(lines[1]).toContain('7 warnings')
  })
})

// ─── getCategorySummaries ───

describe('getCategorySummaries', () => {
  it('groups rules by category', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'patterns', id: 'r3' }),
    ]
    const selected = new Set(['r1'])
    const summaries = getCategorySummaries(rules, selected)
    expect(summaries).toHaveLength(2)
    expect(summaries.find((s) => s.id === 'security')?.ruleCount).toBe(2)
    expect(summaries.find((s) => s.id === 'security')?.selectedCount).toBe(1)
  })

  it('sorts categories alphabetically', () => {
    const rules = [
      makeRule({ category: 'z-security', id: 'r1' }),
      makeRule({ category: 'a-patterns', id: 'r2' }),
    ]
    const summaries = getCategorySummaries(rules, new Set())
    expect(summaries[0].id).toBe('a-patterns')
    expect(summaries[1].id).toBe('z-security')
  })
})

// ─── formatCategoryMenu ───

describe('formatCategoryMenu', () => {
  it('includes numbered categories', () => {
    const cats = [
      { id: 'security', recommendedCount: 5, ruleCount: 10, selectedCount: 3 },
    ]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toContain('[1]')
    expect(lines[1]).toContain('security')
  })

  it('includes done option', () => {
    const lines = formatCategoryMenu([])
    expect(lines).toContain('[0] Done - preview configuration')
  })
})

// ─── formatRuleList ───

describe('formatRuleList', () => {
  it('shows selected rules with x', () => {
    const rules = [makeRule({ id: 'my-rule' })]
    const selected = new Set(['my-rule'])
    const lines = formatRuleList(rules, selected)
    expect(lines[0]).toContain('[x]')
    expect(lines[0]).toContain('my-rule')
  })

  it('shows unselected rules with space', () => {
    const rules = [makeRule({ id: 'my-rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('[ ]')
  })

  it('marks recommended rules', () => {
    const rules = [makeRule({ recommended: true })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('recommended')
  })
})

// ─── toggleRuleSelection ───

describe('toggleRuleSelection', () => {
  it('adds rule when not selected', () => {
    const result = toggleRuleSelection('r1', new Set())
    expect(result.has('r1')).toBe(true)
  })

  it('removes rule when already selected', () => {
    const result = toggleRuleSelection('r1', new Set(['r1']))
    expect(result.has('r1')).toBe(false)
  })

  it('does not mutate original set', () => {
    const original = new Set(['r1'])
    toggleRuleSelection('r2', original)
    expect(original.has('r2')).toBe(false)
  })
})

// ─── toggleCategorySelection ───

describe('toggleCategorySelection', () => {
  const rules = [
    makeRule({ category: 'sec', id: 'r1' }),
    makeRule({ category: 'sec', id: 'r2' }),
  ]

  it('selects all rules in category when not all selected', () => {
    const result = toggleCategorySelection(rules, 'sec', new Set(['r1']))
    expect(result.has('r1')).toBe(true)
    expect(result.has('r2')).toBe(true)
  })

  it('deselects all rules when all selected', () => {
    const result = toggleCategorySelection(rules, 'sec', new Set(['r1', 'r2']))
    expect(result.has('r1')).toBe(false)
    expect(result.has('r2')).toBe(false)
  })
})

// ─── setRuleSeverity ───

describe('setRuleSeverity', () => {
  it('sets severity for a rule', () => {
    const result = setRuleSeverity('r1', 'error', {})
    expect(result.r1).toBe('error')
  })

  it('preserves existing rules', () => {
    const result = setRuleSeverity('r2', 'warning', { r1: 'error' })
    expect(result.r1).toBe('error')
    expect(result.r2).toBe('warning')
  })
})

// ─── setCategorySeverity ───

describe('setCategorySeverity', () => {
  const rules = [
    makeRule({ category: 'sec', id: 'r1' }),
    makeRule({ category: 'sec', id: 'r2' }),
  ]

  it('sets severity for all rules in category', () => {
    const result = setCategorySeverity(rules, 'sec', 'error', {})
    expect(result.r1).toBe('error')
    expect(result.r2).toBe('error')
  })
})

// ─── buildConfigFromSelection ───

describe('buildConfigFromSelection', () => {
  it('builds config from selected rules', () => {
    const config = buildConfigFromSelection(new Set(['r1', 'r2']), 'error', [])
    expect(config.r1).toBe('error')
    expect(config.r2).toBe('error')
    expect(Object.keys(config)).toHaveLength(2)
  })

  it('handles empty selection', () => {
    const config = buildConfigFromSelection(new Set(), 'error', [])
    expect(Object.keys(config)).toHaveLength(0)
  })
})
