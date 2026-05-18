import { describe, it, expect } from 'vitest'
import {
  formatProfileOptions,
  getCategorySummaries,
  formatCategoryMenu,
  formatRuleList,
  toggleRuleSelection,
  toggleCategorySelection,
  setRuleSeverity,
  setCategorySeverity,
  buildConfigFromSelection,
  formatConfigPreview,
  getSeveritiesForCategory,
  getProfileOptionsFromConfigs,
} from '../src/commands/init-wizard-helpers.js'

import type { WizardRuleInfo, CategorySummary, ProfileOption } from '../src/commands/init-wizard-helpers.js'

const sampleRules: WizardRuleInfo[] = [
  { category: 'security', description: 'No eval', fixable: true, id: 'no-eval', recommended: true },
  { category: 'security', description: 'No unsafe', fixable: false, id: 'no-unsafe', recommended: false },
  { category: 'style', description: 'Prefer const', fixable: true, id: 'prefer-const', recommended: true },
  { category: 'complexity', description: 'Max params', fixable: false, id: 'max-params', recommended: false },
]

// ─── formatProfileOptions ──────────────────────────────
describe('formatProfileOptions', () => {
  it('formats each profile', () => {
    const profiles: ProfileOption[] = [
      { description: 'Only critical', errorCount: 5, key: 'lenient', label: 'Lenient', warningCount: 2 },
      { description: 'Balanced', errorCount: 10, key: 'moderate', label: 'Moderate', warningCount: 8 },
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines.some((l) => l.includes('[lenient]'))).toBe(true)
    expect(lines.some((l) => l.includes('[moderate]'))).toBe(true)
    expect(lines.some((l) => l.includes('5 errors'))).toBe(true)
    expect(lines.some((l) => l.includes('8 warnings'))).toBe(true)
  })

  it('includes description per profile', () => {
    const profiles: ProfileOption[] = [
      { description: 'Only critical', errorCount: 0, key: 'lenient', label: 'Lenient', warningCount: 0 },
    ]
    const lines = formatProfileOptions(profiles)
    expect(lines.some((l) => l.includes('Only critical'))).toBe(true)
  })
})

// ─── getCategorySummaries ──────────────────────────────
describe('getCategorySummaries', () => {
  it('groups rules by category', () => {
    const summaries = getCategorySummaries(sampleRules, new Set())
    expect(summaries).toHaveLength(3)
    const security = summaries.find((s) => s.id === 'security')
    expect(security?.ruleCount).toBe(2)
    expect(security?.recommendedCount).toBe(1)
  })

  it('counts selected rules', () => {
    const selected = new Set(['no-eval', 'prefer-const'])
    const summaries = getCategorySummaries(sampleRules, selected)
    const security = summaries.find((s) => s.id === 'security')
    expect(security?.selectedCount).toBe(1)
    const style = summaries.find((s) => s.id === 'style')
    expect(style?.selectedCount).toBe(1)
  })

  it('sorts categories alphabetically', () => {
    const summaries = getCategorySummaries(sampleRules, new Set())
    const ids = summaries.map((s) => s.id)
    expect(ids).toEqual([...ids].sort())
  })

  it('handles empty rules', () => {
    expect(getCategorySummaries([], new Set())).toEqual([])
  })
})

// ─── formatCategoryMenu ────────────────────────────────
describe('formatCategoryMenu', () => {
  it('includes category selection header', () => {
    const lines = formatCategoryMenu([])
    expect(lines[0]).toContain('Select a category')
  })

  it('numbers categories starting from 1', () => {
    const cats: CategorySummary[] = [
      { id: 'security', recommendedCount: 1, ruleCount: 2, selectedCount: 0 },
      { id: 'style', recommendedCount: 1, ruleCount: 1, selectedCount: 1 },
    ]
    const lines = formatCategoryMenu(cats)
    expect(lines.some((l) => l.includes('[1] security'))).toBe(true)
    expect(lines.some((l) => l.includes('[2] style'))).toBe(true)
  })

  it('includes done option at [0]', () => {
    const lines = formatCategoryMenu([])
    expect(lines.some((l) => l.includes('[0] Done'))).toBe(true)
  })

  it('shows rule counts per category', () => {
    const cats: CategorySummary[] = [
      { id: 'security', recommendedCount: 2, ruleCount: 5, selectedCount: 3 },
    ]
    const lines = formatCategoryMenu(cats)
    expect(lines.some((l) => l.includes('5 rules'))).toBe(true)
    expect(lines.some((l) => l.includes('2 recommended'))).toBe(true)
    expect(lines.some((l) => l.includes('3 selected'))).toBe(true)
  })
})

