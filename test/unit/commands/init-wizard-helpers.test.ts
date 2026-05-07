import { describe, test, expect } from 'vitest'
import {
  type CategorySummary,
  type ProfileOption,
  type WizardRuleInfo,
  buildConfigFromSelection,
  formatCategoryMenu,
  formatConfigPreview,
  formatProfileOptions,
  formatRuleList,
  getCategorySummaries,
  getProfileOptionsFromConfigs,
  getSeveritiesForCategory,
  setCategorySeverity,
  setRuleSeverity,
  toggleCategorySelection,
  toggleRuleSelection,
} from '../../../src/commands/init-wizard-helpers.js'
import type { RuleEnvConfig } from '../../../src/config/types.js'
import type { SeverityProfile } from '../../../src/profiles/index.js'

function makeRule(overrides: Partial<WizardRuleInfo> = {}): WizardRuleInfo {
  return {
    category: 'security',
    description: 'Test rule',
    fixable: false,
    id: 'test-rule',
    recommended: false,
    ...overrides,
  }
}

const sampleRules: WizardRuleInfo[] = [
  makeRule({ category: 'security', description: 'Disallow eval', fixable: false, id: 'no-eval', recommended: true }),
  makeRule({ category: 'security', description: 'Disallow unsafe', fixable: true, id: 'no-unsafe', recommended: true }),
  makeRule({ category: 'security', description: 'No console', fixable: true, id: 'no-console', recommended: false }),
  makeRule({ category: 'patterns', description: 'Prefer const', fixable: true, id: 'prefer-const', recommended: true }),
  makeRule({ category: 'patterns', description: 'No var', fixable: true, id: 'no-var', recommended: true }),
  makeRule({ category: 'patterns', description: 'No magic numbers', fixable: false, id: 'no-magic', recommended: false }),
  makeRule({ category: 'complexity', description: 'Max params', fixable: false, id: 'max-params', recommended: true }),
  makeRule({ category: 'complexity', description: 'Max depth', fixable: false, id: 'max-depth', recommended: false }),
]

function makeProfileOption(overrides: Partial<ProfileOption> = {}): ProfileOption {
  return {
    description: 'Test profile',
    errorCount: 10,
    key: 'test',
    label: 'Test',
    warningCount: 5,
    ...overrides,
  }
}

function makeCategorySummary(overrides: Partial<CategorySummary> = {}): CategorySummary {
  return {
    id: 'security',
    recommendedCount: 2,
    ruleCount: 3,
    selectedCount: 1,
    ...overrides,
  }
}

describe('formatProfileOptions', () => {
  test('formats single profile option', () => {
    const profiles = [
      makeProfileOption({ description: 'Balanced.', errorCount: 45, key: '1', label: 'Moderate', warningCount: 120 }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines).toEqual([
      '[1] Moderate - Balanced.',
      '    45 errors, 120 warnings',
    ])
  })

  test('formats multiple profile options', () => {
    const profiles = [
      makeProfileOption({ description: 'Max enforcement.', errorCount: 165, key: '1', label: 'Strict', warningCount: 0 }),
      makeProfileOption({ description: 'Low noise.', errorCount: 12, key: '2', label: 'Lenient', warningCount: 30 }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines).toHaveLength(4)
    expect(lines[0]).toContain('Strict')
    expect(lines[1]).toContain('165 errors')
    expect(lines[2]).toContain('Lenient')
    expect(lines[3]).toContain('12 errors')
  })

  test('returns empty array for empty profiles', () => {
    expect(formatProfileOptions([])).toEqual([])
  })

  test('includes key in brackets', () => {
    const profiles = [makeProfileOption({ key: 'moderate' })]
    const lines = formatProfileOptions(profiles)
    expect(lines[0]).toContain('[moderate]')
  })

  test('includes label after key', () => {
    const profiles = [makeProfileOption({ key: '1', label: 'Moderate' })]
    const lines = formatProfileOptions(profiles)
    expect(lines[0]).toMatch(/\[1\] Moderate/)
  })

  test('includes description after label', () => {
    const profiles = [makeProfileOption({ description: 'Balanced approach.' })]
    const lines = formatProfileOptions(profiles)
    expect(lines[0]).toContain('Balanced approach.')
  })

  test('separates profile info and counts across two lines', () => {
    const profiles = [makeProfileOption()]
    const lines = formatProfileOptions(profiles)
    expect(lines).toHaveLength(2)
  })

  test('handles zero error and warning counts', () => {
    const profiles = [makeProfileOption({ errorCount: 0, warningCount: 0 })]
    const lines = formatProfileOptions(profiles)
    expect(lines[1]).toBe('    0 errors, 0 warnings')
  })

  test('handles large counts', () => {
    const profiles = [makeProfileOption({ errorCount: 9999, warningCount: 8888 })]
    const lines = formatProfileOptions(profiles)
    expect(lines[1]).toBe('    9999 errors, 8888 warnings')
  })

  test('formats custom option correctly', () => {
    const profiles = [
      makeProfileOption({
        description: 'Choose rules yourself',
        errorCount: 0,
        key: 'custom',
        label: 'Custom',
        warningCount: 0,
      }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines[0]).toBe('[custom] Custom - Choose rules yourself')
    expect(lines[1]).toBe('    0 errors, 0 warnings')
  })

  test('preserves order of profiles', () => {
    const profiles = [
      makeProfileOption({ key: 'b', label: 'B' }),
      makeProfileOption({ key: 'a', label: 'A' }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines[0]).toContain('[b]')
    expect(lines[2]).toContain('[a]')
  })
})

describe('getCategorySummaries', () => {
  test('returns empty array for empty rules', () => {
    expect(getCategorySummaries([], new Set())).toEqual([])
  })

  test('returns single category for rules in one category', () => {
    const rules = [
      makeRule({ category: 'security', id: 'rule-1', recommended: true }),
      makeRule({ category: 'security', id: 'rule-2', recommended: false }),
    ]
    const summaries = getCategorySummaries(rules, new Set(['rule-1']))
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toEqual({
      id: 'security',
      recommendedCount: 1,
      ruleCount: 2,
      selectedCount: 1,
    })
  })

  test('returns multiple categories sorted by name', () => {
    const rules = [
      makeRule({ category: 'patterns', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'complexity', id: 'r3' }),
    ]
    const summaries = getCategorySummaries(rules, new Set())
    const ids = summaries.map((s) => s.id)
    expect(ids).toEqual(['complexity', 'patterns', 'security'])
  })

  test('counts recommended rules correctly', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1', recommended: true }),
      makeRule({ category: 'security', id: 'r2', recommended: true }),
      makeRule({ category: 'security', id: 'r3', recommended: false }),
    ]
    const summaries = getCategorySummaries(rules, new Set())
    expect(summaries[0].recommendedCount).toBe(2)
  })

  test('counts selected rules correctly', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'security', id: 'r3' }),
    ]
    const summaries = getCategorySummaries(rules, new Set(['r1', 'r3']))
    expect(summaries[0].selectedCount).toBe(2)
  })

  test('zero selected when empty set', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const summaries = getCategorySummaries(rules, new Set())
    expect(summaries[0].selectedCount).toBe(0)
  })

  test('all selected when all in set', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
    ]
    const summaries = getCategorySummaries(rules, new Set(['r1', 'r2']))
    expect(summaries[0].selectedCount).toBe(2)
  })

  test('counts total rules per category', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'security', id: 'r3' }),
      makeRule({ category: 'patterns', id: 'r4' }),
    ]
    const summaries = getCategorySummaries(rules, new Set())
    expect(summaries.find((s) => s.id === 'security')?.ruleCount).toBe(3)
    expect(summaries.find((s) => s.id === 'patterns')?.ruleCount).toBe(1)
  })

  test('handles sample rules correctly', () => {
    const summaries = getCategorySummaries(sampleRules, new Set(['no-eval', 'prefer-const']))
    expect(summaries).toHaveLength(3)
    const security = summaries.find((s) => s.id === 'security')!
    expect(security.ruleCount).toBe(3)
    expect(security.recommendedCount).toBe(2)
    expect(security.selectedCount).toBe(1)
  })

  test('ignores selection of non-existent rules', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const summaries = getCategorySummaries(rules, new Set(['nonexistent']))
    expect(summaries[0].selectedCount).toBe(0)
  })
})

