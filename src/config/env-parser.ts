import type { RuleSeverity } from '../rules/types.js'
import type { CodeForgeConfig, RuleEnvConfig } from './types.js'

import { logger } from '../utils/logger.js'

/**
 * Parse environment variables with CODEFORGE_ prefix
 * Converts CODEFORGE_RULES_MAX_COMPLEXITY → rules.max-complexity
 */
export function parseEnvVars(): Partial<CodeForgeConfig> {
  const config: Partial<CodeForgeConfig> = {}
  const { env } = process

  // Parse files pattern
  if (env.CODEFORGE_FILES) {
    config.files = parseArrayValue(env.CODEFORGE_FILES)
  }

  // Parse ignore patterns
  if (env.CODEFORGE_IGNORE) {
    config.ignore = parseArrayValue(env.CODEFORGE_IGNORE)
  }

  // Parse rules
  const rules = parseRulesFromEnv(env)
  if (Object.keys(rules).length > 0) {
    config.rules = rules
  }

  return config
}

export function parseArrayValue(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

export function isValidSeverity(value: string): value is RuleSeverity {
  return value === 'error' || value === 'warning' || value === 'info'
}

/**
 * Parse CODEFORGE_RULES_* environment variables
 *
 * Examples:
 * - CODEFORGE_RULES_MAX_COMPLEXITY=error → rules: { 'max-complexity': 'error' }
 * - CODEFORGE_RULES_MAX_PARAMS='["warning", {"max": 5}]' → rules: { 'max-params': ['warning', { max: 5 }] }
 * - CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS='{"max": 10}' → combined with severity
 */
export function parseRulesFromEnv(env: NodeJS.ProcessEnv): RuleEnvConfig {
  const rules: RuleEnvConfig = {}
  const rulePrefix = 'CODEFORGE_RULES_'

  // Find all CODEFORGE_RULES_* vars
  const ruleVars = Object.keys(env).filter((key) => key.startsWith(rulePrefix))

  for (const key of ruleVars) {
    // Skip _OPTIONS vars (handled separately)
    if (key.endsWith('_OPTIONS')) continue

    // Extract rule ID: CODEFORGE_RULES_MAX_COMPLEXITY → max-complexity
    const ruleId = key.slice(rulePrefix.length).toLowerCase().replaceAll('_', '-')

    const severityValue = env[key]

    if (!severityValue || !isValidSeverity(severityValue)) {
      logger.warn(
        `Invalid severity in ${key}: ${severityValue}. Must be 'error', 'warning', or 'info'`,
      )
      continue
    }

    // Check for options
    const optionsKey = `${key}_OPTIONS`
    const optionsJson = env[optionsKey]

    if (optionsJson) {
      try {
        const options = JSON.parse(optionsJson)
        rules[ruleId] = [severityValue, options]
      } catch {
        logger.warn(`Invalid JSON in ${optionsKey}: ${optionsJson}`)
        rules[ruleId] = severityValue
      }
    } else {
      rules[ruleId] = severityValue
    }
  }

  return rules
}

/**
 * Clear all CODEFORGE_* environment variables (for testing)
 */
export function clearEnvVars(): void {
  for (const key of Object.keys(process.env).filter((key) => key.startsWith('CODEFORGE_'))) {
    delete process.env[key]
  }
}