// ─── formatRuleList ────────────────────────────────────
describe('formatRuleList', () => {
  it('shows unchecked for unselected rules', () => {
    const lines = formatRuleList(sampleRules, new Set())
    expect(lines.some((l) => l.includes('[ ] no-eval'))).toBe(true)
  })

  it('shows checked for selected rules', () => {
    const lines = formatRuleList(sampleRules, new Set(['no-eval']))
    expect(lines.some((l) => l.includes('[x] no-eval'))).toBe(true)
  })

  it('shows recommended tag', () => {
    const lines = formatRuleList(sampleRules, new Set())
    expect(lines.some((l) => l.includes('(recommended)'))).toBe(true)
  })

  it('shows fixable wrench for fixable rules', () => {
    const lines = formatRuleList(sampleRules, new Set())
    expect(lines.some((l) => l.includes('🔧'))).toBe(true)
  })

  it('shows rule descriptions', () => {
    const lines = formatRuleList(sampleRules, new Set())
    expect(lines.some((l) => l.includes('No eval'))).toBe(true)
  })
})

// ─── toggleRuleSelection ───────────────────────────────
describe('toggleRuleSelection', () => {
  it('adds rule to selection', () => {
    const result = toggleRuleSelection('no-eval', new Set())
    expect(result.has('no-eval')).toBe(true)
  })

  it('removes rule from selection', () => {
    const result = toggleRuleSelection('no-eval', new Set(['no-eval']))
    expect(result.has('no-eval')).toBe(false)
  })

  it('does not mutate original set', () => {
    const original = new Set(['no-eval'])
    toggleRuleSelection('prefer-const', original)
    expect(original.has('prefer-const')).toBe(false)
  })
})

// ─── toggleCategorySelection ───────────────────────────
describe('toggleCategorySelection', () => {
  it('selects all rules in category when some are unselected', () => {
    const result = toggleCategorySelection(sampleRules, 'security', new Set(['no-eval']))
    expect(result.has('no-eval')).toBe(true)
    expect(result.has('no-unsafe')).toBe(true)
  })

  it('deselects all rules in category when all are selected', () => {
    const result = toggleCategorySelection(
      sampleRules,
      'security',
      new Set(['no-eval', 'no-unsafe']),
    )
    expect(result.has('no-eval')).toBe(false)
    expect(result.has('no-unsafe')).toBe(false)
  })

  it('selects all rules in empty category', () => {
    const result = toggleCategorySelection(sampleRules, 'security', new Set())
    expect(result.has('no-eval')).toBe(true)
    expect(result.has('no-unsafe')).toBe(true)
  })

  it('does not affect rules in other categories', () => {
    const result = toggleCategorySelection(
      sampleRules,
      'security',
      new Set(['prefer-const']),
    )
    expect(result.has('prefer-const')).toBe(true)
  })

  it('does not mutate original set', () => {
    const original = new Set<string>()
    toggleCategorySelection(sampleRules, 'security', original)
    expect(original.size).toBe(0)
  })
})

// ─── setRuleSeverity ───────────────────────────────────
describe('setRuleSeverity', () => {
  it('sets severity for a rule', () => {
    const result = setRuleSeverity('no-eval', 'error', {})
    expect(result['no-eval']).toBe('error')
  })

  it('overwrites existing severity', () => {
    const result = setRuleSeverity('no-eval', 'warning', { 'no-eval': 'error' })
    expect(result['no-eval']).toBe('warning')
  })

  it('preserves other rules', () => {
    const result = setRuleSeverity('no-eval', 'error', { 'prefer-const': 'warning' })
    expect(result['prefer-const']).toBe('warning')
  })
})

// ─── setCategorySeverity ───────────────────────────────
describe('setCategorySeverity', () => {
  it('sets severity for all rules in category', () => {
    const result = setCategorySeverity(sampleRules, 'security', 'error', {})
    expect(result['no-eval']).toBe('error')
    expect(result['no-unsafe']).toBe('error')
  })

  it('does not affect rules in other categories', () => {
    const result = setCategorySeverity(sampleRules, 'security', 'error', {})
    expect(result['prefer-const']).toBeUndefined()
  })

  it('preserves existing entries for other categories', () => {
    const result = setCategorySeverity(sampleRules, 'security', 'error', { 'prefer-const': 'warning' })
    expect(result['prefer-const']).toBe('warning')
  })
})