describe('formatCategoryMenu', () => {
  test('formats header line', () => {
    const lines = formatCategoryMenu([])
    expect(lines[0]).toBe('Select a category to configure:')
  })

  test('formats single category', () => {
    const cats = [makeCategorySummary({ id: 'Security', recommendedCount: 15, ruleCount: 20, selectedCount: 20 })]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toBe('[1] Security (20 rules, 15 recommended, 20 selected)')
  })

  test('formats multiple categories with sequential numbering', () => {
    const cats = [
      makeCategorySummary({ id: 'Security', ruleCount: 20 }),
      makeCategorySummary({ id: 'Patterns', ruleCount: 100 }),
    ]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toContain('[1]')
    expect(lines[2]).toContain('[2]')
  })

  test('includes Done option at end', () => {
    const lines = formatCategoryMenu([])
    const last = lines[lines.length - 1]
    expect(last).toBe('[0] Done - preview configuration')
  })

  test('handles empty categories with just header and done', () => {
    const lines = formatCategoryMenu([])
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('Select a category to configure:')
    expect(lines[1]).toBe('[0] Done - preview configuration')
  })

  test('formats with zero recommended', () => {
    const cats = [makeCategorySummary({ id: 'Custom', recommendedCount: 0, ruleCount: 5, selectedCount: 0 })]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toContain('0 recommended')
  })

  test('formats with zero selected', () => {
    const cats = [makeCategorySummary({ id: 'Security', recommendedCount: 5, ruleCount: 10, selectedCount: 0 })]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toContain('0 selected')
  })

  test('handles large numbers', () => {
    const cats = [makeCategorySummary({ id: 'Patterns', recommendedCount: 100, ruleCount: 1900, selectedCount: 500 })]
    const lines = formatCategoryMenu(cats)
    expect(lines[1]).toContain('1900 rules')
    expect(lines[1]).toContain('100 recommended')
    expect(lines[1]).toContain('500 selected')
  })
})

