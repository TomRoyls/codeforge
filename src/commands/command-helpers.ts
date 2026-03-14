import type { CodeForgeConfig } from '../config/types.js'

import { ConfigCache } from '../config/cache.js'
import { findConfigPath } from '../config/discovery.js'
import { parseEnvVars } from '../config/env-parser.js'
import { mergeConfigs, mergeEnvConfig } from '../config/merger.js'
import { validateConfig } from '../config/validator.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import { logger } from '../utils/logger.js'

export function setupRuleRegistry(requestedRules?: string[]): RuleRegistry {
  const registry = new RuleRegistry()

  for (const [ruleId, ruleDef] of Object.entries(allRules)) {
    registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
  }

  if (requestedRules && requestedRules.length > 0) {
    const requestedSet = new Set(requestedRules)

    for (const [ruleId] of Object.entries(allRules)) {
      if (!requestedSet.has(ruleId)) {
        registry.disable(ruleId)
      }
    }
  }

  return registry
}

export async function loadCommandConfig(
  flags: {
    config?: string
    files?: string[]
    ignore?: string[]
  },
  configCache: ConfigCache,
): Promise<CodeForgeConfig> {
  const envConfig = parseEnvVars()
  const cliFlagsConfig: Partial<CodeForgeConfig> = {}
  if (flags.files !== undefined) {
    cliFlagsConfig.files = flags.files
  }

  if (flags.ignore !== undefined) {
    cliFlagsConfig.ignore = flags.ignore
  }

  const configPath = await findConfigPath(flags.config, process.cwd())

  if (configPath) {
    logger.info(`Loading config from: ${configPath}`)
    const rawConfig = await configCache.getConfig(configPath)
    if (rawConfig) {
      const fileConfig = validateConfig(rawConfig)
      const mergedWithEnv = mergeEnvConfig(fileConfig, envConfig)
      return mergeConfigs(mergedWithEnv, cliFlagsConfig)
    }
  }

  logger.debug('No config file found, using defaults with env vars')
  const mergedWithEnv = mergeEnvConfig({}, envConfig)
  return mergeConfigs(mergedWithEnv, cliFlagsConfig)
}

export function resolvePatterns(
  argsFiles: string | string[] | undefined,
  configFiles: string[] | undefined,
): string[] {
  if (argsFiles) {
    return Array.isArray(argsFiles) ? argsFiles : [argsFiles]
  }

  return configFiles ?? []
}
