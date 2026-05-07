import type { RuleEnvConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'
import type { SeverityProfile } from '../profiles/index.js'

export interface WizardRuleInfo {
  category: string
  description: string
  fixable: boolean
  id: string
  recommended: boolean
}

export interface ProfileOption {
  description: string
  errorCount: number
  key: string
  label: string
  warningCount: number
}

export interface CategorySummary {
  id: string
  recommendedCount: number
  ruleCount: number
  selectedCount: number
}

export function formatProfileOptions(profiles: ProfileOption[]): string[] {
  const lines: string[] = []

  for (const profile of profiles) {
    lines.push(
      `[${profile.key}] ${profile.label} - ${profile.description}`,
    )
    lines.push(
      `    ${profile.errorCount} errors, ${profile.warningCount} warnings`,
    )
  }

  return lines
}

export function getCategorySummaries(
  rules: WizardRuleInfo[],
  selectedRules: Set<string>,
): CategorySummary[] {
  const categoryMap = new Map<
    string,
    { recommended: number; selected: number; total: number }
  >()

  for (const rule of rules) {
    const existing = categoryMap.get(rule.category) ?? {
      recommended: 0,
      selected: 0,
      total: 0,
    }
    existing.total++
    if (rule.recommended) existing.recommended++
    if (selectedRules.has(rule.id)) existing.selected++
    categoryMap.set(rule.category, existing)
  }

  return Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, counts]) => ({
      id,
      recommendedCount: counts.recommended,
      ruleCount: counts.total,
      selectedCount: counts.selected,
    }))
}

export function formatCategoryMenu(categories: CategorySummary[]): string[] {
  const lines: string[] = ['Select a category to configure:']

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]!
    lines.push(
      `[${i + 1}] ${cat.id} (${cat.ruleCount} rules, ${cat.recommendedCount} recommended, ${cat.selectedCount} selected)`,
    )
  }

  lines.push('[0] Done - preview configuration')

  return lines
}

export function formatRuleList(
  rules: WizardRuleInfo[],
  selectedRules: Set<string>,
): string[] {
  const lines: string[] = []

  for (const rule of rules) {
    const selected = selectedRules.has(rule.id)
    const check = selected ? 'x' : ' '
    const recommended = rule.recommended ? ' (recommended)' : ''
    const fixable = rule.fixable ? ' \u{1F527}' : ''
    lines.push(
      `[${check}] ${rule.id}${recommended} - ${rule.description}${fixable}`,
    )
  }

  return lines
}

export function toggleRuleSelection(
  ruleId: string,
  selected: Set<string>,
): Set<string> {
  const next = new Set(selected)
  if (next.has(ruleId)) {
    next.delete(ruleId)
  } else {
    next.add(ruleId)
  }
  return next
}

export function toggleCategorySelection(
  rules: WizardRuleInfo[],
  category: string,
  selected: Set<string>,
): Set<string> {
  const categoryRules = rules.filter((r) => r.category === category)
  const allSelected = categoryRules.every((r) => selected.has(r.id))

  const next = new Set(selected)
  for (const rule of categoryRules) {
    if (allSelected) {
      next.delete(rule.id)
    } else {
      next.add(rule.id)
    }
  }
  return next
}

export function setRuleSeverity(
  ruleId: string,
  severity: RuleSeverity,
  config: RuleEnvConfig,
): RuleEnvConfig {
  return { ...config, [ruleId]: severity }
}

export function setCategorySeverity(
  rules: WizardRuleInfo[],
  category: string,
  severity: RuleSeverity,
  config: RuleEnvConfig,
): RuleEnvConfig {
  const next = { ...config }
  for (const rule of rules) {
    if (rule.category === category) {
      next[rule.id] = severity
    }
  }
  return next
}

export function buildConfigFromSelection(
  selectedRules: Set<string>,
  severity: RuleSeverity,
  _allRules: WizardRuleInfo[],
): RuleEnvConfig {
  const config: RuleEnvConfig = {}
  for (const ruleId of selectedRules) {
    config[ruleId] = severity
  }
  return config
}

export function formatConfigPreview(
  config: RuleEnvConfig,
  allRules: WizardRuleInfo[],
): string[] {
  const lines: string[] = ['Configuration Preview:', '=====================']

  const entries = Object.entries(config)
  lines.push(`Total rules enabled: ${entries.length}`)

  let errors = 0
  let warnings = 0
  let infos = 0
  for (const value of Object.values(config)) {
    const sev: RuleSeverity = Array.isArray(value) ? value[0] : value
    if (sev === 'error') errors++
    else if (sev === 'warning') warnings++
    else if (sev === 'info') infos++
  }
  lines.push(`Errors: ${errors}, Warnings: ${warnings}, Info: ${infos}`)

  const ruleMap = new Map(allRules.map((r) => [r.id, r]))
  const categoryCounts = new Map<string, number>()
  for (const ruleId of Object.keys(config)) {
    const rule = ruleMap.get(ruleId)
    const category = rule?.category ?? 'unknown'
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
  }

  lines.push('', 'By Category:')
  for (const [category, count] of Array.from(categoryCounts.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`  ${category}: ${count} rules`)
  }

  return lines
}

export function getSeveritiesForCategory(
  config: RuleEnvConfig,
  rules: WizardRuleInfo[],
  category: string,
): Record<RuleSeverity, number> {
  const counts: Record<RuleSeverity, number> = { error: 0, info: 0, warning: 0 }
  const categoryRuleIds = new Set(
    rules.filter((r) => r.category === category).map((r) => r.id),
  )

  for (const [ruleId, value] of Object.entries(config)) {
    if (!categoryRuleIds.has(ruleId)) continue
    const sev: RuleSeverity = Array.isArray(value) ? value[0] : value
    if (sev in counts) counts[sev]++
  }

  return counts
}

export function getProfileOptionsFromConfigs(
  profileConfigs: Record<SeverityProfile, RuleEnvConfig>,
): ProfileOption[] {
  const options: ProfileOption[] = []

  for (const [key, config] of Object.entries(profileConfigs)) {
    let errorCount = 0
    let warningCount = 0
    for (const value of Object.values(config)) {
      const sev: RuleSeverity = Array.isArray(value) ? value[0] : value
      if (sev === 'error') errorCount++
      else if (sev === 'warning') warningCount++
    }

    const descriptions: Record<string, string> = {
      lenient: 'Only critical security and correctness errors. Low noise.',
      moderate:
        'Recommended rules + security/correctness as errors. Balanced.',
      strict: 'All rules as errors. Maximum enforcement.',
    }

    options.push({
      description: descriptions[key] ?? '',
      errorCount,
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      warningCount,
    })
  }

  options.push({
    description: 'Choose rules yourself',
    errorCount: 0,
    key: 'custom',
    label: 'Custom',
    warningCount: 0,
  })

  return options
}