describe('formatRuleList', () => {
  test('formats selected rule with x', () => {
    const rules = [makeRule({ id: 'my-rule', recommended: true, description: 'A rule' })]
    const lines = formatRuleList(rules, new Set(['my-rule']))
    expect(lines[0]).toMatch(/^\[x\]/)
  })

  test('formats unselected rule with space', () => {
    const rules = [makeRule({ id: 'my-rule', recommended: false, description: 'A rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toMatch(/^\[ \]/)
  })

  test('includes recommended marker for recommended rules', () => {
    const rules = [makeRule({ id: 'my-rule', recommended: true, description: 'A rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('(recommended)')
  })

  test('omits recommended marker for non-recommended rules', () => {
    const rules = [makeRule({ id: 'my-rule', recommended: false, description: 'A rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).not.toContain('(recommended)')
  })

  test('includes fixable indicator for fixable rules', () => {
    const rules = [makeRule({ id: 'my-rule', fixable: true, description: 'Fixable rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('\u{1F527}')
  })

  test('omits fixable indicator for non-fixable rules', () => {
    const rules = [makeRule({ id: 'my-rule', fixable: false, description: 'Non-fixable rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).not.toContain('\u{1F527}')
  })

  test('includes rule id', () => {
    const rules = [makeRule({ id: 'specific-rule' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('specific-rule')
  })

  test('includes description', () => {
    const rules = [makeRule({ description: 'Some detailed description' })]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toContain('Some detailed description')
  })

  test('returns empty array for empty rules', () => {
    expect(formatRuleList([], new Set())).toEqual([])
  })

  test('formats multiple rules', () => {
    const rules = [
      makeRule({ id: 'rule-1', recommended: true }),
      makeRule({ id: 'rule-2', recommended: false, fixable: true }),
    ]
    const lines = formatRuleList(rules, new Set(['rule-1']))
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('[x]')
    expect(lines[1]).toContain('[ ]')
  })

  test('formats all fields together for recommended fixable rule', () => {
    const rules = [makeRule({ id: 'prefer-const', recommended: true, fixable: true, description: 'Prefer const' })]
    const lines = formatRuleList(rules, new Set(['prefer-const']))
    const line = lines[0]
    expect(line).toContain('[x]')
    expect(line).toContain('prefer-const')
    expect(line).toContain('(recommended)')
    expect(line).toContain('Prefer const')
    expect(line).toContain('\u{1F527}')
  })
})

describe('toggleRuleSelection', () => {
  test('adds rule to empty set', () => {
    const result = toggleRuleSelection('rule-1', new Set())
    expect(result.has('rule-1')).toBe(true)
  })

  test('removes rule from set', () => {
    const result = toggleRuleSelection('rule-1', new Set(['rule-1']))
    expect(result.has('rule-1')).toBe(false)
  })

  test('adds rule to set with other rules', () => {
    const result = toggleRuleSelection('rule-3', new Set(['rule-1', 'rule-2']))
    expect(result.has('rule-1')).toBe(true)
    expect(result.has('rule-2')).toBe(true)
    expect(result.has('rule-3')).toBe(true)
  })

  test('removes rule from set without affecting others', () => {
    const result = toggleRuleSelection('rule-1', new Set(['rule-1', 'rule-2']))
    expect(result.has('rule-1')).toBe(false)
    expect(result.has('rule-2')).toBe(true)
  })

  test('does not mutate original set', () => {
    const original = new Set(['rule-1'])
    toggleRuleSelection('rule-2', original)
    expect(original.has('rule-2')).toBe(false)
  })

  test('toggling same rule twice returns to original state', () => {
    const original = new Set(['rule-1'])
    const after1 = toggleRuleSelection('rule-1', original)
    const after2 = toggleRuleSelection('rule-1', after1)
    expect(after2.has('rule-1')).toBe(true)
  })

  test('returns new Set instance', () => {
    const original = new Set<string>()
    const result = toggleRuleSelection('rule-1', original)
    expect(result).not.toBe(original)
  })

  test('handles empty rule id', () => {
    const result = toggleRuleSelection('', new Set())
    expect(result.has('')).toBe(true)
  })
})

describe('toggleCategorySelection', () => {
  test('selects all rules in category when some are unselected', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'security', id: 'r3' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['r1']))
    expect(result.has('r1')).toBe(true)
    expect(result.has('r2')).toBe(true)
    expect(result.has('r3')).toBe(true)
  })

  test('deselects all rules in category when all are selected', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['r1', 'r2']))
    expect(result.has('r1')).toBe(false)
    expect(result.has('r2')).toBe(false)
  })

  test('does not affect rules in other categories', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['p1']))
    expect(result.has('p1')).toBe(true)
    expect(result.has('s1')).toBe(true)
  })

  test('selects all when none are selected', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set())
    expect(result.has('r1')).toBe(true)
    expect(result.has('r2')).toBe(true)
  })

  test('handles empty rules in category', () => {
    const rules = [makeRule({ category: 'patterns', id: 'p1' })]
    const result = toggleCategorySelection(rules, 'security', new Set())
    expect(result.has('p1')).toBe(false)
    expect(result.size).toBe(0)
  })

  test('does not mutate original set', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const original = new Set<string>()
    toggleCategorySelection(rules, 'security', original)
    expect(original.size).toBe(0)
  })

  test('preserves selections from other categories on deselect', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['s1', 's2', 'p1']))
    expect(result.has('s1')).toBe(false)
    expect(result.has('s2')).toBe(false)
    expect(result.has('p1')).toBe(true)
  })

  test('preserves selections from other categories on select', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['p1']))
    expect(result.has('s1')).toBe(true)
    expect(result.has('p1')).toBe(true)
  })

  test('handles category with single rule', () => {
    const rules = [makeRule({ category: 'security', id: 's1' })]
    const selected = toggleCategorySelection(rules, 'security', new Set())
    expect(selected.has('s1')).toBe(true)
    const deselected = toggleCategorySelection(rules, 'security', selected)
    expect(deselected.has('s1')).toBe(false)
  })

  test('works with sample rules', () => {
    const selected = new Set(['no-eval', 'prefer-const'])
    const result = toggleCategorySelection(sampleRules, 'security', selected)
    expect(result.has('no-eval')).toBe(true)
    expect(result.has('no-unsafe')).toBe(true)
    expect(result.has('no-console')).toBe(true)
    expect(result.has('prefer-const')).toBe(true)
  })
})

