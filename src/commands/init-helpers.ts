import chalk from 'chalk'
import { join } from 'node:path'

import type { CodeForgeConfig } from '../config/types.js'
import type { RuleDefinition, RuleSeverity } from '../rules/types.js'

import { DEFAULT_CONFIG } from '../config/types.js'
import { getProfileConfig, PROFILE_DESCRIPTIONS, type SeverityProfile } from '../profiles/index.js'

export interface InitOptions {
  dir: string
  force: boolean
  format: 'js' | 'json'
  interactive: boolean
  minimal: boolean
  profile: SeverityProfile | undefined
  typescript: boolean
}

export interface RuleInfo {
  category: string
  description: string
  id: string
  recommended: boolean
}

export function resolveConfigFileName(format: 'js' | 'json'): string {
  return format === 'js' ? 'codeforge.config.js' : '.codeforgerc.json'
}

export function generateJsonContent(config: CodeForgeConfig): string {
  return JSON.stringify(config, null, 2)
}

export function generateJsContent(config: CodeForgeConfig): string {
  return `/** @type {import('codeforge').CodeForgeConfig} */
export default ${JSON.stringify(config, null, 2)};
`
}

export function getRuleInfos(
  loadedRules: Record<string, RuleDefinition>,
  getRuleCategoryFn: (ruleId: string) => string,
): RuleInfo[] {
  return Object.entries(loadedRules).map(([id, def]) => ({
    category: getRuleCategoryFn(id),
    description: (def as RuleDefinition).meta.description,
    id,
    recommended: (def as RuleDefinition).meta.recommended,
  }))
}

// eslint-disable-next-line max-params
export function generateConfig(
  options: InitOptions,
  loadedRules: Record<string, RuleDefinition>,
  selectedRules: string[] | undefined,
  getRuleCategoryFn: (ruleId: string) => string,
  logFn: (msg: string) => void,
): CodeForgeConfig {
  const config: CodeForgeConfig = {
    files: options.typescript
      ? ['**/*.ts', '**/*.tsx']
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignore: [...DEFAULT_CONFIG.ignore!],
  }

  if (options.minimal && !options.profile) {
    return config
  }

  const rules: Record<string, RuleSeverity> = {}

  if (options.profile) {
    const profileConfig = getProfileConfig(
      options.profile,
      loadedRules,
      getRuleCategoryFn,
      (id) => (loadedRules[id] as RuleDefinition | undefined)?.meta.recommended ?? false,
    )
    for (const [ruleId, sev] of Object.entries(profileConfig)) {
      rules[ruleId] = Array.isArray(sev) ? sev[0] : sev
    }

    logFn(chalk.cyan(`Using ${options.profile} profile: ${PROFILE_DESCRIPTIONS[options.profile]}`))
  } else if (selectedRules === undefined) {
    for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
      if ((ruleDef as RuleDefinition).meta.recommended) {
        rules[ruleId] = 'error'
      }
    }
  } else {
    for (const ruleId of selectedRules) {
      rules[ruleId] = 'error'
    }
  }

  if (Object.keys(rules).length > 0) {
    config.rules = rules as Record<string, [RuleSeverity, never] | RuleSeverity>
  }

  return config
}

export function filterValidRules(
  input: string,
  validRuleIds: string[],
): { invalid: string[]; valid: string[] } {
  const selected = input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)

  const validRulesSet = new Set(validRuleIds.map((id) => id.toLowerCase()))
  const valid = selected.filter((s) => validRulesSet.has(s))
  const invalid = selected.filter((s) => !validRulesSet.has(s))

  return { invalid, valid }
}

export function detectExistingConfig(
  configDir: string,
  configFiles: readonly string[],
  existsFn: (filePath: string) => boolean,
): null | string {
  for (const fileName of configFiles) {
    const filePath = join(configDir, fileName)
    if (existsFn(filePath)) {
      return filePath
    }
  }

  return null
}

export function displayConfigSummary(
  config: CodeForgeConfig,
  configFileName: string,
  configDir: string,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.green(`✓ Created ${configFileName} in ${configDir}`))
  logFn('')
  logFn(chalk.bold('Configuration:'))
  logFn(chalk.gray(`  Files: ${(config.files ?? []).join(', ')}`))
  logFn(chalk.gray(`  Ignore: ${(config.ignore ?? []).join(', ')}`))

  if (config.rules && Object.keys(config.rules).length > 0) {
    logFn(chalk.gray(`  Rules: ${Object.keys(config.rules).length} enabled`))
  }

  logFn('')
  logFn(chalk.bold('Next steps:'))
  logFn(chalk.gray('  1. Review and customize the configuration'))
  logFn(chalk.gray('  2. Run `codeforge analyze` to check your code'))
  logFn(chalk.gray('  3. Use `codeforge rules` to see all available rules'))
}

export function displayRuleList(rules: RuleInfo[], logFn: (msg: string) => void): void {
  const categories = [...new Set(rules.map((r) => r.category))]

  logFn('')
  logFn(chalk.bold('Select rules to enable:'))
  logFn(chalk.gray('Enter rule numbers separated by commas, or "all" for recommended rules'))
  logFn(chalk.gray('Press Enter to skip (no rules selected)'))
  logFn('')

  for (const category of categories.sort()) {
    logFn(chalk.cyan(`\n[${category.toUpperCase()}]`))
    const categoryRules = rules.filter((r) => r.category === category)
    for (const rule of categoryRules) {
      const recommended = rule.recommended ? chalk.green(' (recommended)') : ''
      logFn(chalk.gray(`  ${rule.id}${recommended}`))
      logFn(chalk.gray(`    ${rule.description}`))
    }
  }

  logFn('')
}

export { CONFIG_FILE_NAMES } from '../config/types.js'
