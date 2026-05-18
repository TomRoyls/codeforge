import chalk from 'chalk'

import { colorizeSeverity } from '../utils/formatting.js'
import { clamp } from '../utils/math-helpers.js'



export type OutputFormat = 'json' | 'table' | 'tree'

export interface RuleInfo {
  category: string
  description: string
  fixable: boolean
  name: string
  recommended: boolean
  severity: string
}

export function mapRulesToInfo(
  loadedRules: Record<
    string,
    {
      fix?: unknown
      meta: {
        category?: string
        description: string
        fixable?: 'code' | 'whitespace'
        recommended?: boolean
        severity?: string
      }
    }
  >,
  getRuleCategoryFn: (ruleId: string) => string,
): RuleInfo[] {
  const rules: RuleInfo[] = []

  for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
    const isFixable = Boolean(ruleDef.fix || ruleDef.meta.fixable)
    rules.push({
      category: ruleDef.meta.category ?? getRuleCategoryFn(ruleId),
      description: ruleDef.meta.description,
      fixable: isFixable,
      name: ruleId,
      recommended: ruleDef.meta.recommended ?? false,
      severity: ruleDef.meta.severity ?? 'info',
    })
  }

  return rules.sort((a, b) => a.name.localeCompare(b.name))
}

export function filterRules(
  rules: RuleInfo[],
  filters: {
    category?: string
    fixable?: boolean
    search?: string
    severity?: string
  },
): RuleInfo[] {
  let result = rules

  if (filters.category) {
    result = result.filter((r) => r.category === filters.category)
  }

  if (filters.fixable) {
    result = result.filter((r) => r.fixable)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter((r) => r.description.toLowerCase().includes(searchLower))
  }

  if (filters.severity) {
    result = result.filter((r) => r.severity === filters.severity)
  }

  return result
}

export function formatTable(rules: RuleInfo[], logFn: (msg: string) => void): void {
  let maxNameLen = 0
  let maxCatLen = 0
  let maxDescLen = 0
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]!
    if (r.name.length > maxNameLen) maxNameLen = r.name.length
    if (r.category.length > maxCatLen) maxCatLen = r.category.length
    if (r.description.length > maxDescLen) maxDescLen = r.description.length
  }
  const nameWidth = Math.max(25, maxNameLen)
  const categoryWidth = Math.max(12, maxCatLen)
    const descWidth = clamp(maxDescLen, 20, 60)
  const severityWidth = 9
  const fixableWidth = 8

  const separator = '─'.repeat(
    nameWidth + categoryWidth + severityWidth + descWidth + fixableWidth + 16,
  )
  logFn(chalk.gray(`\u250C${separator}\u2510`))
  logFn(
    chalk.gray('\u2502') +
      chalk.bold(' Rule'.padEnd(nameWidth + 1)) +
      chalk.gray('\u2502') +
      chalk.bold(' Category'.padEnd(categoryWidth + 1)) +
      chalk.gray('\u2502') +
      chalk.bold(' Severity'.padEnd(severityWidth + 1)) +
      chalk.gray('\u2502') +
      chalk.bold(' Description'.padEnd(descWidth + 1)) +
      chalk.gray('\u2502') +
      chalk.bold(' Fixable') +
      chalk.gray(' \u2502'),
  )
  logFn(chalk.gray(`\u251C${separator}\u2510`))

  for (const rule of rules) {
    const fixable = rule.fixable ? chalk.green('\u2713') : chalk.gray('\u2717')
    const recommended = rule.recommended ? chalk.cyan('\u2605') : ' '
    const sev = colorizeSeverity(rule.severity)
    const desc =
      rule.description.length > descWidth - 2
        ? rule.description.slice(0, descWidth - 5) + '...'
        : rule.description

    logFn(
      chalk.gray('\u2502') +
        ` ${recommended}${rule.name}`.slice(0, nameWidth).padEnd(nameWidth + 1) +
        chalk.gray('\u2502') +
        ` ${rule.category}`.padEnd(categoryWidth + 1) +
        chalk.gray('\u2502') +
        ` ${sev}`.padEnd(severityWidth + 1) +
        chalk.gray('\u2502') +
        ` ${desc}`.padEnd(descWidth + 1) +
        chalk.gray('\u2502') +
        ` ${fixable}    ` +
        chalk.gray(' \u2502'),
    )
  }

  logFn(chalk.gray(`\u2514${separator}\u2518`))
  logFn('')
  logFn(chalk.gray(`Total: ${rules.length} rules`))
  logFn(chalk.gray(`★ = recommended, ✓ = fixable`))
}

export function formatTree(rules: RuleInfo[], logFn: (msg: string) => void): void {
  const byCategory = new Map<string, RuleInfo[]>()
  for (const rule of rules) {
    const cat = rule.category
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(rule)
  }

  const categories = [...byCategory.keys()].sort()
  logFn(chalk.bold('CodeForge Rules'))
  logFn('')

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]!
    const catRules = byCategory.get(cat)!
    const isLastCategory = i === categories.length - 1
    const prefix = isLastCategory ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 '
    const childPrefix = isLastCategory ? '   ' : '\u2502  '

    logFn(prefix + chalk.bold.cyan(cat) + chalk.gray(` (${catRules.length})`))

    for (let j = 0; j < catRules.length; j++) {
      const rule = catRules[j]!
      const isLastRule = j === catRules.length - 1
      const rulePrefix = isLastRule ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 '
      const sev = colorizeSeverity(rule.severity)
      const badges: string[] = []
      if (rule.recommended) badges.push(chalk.cyan('\u2605'))
      if (rule.fixable) badges.push(chalk.green('\u2713'))

      const badgeStr = badges.length > 0 ? ` ${badges.join(' ')}` : ''
      logFn(
        childPrefix +
          rulePrefix +
          chalk.white(rule.name) +
          badgeStr +
          chalk.gray(` [${sev}]`) +
          chalk.gray(` - ${rule.description}`),
      )
    }

    if (!isLastCategory) logFn(childPrefix)
  }

  logFn('')
  const total = rules.length
  const recommended = rules.filter((r) => r.recommended).length
  const fixable = rules.filter((r) => r.fixable).length
  logFn(
    chalk.gray(
      `Total: ${total} rules \u2502 \u2605 ${recommended} recommended \u2502 \u2713 ${fixable} fixable`,
    ),
  )
}

export {colorizeSeverity} from '../utils/formatting.js'