describe('setRuleSeverity', () => {
  test('sets severity for new rule', () => {
    const config: RuleEnvConfig = {}
    const result = setRuleSeverity('my-rule', 'error', config)
    expect(result['my-rule']).toBe('error')
  })

  test('overrides existing severity', () => {
    const config: RuleEnvConfig = { 'my-rule': 'warning' }
    const result = setRuleSeverity('my-rule', 'error', config)
    expect(result['my-rule']).toBe('error')
  })

  test('does not mutate original config', () => {
    const config: RuleEnvConfig = { 'my-rule': 'warning' }
    setRuleSeverity('my-rule', 'error', config)
    expect(config['my-rule']).toBe('warning')
  })

  test('preserves other rules', () => {
    const config: RuleEnvConfig = { 'rule-a': 'error', 'rule-b': 'warning' }
    const result = setRuleSeverity('rule-c', 'info', config)
    expect(result['rule-a']).toBe('error')
    expect(result['rule-b']).toBe('warning')
    expect(result['rule-c']).toBe('info')
  })

  test('sets warning severity', () => {
    const result = setRuleSeverity('rule-1', 'warning', {})
    expect(result['rule-1']).toBe('warning')
  })

  test('sets info severity', () => {
    const result = setRuleSeverity('rule-1', 'info', {})
    expect(result['rule-1']).toBe('info')
  })

  test('sets error severity', () => {
    const result = setRuleSeverity('rule-1', 'error', {})
    expect(result['rule-1']).toBe('error')
  })

  test('returns new object', () => {
    const config: RuleEnvConfig = {}
    const result = setRuleSeverity('rule-1', 'error', config)
    expect(result).not.toBe(config)
  })
})

describe('setCategorySeverity', () => {
  test('sets severity for all rules in category', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const result = setCategorySeverity(rules, 'security', 'error', {})
    expect(result['s1']).toBe('error')
    expect(result['s2']).toBe('error')
    expect(result['p1']).toBeUndefined()
  })

  test('overwrites existing severities', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
    ]
    const config: RuleEnvConfig = { s1: 'warning' }
    const result = setCategorySeverity(rules, 'security', 'error', config)
    expect(result['s1']).toBe('error')
  })

  test('does not mutate original config', () => {
    const rules = [makeRule({ category: 'security', id: 's1' })]
    const config: RuleEnvConfig = { s1: 'warning' }
    setCategorySeverity(rules, 'security', 'error', config)
    expect(config['s1']).toBe('warning')
  })

  test('preserves rules in other categories', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const config: RuleEnvConfig = { p1: 'info' }
    const result = setCategorySeverity(rules, 'security', 'error', config)
    expect(result['p1']).toBe('info')
    expect(result['s1']).toBe('error')
  })

  test('handles empty rules list', () => {
    const result = setCategorySeverity([], 'security', 'error', {})
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('handles empty config', () => {
    const rules = [makeRule({ category: 'security', id: 's1' })]
    const result = setCategorySeverity(rules, 'security', 'warning', {})
    expect(result['s1']).toBe('warning')
  })

  test('handles category with no matching rules', () => {
    const rules = [makeRule({ category: 'patterns', id: 'p1' })]
    const result = setCategorySeverity(rules, 'security', 'error', { p1: 'info' })
    expect(result['p1']).toBe('info')
    expect(Object.keys(result)).toHaveLength(1)
  })

  test('sets all three severity levels', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
      makeRule({ category: 'security', id: 's3' }),
    ]
    const r1 = setCategorySeverity(rules, 'security', 'error', {})
    expect(r1['s1']).toBe('error')
    const r2 = setCategorySeverity(rules, 'security', 'warning', {})
    expect(r2['s1']).toBe('warning')
    const r3 = setCategorySeverity(rules, 'security', 'info', {})
    expect(r3['s1']).toBe('info')
  })
})

