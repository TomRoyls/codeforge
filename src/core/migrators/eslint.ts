import type { RuleSeverity } from '../../rules/types.js'

/**
 * ESLint rule to CodeForge rule mapping
 */
const ESLINT_TO_CODEFORGE_RULES: Record<string, string> = {
  // TypeScript rules
  '@typescript-eslint/no-explicit-any': 'no-unsafe-type-assertion',
  '@typescript-eslint/no-unsafe-assignment': 'no-unsafe-type-assertion',
  '@typescript-eslint/no-unsafe-member-access': 'no-unsafe-type-assertion',
  '@typescript-eslint/no-unsafe-call': 'no-unsafe-type-assertion',
  '@typescript-eslint/no-unsafe-return': 'no-unsafe-type-assertion',

  // Complexity rules
  complexity: 'max-complexity',
  'max-depth': 'max-depth',
  'max-lines': 'max-lines',
  'max-lines-per-function': 'max-lines-per-function',
  'max-params': 'max-params',

  // Performance rules
  'no-await-in-loop': 'no-await-in-loop',
  'no-sync-in-async': 'no-sync-in-async',
  'prefer-object-spread': 'prefer-object-spread',
  'prefer-optional-chaining': 'prefer-optional-chain',

  // Pattern rules
  'prefer-const': 'prefer-const',

  // Security rules
  'no-eval': 'no-eval',
  'no-implied-eval': 'no-eval',
  'no-new-func': 'no-eval',
}

/**
 * Convert ESLint severity to CodeForge severity
 */
function convertSeverity(severity: unknown): RuleSeverity | null {
  if (Array.isArray(severity)) {
    return convertSeverity(severity[0])
  }

  if (typeof severity === 'number') {
    if (severity === 2) return 'error'
    if (severity === 1) return 'warning'
    return null
  }

  if (typeof severity === 'string') {
    if (severity === 'error' || severity === '2') return 'error'
    if (severity === 'warn' || severity === 'warning' || severity === '1') return 'warning'
    if (severity === 'off' || severity === '0') return null
  }

  return null
}

/**
 * Extract rule options from ESLint rule config
 */
function extractOptions(ruleConfig: unknown): Record<string, unknown> {
  if (Array.isArray(ruleConfig) && ruleConfig.length > 1) {
    return typeof ruleConfig[1] === 'object' ? ruleConfig[1] : {}
  }
  return {}
}

/**
 * ESLint config structure (simplified)
 */
interface ESLintConfig {
  rules?: Record<string, unknown>
  overrides?: Array<{
    rules?: Record<string, unknown>
  }>
  extends?: string | string[]
}

/**
 * Migration result
 */
export interface MigrationResult {
  rules: Record<string, RuleSeverity | [RuleSeverity, Record<string, unknown>]>
  unmapped: string[]
  source: 'eslint'
}

/**
 * Migrate ESLint config to CodeForge config
 */
export function migrateESLintConfig(config: ESLintConfig): MigrationResult {
  const rules: MigrationResult['rules'] = {}
  const unmapped: string[] = []

  // Collect all rules from config and overrides
  const allRules: Record<string, unknown> = { ...config.rules }

  // Merge rules from overrides
  if (config.overrides) {
    for (const override of config.overrides) {
      if (override.rules) {
        Object.assign(allRules, override.rules)
      }
    }
  }

  // Map each rule
  for (const [eslintRule, ruleConfig] of Object.entries(allRules)) {
    const codeforgeRule = ESLINT_TO_CODEFORGE_RULES[eslintRule]

    if (!codeforgeRule) {
      unmapped.push(eslintRule)
      continue
    }

    const severity = convertSeverity(ruleConfig)
    if (!severity) {
      continue // Rule is disabled
    }

    const options = extractOptions(ruleConfig)
    if (Object.keys(options).length > 0) {
      rules[codeforgeRule] = [severity, options]
    } else {
      rules[codeforgeRule] = severity
    }
  }

  return {
    rules,
    source: 'eslint',
    unmapped,
  }
}

/**
 * Read and parse ESLint config file
 */
export async function readESLintConfig(configPath: string): Promise<ESLintConfig | null> {
  try {
    const { readFile } = await import('node:fs/promises')
    const content = await readFile(configPath, 'utf-8')

    // Handle JSON config
    if (configPath.endsWith('.json')) {
      return JSON.parse(content) as ESLintConfig
    }

    // Handle JS config (basic support)
    if (configPath.endsWith('.js') || configPath.endsWith('.cjs') || configPath.endsWith('.mjs')) {
      // For JS files, we'd need to evaluate them, but that's complex and potentially unsafe
      // For now, return null and let the user know JS configs need manual conversion
      return null
    }

    // Handle YAML config (basic parsing)
    if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
      // Simple YAML parsing for basic configs
      // This is a simplified implementation
      const lines = content.split('\n')
      const config: ESLintConfig = { rules: {} }
      let inRulesSection = false
      let currentRule = ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed === 'rules:') {
          inRulesSection = true
          continue
        }

        if (inRulesSection && trimmed.startsWith('-')) {
          // Skip list items for now
          continue
        }

        if (inRulesSection && trimmed.includes(':') && !trimmed.startsWith(' ')) {
          inRulesSection = false
          continue
        }

        if (inRulesSection && trimmed.includes(':')) {
          const [ruleName, ruleValue] = trimmed.split(':').map((s) => s.trim())
          if (ruleName && ruleValue) {
            currentRule = ruleName
            const parsed = Number.parseInt(ruleValue, 10)
            if (!Number.isNaN(parsed)) {
              config.rules![currentRule] = parsed
            } else {
              config.rules![currentRule] = ruleValue
            }
          }
        }
      }

      return config
    }

    return null
  } catch {
    return null
  }
}

/**
 * Detect ESLint config file in directory
 */
export async function detectESLintConfig(cwd: string): Promise<string | null> {
  const { access } = await import('node:fs/promises')
  const { join } = await import('node:path')

  const configFiles = [
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.mjs',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc',
  ]

  for (const file of configFiles) {
    const filePath = join(cwd, file)
    try {
      await access(filePath)
      return filePath
    } catch {
      continue
    }
  }

  // Check for package.json with eslintConfig
  try {
    const { readFile } = await import('node:fs/promises')
    const packageJsonPath = join(cwd, 'package.json')
    const content = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content) as { eslintConfig?: ESLintConfig }
    if (packageJson.eslintConfig) {
      return packageJsonPath
    }
  } catch {
    // package.json not found or no eslintConfig
  }

  return null
}