// ─── buildConfigFromSelection ──────────────────────────
describe('buildConfigFromSelection', () => {
  it('creates config from selected rules', () => {
    const config = buildConfigFromSelection(new Set(['no-eval', 'prefer-const']), 'error', sampleRules)
    expect(Object.keys(config)).toHaveLength(2)
    expect(config['no-eval']).toBe('error')
    expect(config['prefer-const']).toBe('error')
  })

  it('returns empty config for empty selection', () => {
    const config = buildConfigFromSelection(new Set(), 'error', sampleRules)
    expect(Object.keys(config)).toHaveLength(0)
  })
})

// ─── formatConfigPreview ───────────────────────────────
describe('formatConfigPreview', () => {
  it('includes preview header', () => {
    const lines = formatConfigPreview({ 'no-eval': 'error' }, sampleRules)
    expect(lines.some((l) => l.includes('Configuration Preview'))).toBe(true)
  })

  it('shows total rules count', () => {
    const lines = formatConfigPreview({ 'no-eval': 'error', 'prefer-const': 'warning' }, sampleRules)
    expect(lines.some((l) => l.includes('Total rules enabled: 2'))).toBe(true)
  })

  it('counts errors and warnings', () => {
    const lines = formatConfigPreview({ 'no-eval': 'error', 'prefer-const': 'warning' }, sampleRules)
    expect(lines.some((l) => l.includes('Errors: 1'))).toBe(true)
    expect(lines.some((l) => l.includes('Warnings: 1'))).toBe(true)
  })

  it('shows category breakdown', () => {
    const lines = formatConfigPreview({ 'no-eval': 'error' }, sampleRules)
    expect(lines.some((l) => l.includes('By Category'))).toBe(true)
    expect(lines.some((l) => l.includes('security: 1'))).toBe(true)
  })
})

// ─── getSeveritiesForCategory ──────────────────────────
describe('getSeveritiesForCategory', () => {
  it('counts severities per category', () => {
    const config = { 'no-eval': 'error', 'no-unsafe': 'warning' }
    const result = getSeveritiesForCategory(config, sampleRules, 'security')
    expect(result.error).toBe(1)
    expect(result.warning).toBe(1)
    expect(result.info).toBe(0)
  })

  it('excludes rules not in category', () => {
    const config = { 'no-eval': 'error', 'prefer-const': 'error' }
    const result = getSeveritiesForCategory(config, sampleRules, 'security')
    expect(result.error).toBe(1)
  })

  it('returns zeros for empty config', () => {
    const result = getSeveritiesForCategory({}, sampleRules, 'security')
    expect(result).toEqual({ error: 0, info: 0, warning: 0 })
  })

  it('handles array severity values', () => {
    const config = { 'no-eval': ['error', {}] as [unknown, unknown] }
    const result = getSeveritiesForCategory(config, sampleRules, 'security')
    expect(result.error).toBe(1)
  })
})

// ─── getProfileOptionsFromConfigs ──────────────────────
describe('getProfileOptionsFromConfigs', () => {
  it('creates options from profile configs', () => {
    const configs = {
      lenient: { 'no-eval': 'warning' },
      moderate: { 'no-eval': 'error', 'prefer-const': 'warning' },
      strict: { 'no-eval': 'error', 'prefer-const': 'error' },
    }
    const options = getProfileOptionsFromConfigs(configs as never)
    expect(options).toHaveLength(4) // 3 profiles + custom
    expect(options[0]!.key).toBe('lenient')
    expect(options[0]!.warningCount).toBe(1)
    expect(options[2]!.errorCount).toBe(2)
  })

  it('includes custom option', () => {
    const options = getProfileOptionsFromConfigs({} as never)
    const custom = options.find((o) => o.key === 'custom')
    expect(custom).toBeDefined()
    expect(custom?.label).toBe('Custom')
    expect(custom?.errorCount).toBe(0)
    expect(custom?.warningCount).toBe(0)
  })

  it('capitalizes profile labels', () => {
    const configs = { lenient: {}, moderate: {}, strict: {} }
    const options = getProfileOptionsFromConfigs(configs as never)
    expect(options[0]!.label).toBe('Lenient')
    expect(options[1]!.label).toBe('Moderate')
    expect(options[2]!.label).toBe('Strict')
  })
})