describe('buildConfigFromSelection', () => {
  test('builds config from selected rules', () => {
    const result = buildConfigFromSelection(
      new Set(['rule-1', 'rule-2']),
      'error',
      sampleRules,
    )
    expect(result['rule-1']).toBe('error')
    expect(result['rule-2']).toBe('error')
  })

  test('returns empty config for empty selection', () => {
    const result = buildConfigFromSelection(new Set(), 'error', sampleRules)
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('uses provided severity', () => {
    const result = buildConfigFromSelection(
      new Set(['rule-1']),
      'warning',
      sampleRules,
    )
    expect(result['rule-1']).toBe('warning')
  })

  test('uses info severity', () => {
    const result = buildConfigFromSelection(
      new Set(['rule-1']),
      'info',
      sampleRules,
    )
    expect(result['rule-1']).toBe('info')
  })

  test('only includes selected rules', () => {
    const result = buildConfigFromSelection(
      new Set(['rule-1']),
      'error',
      sampleRules,
    )
    expect(Object.keys(result)).toHaveLength(1)
  })

  test('handles all rules selected', () => {
    const allIds = new Set(sampleRules.map((r) => r.id))
    const result = buildConfigFromSelection(allIds, 'error', sampleRules)
    expect(Object.keys(result)).toHaveLength(sampleRules.length)
  })

  test('handles selection of non-existent rule ids', () => {
    const result = buildConfigFromSelection(
      new Set(['nonexistent-rule']),
      'error',
      sampleRules,
    )
    expect(result['nonexistent-rule']).toBe('error')
  })
})

describe('formatConfigPreview', () => {
  test('shows total rules enabled', () => {
    const config: RuleEnvConfig = { 'rule-1': 'error', 'rule-2': 'warning' }
    const lines = formatConfigPreview(config, sampleRules)
    expect(lines).toContain('Total rules enabled: 2')
  })

  test('shows header', () => {
    const lines = formatConfigPreview({}, sampleRules)
    expect(lines[0]).toBe('Configuration Preview:')
    expect(lines[1]).toBe('=====================')
  })

  test('counts errors warnings info', () => {
    const config: RuleEnvConfig = {
      r1: 'error',
      r2: 'error',
      r3: 'warning',
      r4: 'info',
    }
    const lines = formatConfigPreview(config, [
      makeRule({ id: 'r1', category: 'sec' }),
      makeRule({ id: 'r2', category: 'sec' }),
      makeRule({ id: 'r3', category: 'sec' }),
      makeRule({ id: 'r4', category: 'sec' }),
    ])
    expect(lines).toContain('Errors: 2, Warnings: 1, Info: 1')
  })

  test('shows zero for all when empty config', () => {
    const lines = formatConfigPreview({}, sampleRules)
    expect(lines).toContain('Total rules enabled: 0')
    expect(lines).toContain('Errors: 0, Warnings: 0, Info: 0')
  })

  test('groups by category', () => {
    const config: RuleEnvConfig = {
      'no-eval': 'error',
      'prefer-const': 'warning',
    }
    const lines = formatConfigPreview(config, sampleRules)
    const output = lines.join('\n')
    expect(output).toContain('By Category:')
  })

  test('sorts categories alphabetically', () => {
    const config: RuleEnvConfig = {
      'no-eval': 'error',
      'prefer-const': 'warning',
      'max-params': 'error',
    }
    const lines = formatConfigPreview(config, sampleRules)
    const categoryLines = lines.filter((l) => l.startsWith('  ') && l.includes('rules'))
    const categories = categoryLines.map((l) => l.trim().split(':')[0])
    for (let i = 1; i < categories.length; i++) {
      expect(categories[i] >= categories[i - 1]).toBe(true)
    }
  })

  test('counts rules per category', () => {
    const config: RuleEnvConfig = {
      'no-eval': 'error',
      'no-unsafe': 'warning',
      'prefer-const': 'error',
    }
    const lines = formatConfigPreview(config, sampleRules)
    const output = lines.join('\n')
    expect(output).toContain('security: 2 rules')
    expect(output).toContain('patterns: 1 rules')
  })

  test('handles config with array severity', () => {
    const config: RuleEnvConfig = {
      'no-eval': ['error', { max: 10 }] as unknown as RuleEnvConfig[string],
    }
    const lines = formatConfigPreview(config, [makeRule({ id: 'no-eval', category: 'security' })])
    expect(lines).toContain('Total rules enabled: 1')
    expect(lines).toContain('Errors: 1, Warnings: 0, Info: 0')
  })

  test('handles rule not in allRules', () => {
    const config: RuleEnvConfig = { 'unknown-rule': 'error' }
    const lines = formatConfigPreview(config, sampleRules)
    const output = lines.join('\n')
    expect(output).toContain('unknown: 1 rules')
  })

  test('handles all sample rules selected', () => {
    const config: RuleEnvConfig = {}
    for (const rule of sampleRules) {
      config[rule.id] = 'error'
    }
    const lines = formatConfigPreview(config, sampleRules)
    expect(lines).toContain(`Total rules enabled: ${sampleRules.length}`)
    expect(lines).toContain(`Errors: ${sampleRules.length}, Warnings: 0, Info: 0`)
  })
})

describe('getSeveritiesForCategory', () => {
  test('returns zero counts for empty config', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const result = getSeveritiesForCategory({}, rules, 'security')
    expect(result).toEqual({ error: 0, info: 0, warning: 0 })
  })

  test('counts errors in category', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
    ]
    const config: RuleEnvConfig = { r1: 'error', r2: 'error' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.error).toBe(2)
  })

  test('counts warnings in category', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const config: RuleEnvConfig = { r1: 'warning' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.warning).toBe(1)
  })

  test('counts info in category', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const config: RuleEnvConfig = { r1: 'info' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.info).toBe(1)
  })

  test('ignores rules from other categories', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'patterns', id: 'p1' }),
    ]
    const config: RuleEnvConfig = { s1: 'error', p1: 'error' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.error).toBe(1)
  })

  test('handles mixed severities', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
      makeRule({ category: 'security', id: 'r3' }),
    ]
    const config: RuleEnvConfig = { r1: 'error', r2: 'warning', r3: 'info' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result).toEqual({ error: 1, info: 1, warning: 1 })
  })

  test('handles array severity values', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const config: RuleEnvConfig = {
      r1: ['error', { max: 10 }] as unknown as RuleEnvConfig[string],
    }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.error).toBe(1)
  })

  test('returns zero for category with no rules', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const config: RuleEnvConfig = { r1: 'error' }
    const result = getSeveritiesForCategory(config, rules, 'patterns')
    expect(result).toEqual({ error: 0, info: 0, warning: 0 })
  })

  test('handles config with rules not in the rules list', () => {
    const rules = [makeRule({ category: 'security', id: 'r1' })]
    const config: RuleEnvConfig = { r1: 'error', other: 'warning' }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.error).toBe(1)
    expect(result.warning).toBe(0)
  })

  test('works with sample rules', () => {
    const config: RuleEnvConfig = {
      'no-eval': 'error',
      'no-unsafe': 'warning',
      'no-console': 'info',
      'prefer-const': 'error',
    }
    const result = getSeveritiesForCategory(config, sampleRules, 'security')
    expect(result).toEqual({ error: 1, info: 1, warning: 1 })
  })
})

describe('getProfileOptionsFromConfigs', () => {
  test('returns options for all three profiles', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'warning' },
      moderate: { r1: 'error' },
      strict: { r1: 'error', r2: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options).toHaveLength(4)
  })

  test('includes custom option at end', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    const last = options[options.length - 1]
    expect(last.key).toBe('custom')
    expect(last.label).toBe('Custom')
    expect(last.errorCount).toBe(0)
    expect(last.warningCount).toBe(0)
  })

  test('counts errors correctly per profile', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'warning' },
      moderate: { r1: 'error', r2: 'error' },
      strict: { r1: 'error', r2: 'error', r3: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.errorCount).toBe(0)
    expect(options.find((o) => o.key === 'moderate')?.errorCount).toBe(2)
    expect(options.find((o) => o.key === 'strict')?.errorCount).toBe(3)
  })

  test('counts warnings correctly per profile', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'warning', r2: 'warning' },
      moderate: { r1: 'error' },
      strict: { r1: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.warningCount).toBe(2)
    expect(options.find((o) => o.key === 'moderate')?.warningCount).toBe(0)
  })

  test('capitalizes profile labels', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.label).toBe('Lenient')
    expect(options.find((o) => o.key === 'moderate')?.label).toBe('Moderate')
    expect(options.find((o) => o.key === 'strict')?.label).toBe('Strict')
  })

  test('includes descriptions for each profile', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.description).toBeTruthy()
    expect(options.find((o) => o.key === 'moderate')?.description).toBeTruthy()
    expect(options.find((o) => o.key === 'strict')?.description).toBeTruthy()
  })

  test('custom option has choose yourself description', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    const custom = options.find((o) => o.key === 'custom')!
    expect(custom.description).toBe('Choose rules yourself')
  })

  test('handles empty configs', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    for (const opt of options) {
      if (opt.key !== 'custom') {
        expect(opt.errorCount).toBe(0)
        expect(opt.warningCount).toBe(0)
      }
    }
  })

  test('handles array severity values in configs', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: ['error', { max: 10 }] as unknown as RuleEnvConfig[string] },
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.errorCount).toBe(1)
  })

  test('handles info severity as non-error non-warning', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'info' },
      moderate: { r1: 'info' },
      strict: { r1: 'info' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    for (const opt of options) {
      if (opt.key !== 'custom') {
        expect(opt.errorCount).toBe(0)
        expect(opt.warningCount).toBe(0)
      }
    }
  })

  test('preserves profile order', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    const keys = options.map((o) => o.key)
    expect(keys.indexOf('lenient')).toBeLessThan(keys.indexOf('moderate'))
    expect(keys.indexOf('moderate')).toBeLessThan(keys.indexOf('strict'))
    expect(keys.indexOf('strict')).toBeLessThan(keys.indexOf('custom'))
  })
})

describe('formatProfileOptions — integration', () => {
  test('formats output from getProfileOptionsFromConfigs', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'warning' },
      moderate: { r1: 'error', r2: 'warning' },
      strict: { r1: 'error', r2: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    const lines = formatProfileOptions(options)
    expect(lines.length).toBe(8)
    expect(lines[0]).toContain('[lenient]')
    expect(lines[2]).toContain('[moderate]')
    expect(lines[4]).toContain('[strict]')
    expect(lines[6]).toContain('[custom]')
  })
})

describe('getCategorySummaries — integration with formatCategoryMenu', () => {
  test('end-to-end category menu flow', () => {
    const selected = new Set(['no-eval', 'prefer-const', 'no-var'])
    const summaries = getCategorySummaries(sampleRules, selected)
    const lines = formatCategoryMenu(summaries)
    expect(lines[0]).toBe('Select a category to configure:')
    expect(lines[lines.length - 1]).toBe('[0] Done - preview configuration')
    const securityLine = lines.find((l) => l.includes('security'))
    expect(securityLine).toContain('3 rules')
    expect(securityLine).toContain('2 recommended')
    expect(securityLine).toContain('1 selected')
  })
})

describe('formatRuleList — integration with toggleRuleSelection', () => {
  test('reflects toggled selection in formatted output', () => {
    const selected = new Set(['no-eval'])
    const toggled = toggleRuleSelection('no-unsafe', selected)
    const securityRules = sampleRules.filter((r) => r.category === 'security')
    const lines = formatRuleList(securityRules, toggled)
    const evalLine = lines.find((l) => l.includes('no-eval'))
    const unsafeLine = lines.find((l) => l.includes('no-unsafe'))
    expect(evalLine).toMatch(/^\[x\]/)
    expect(unsafeLine).toMatch(/^\[x\]/)
  })
})

describe('toggleCategorySelection — integration with formatRuleList', () => {
  test('select all then deselect all reflects in list', () => {
    const securityRules = sampleRules.filter((r) => r.category === 'security')
    const selected = toggleCategorySelection(sampleRules, 'security', new Set())
    const linesSelected = formatRuleList(securityRules, selected)
    for (const line of linesSelected) {
      expect(line).toMatch(/^\[x\]/)
    }
    const deselected = toggleCategorySelection(sampleRules, 'security', selected)
    const linesDeselected = formatRuleList(securityRules, deselected)
    for (const line of linesDeselected) {
      expect(line).toMatch(/^\[ \]/)
    }
  })
})

describe('buildConfigFromSelection — integration with formatConfigPreview', () => {
  test('build and preview config', () => {
    const selected = new Set(['no-eval', 'prefer-const', 'max-params'])
    const config = buildConfigFromSelection(selected, 'error', sampleRules)
    const lines = formatConfigPreview(config, sampleRules)
    expect(lines).toContain('Total rules enabled: 3')
    expect(lines).toContain('Errors: 3, Warnings: 0, Info: 0')
  })

  test('build with warning and preview', () => {
    const selected = new Set(['no-eval', 'prefer-const'])
    const config = buildConfigFromSelection(selected, 'warning', sampleRules)
    const lines = formatConfigPreview(config, sampleRules)
    expect(lines).toContain('Total rules enabled: 2')
    expect(lines).toContain('Errors: 0, Warnings: 2, Info: 0')
  })
})

describe('setCategorySeverity — integration with getSeveritiesForCategory', () => {
  test('set severity then verify counts', () => {
    const config = setCategorySeverity(sampleRules, 'security', 'error', {})
    const counts = getSeveritiesForCategory(config, sampleRules, 'security')
    expect(counts.error).toBe(3)
    expect(counts.warning).toBe(0)
    expect(counts.info).toBe(0)
  })

  test('set different severity per category', () => {
    let config = setCategorySeverity(sampleRules, 'security', 'error', {})
    config = setCategorySeverity(sampleRules, 'patterns', 'warning', config)
    const securityCounts = getSeveritiesForCategory(config, sampleRules, 'security')
    const patternCounts = getSeveritiesForCategory(config, sampleRules, 'patterns')
    expect(securityCounts.error).toBe(3)
    expect(patternCounts.warning).toBe(3)
  })
})

describe('edge cases — empty inputs', () => {
  test('getCategorySummaries with empty rules returns empty', () => {
    expect(getCategorySummaries([], new Set())).toEqual([])
  })

  test('formatCategoryMenu with empty categories returns header and done', () => {
    const lines = formatCategoryMenu([])
    expect(lines).toHaveLength(2)
  })

  test('formatRuleList with empty rules returns empty', () => {
    expect(formatRuleList([], new Set())).toEqual([])
  })

  test('formatConfigPreview with empty config shows zeros', () => {
    const lines = formatConfigPreview({}, [])
    expect(lines).toContain('Total rules enabled: 0')
    expect(lines).toContain('Errors: 0, Warnings: 0, Info: 0')
  })

  test('buildConfigFromSelection with empty set returns empty config', () => {
    const config = buildConfigFromSelection(new Set(), 'error', [])
    expect(Object.keys(config)).toHaveLength(0)
  })

  test('toggleRuleSelection with empty set and empty id', () => {
    const result = toggleRuleSelection('', new Set())
    expect(result.has('')).toBe(true)
    expect(result.size).toBe(1)
  })

  test('toggleCategorySelection with no matching rules returns copy', () => {
    const original = new Set(['r1'])
    const result = toggleCategorySelection([], 'security', original)
    expect(result.has('r1')).toBe(true)
  })
})

describe('immutability', () => {
  test('toggleRuleSelection does not mutate input set', () => {
    const original = new Set(['r1'])
    toggleRuleSelection('r2', original)
    expect(original.has('r2')).toBe(false)
    expect(original.size).toBe(1)
  })

  test('toggleCategorySelection does not mutate input set', () => {
    const original = new Set(['r1'])
    toggleCategorySelection(sampleRules, 'security', original)
    expect(original.size).toBe(1)
  })

  test('setRuleSeverity does not mutate input config', () => {
    const original: RuleEnvConfig = { r1: 'warning' }
    setRuleSeverity('r1', 'error', original)
    expect(original['r1']).toBe('warning')
  })

  test('setCategorySeverity does not mutate input config', () => {
    const original: RuleEnvConfig = { r1: 'warning' }
    setCategorySeverity(sampleRules, 'security', 'error', original)
    expect(original['r1']).toBe('warning')
  })
})

describe('formatProfileOptions — edge cases', () => {
  test('handles profile with only errors', () => {
    const profiles = [
      makeProfileOption({ errorCount: 100, warningCount: 0 }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines[1]).toBe('    100 errors, 0 warnings')
  })

  test('handles profile with only warnings', () => {
    const profiles = [
      makeProfileOption({ errorCount: 0, warningCount: 50 }),
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines[1]).toBe('    0 errors, 50 warnings')
  })
})

describe('formatCategoryMenu — edge cases', () => {
  test('many categories are numbered sequentially', () => {
    const cats: CategorySummary[] = []
    for (let i = 0; i < 10; i++) {
      cats.push(makeCategorySummary({ id: `cat-${i}` }))
    }
    const lines = formatCategoryMenu(cats)
    for (let i = 0; i < 10; i++) {
      expect(lines[i + 1]).toContain(`[${i + 1}]`)
    }
  })
})

describe('formatRuleList — edge cases', () => {
  test('rule with all fields set', () => {
    const rules = [
      makeRule({
        description: 'Full rule',
        fixable: true,
        id: 'full-rule',
        recommended: true,
      }),
    ]
    const lines = formatRuleList(rules, new Set(['full-rule']))
    expect(lines[0]).toBe('[x] full-rule (recommended) - Full rule \u{1F527}')
  })

  test('rule with minimal fields', () => {
    const rules = [
      makeRule({
        description: 'Minimal',
        fixable: false,
        id: 'min-rule',
        recommended: false,
      }),
    ]
    const lines = formatRuleList(rules, new Set())
    expect(lines[0]).toBe('[ ] min-rule - Minimal')
  })

  test('many rules all selected', () => {
    const rules: WizardRuleInfo[] = []
    for (let i = 0; i < 20; i++) {
      rules.push(makeRule({ id: `rule-${i}` }))
    }
    const selected = new Set(rules.map((r) => r.id))
    const lines = formatRuleList(rules, selected)
    expect(lines).toHaveLength(20)
    for (const line of lines) {
      expect(line).toMatch(/^\[x\]/)
    }
  })
})

describe('getProfileOptionsFromConfigs — descriptions', () => {
  test('lenient has correct description', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'lenient')?.description).toContain('critical')
  })

  test('moderate has correct description', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'moderate')?.description).toContain('Balanced')
  })

  test('strict has correct description', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options.find((o) => o.key === 'strict')?.description).toContain('Maximum')
  })
})

describe('toggleCategorySelection — partial selection', () => {
  test('selects all when some are selected', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
      makeRule({ category: 'security', id: 's3' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['s1']))
    expect(result.has('s1')).toBe(true)
    expect(result.has('s2')).toBe(true)
    expect(result.has('s3')).toBe(true)
    expect(result.size).toBe(3)
  })

  test('deselects all only when every rule is selected', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
    ]
    const result = toggleCategorySelection(rules, 'security', new Set(['s1', 's2']))
    expect(result.size).toBe(0)
  })
})

describe('formatConfigPreview — detailed output', () => {
  test('shows correct category breakdown with mixed categories', () => {
    const config: RuleEnvConfig = {
      'no-eval': 'error',
      'no-unsafe': 'warning',
      'prefer-const': 'error',
      'no-var': 'warning',
      'max-params': 'info',
    }
    const lines = formatConfigPreview(config, sampleRules)
    const output = lines.join('\n')
    expect(output).toContain('security: 2 rules')
    expect(output).toContain('patterns: 2 rules')
    expect(output).toContain('complexity: 1 rules')
    expect(output).toContain('Errors: 2, Warnings: 2, Info: 1')
  })

  test('does not show categories with zero rules', () => {
    const config: RuleEnvConfig = { 'no-eval': 'error' }
    const lines = formatConfigPreview(config, sampleRules)
    const output = lines.join('\n')
    expect(output).toContain('security: 1 rules')
    expect(output).not.toContain('patterns: 0 rules')
  })
})

describe('getSeveritiesForCategory — mixed config types', () => {
  test('handles mix of string and array severities', () => {
    const rules = [
      makeRule({ category: 'security', id: 'r1' }),
      makeRule({ category: 'security', id: 'r2' }),
    ]
    const config: RuleEnvConfig = {
      r1: 'error',
      r2: ['warning', { max: 5 }] as unknown as RuleEnvConfig[string],
    }
    const result = getSeveritiesForCategory(config, rules, 'security')
    expect(result.error).toBe(1)
    expect(result.warning).toBe(1)
  })
})

describe('setRuleSeverity — overriding', () => {
  test('can change from error to warning', () => {
    const config: RuleEnvConfig = { 'my-rule': 'error' }
    const result = setRuleSeverity('my-rule', 'warning', config)
    expect(result['my-rule']).toBe('warning')
  })

  test('can change from warning to info', () => {
    const config: RuleEnvConfig = { 'my-rule': 'warning' }
    const result = setRuleSeverity('my-rule', 'info', config)
    expect(result['my-rule']).toBe('info')
  })

  test('can change from info to error', () => {
    const config: RuleEnvConfig = { 'my-rule': 'info' }
    const result = setRuleSeverity('my-rule', 'error', config)
    expect(result['my-rule']).toBe('error')
  })
})

describe('setCategorySeverity — with existing config', () => {
  test('overrides existing severity for category rules', () => {
    const rules = [
      makeRule({ category: 'security', id: 's1' }),
      makeRule({ category: 'security', id: 's2' }),
    ]
    const config: RuleEnvConfig = { s1: 'warning', s2: 'info' }
    const result = setCategorySeverity(rules, 'security', 'error', config)
    expect(result['s1']).toBe('error')
    expect(result['s2']).toBe('error')
  })
})

describe('buildConfigFromSelection — severity variations', () => {
  test('error severity applied to all', () => {
    const selected = new Set(['r1', 'r2', 'r3'])
    const config = buildConfigFromSelection(selected, 'error', sampleRules)
    for (const v of Object.values(config)) {
      expect(v).toBe('error')
    }
  })

  test('warning severity applied to all', () => {
    const selected = new Set(['r1', 'r2'])
    const config = buildConfigFromSelection(selected, 'warning', sampleRules)
    for (const v of Object.values(config)) {
      expect(v).toBe('warning')
    }
  })

  test('info severity applied to all', () => {
    const selected = new Set(['r1'])
    const config = buildConfigFromSelection(selected, 'info', sampleRules)
    for (const v of Object.values(config)) {
      expect(v).toBe('info')
    }
  })
})

describe('getProfileOptionsFromConfigs — custom option', () => {
  test('custom option is always last', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const options = getProfileOptionsFromConfigs(configs)
    expect(options[options.length - 1].key).toBe('custom')
  })

  test('custom option has zero counts', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'error' },
      moderate: { r1: 'error' },
      strict: { r1: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    const custom = options[options.length - 1]
    expect(custom.errorCount).toBe(0)
    expect(custom.warningCount).toBe(0)
  })
})

describe('full wizard flow simulation', () => {
  test('select profile, customize, build config, preview', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: {},
      moderate: {},
      strict: {},
    }
    const profileOptions = getProfileOptionsFromConfigs(configs)
    expect(profileOptions).toHaveLength(4)

    const selected = new Set<string>()
    const afterToggle1 = toggleRuleSelection('no-eval', selected)
    const afterToggle2 = toggleRuleSelection('prefer-const', afterToggle1)
    const afterCategoryToggle = toggleCategorySelection(sampleRules, 'complexity', afterToggle2)

    const config = buildConfigFromSelection(afterCategoryToggle, 'error', sampleRules)
    expect(config['no-eval']).toBe('error')
    expect(config['prefer-const']).toBe('error')
    expect(config['max-params']).toBe('error')
    expect(config['max-depth']).toBe('error')

    const preview = formatConfigPreview(config, sampleRules)
    expect(preview[0]).toBe('Configuration Preview:')
    expect(preview).toContain(`Total rules enabled: ${afterCategoryToggle.size}`)
  })

  test('profile selection and preview integration', () => {
    const configs: Record<SeverityProfile, RuleEnvConfig> = {
      lenient: { r1: 'warning', r2: 'info' },
      moderate: { r1: 'error', r2: 'warning' },
      strict: { r1: 'error', r2: 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs)
    const formatted = formatProfileOptions(options)

    expect(formatted.length).toBe(8)
    expect(formatted[0]).toContain('[lenient]')
    expect(formatted[1]).toContain('0 errors, 1 warnings')

    const strictConfig = configs['strict']
    const rules = [makeRule({ id: 'r1', category: 'security' }), makeRule({ id: 'r2', category: 'patterns' })]
    const preview = formatConfigPreview(strictConfig, rules)
    expect(preview).toContain('Total rules enabled: 2')
    expect(preview).toContain('Errors: 2, Warnings: 0, Info: 0')
  })
})
