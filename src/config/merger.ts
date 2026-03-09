import { logger } from '../utils/logger.js'
import { type CodeForgeConfig, DEFAULT_CONFIG } from './types.js'

export function mergeConfigs(
  fileConfig: CodeForgeConfig,
  cliFlags: Partial<CodeForgeConfig> = {},
): CodeForgeConfig {
  logger.debug('Merging configurations')
  logger.debug('File config:', fileConfig)
  logger.debug('CLI flags:', cliFlags)

  const merged: CodeForgeConfig = {
    files: cliFlags.files ?? fileConfig.files ?? DEFAULT_CONFIG.files,
    ignore: cliFlags.ignore ?? fileConfig.ignore ?? DEFAULT_CONFIG.ignore,
    rules: {
      ...fileConfig.rules,
      ...cliFlags.rules,
    },
  }

  logger.debug('Merged config:', merged)
  return merged
}

/**
 * Merge file config with environment config
 * Unlike mergeConfigs, this doesn't apply defaults when both configs are empty
 */
export function mergeEnvConfig(
  fileConfig: CodeForgeConfig,
  envConfig: Partial<CodeForgeConfig> = {},
): CodeForgeConfig {
  logger.debug('Merging file config with env config')
  logger.debug('File config:', fileConfig)
  logger.debug('Env config:', envConfig)

  const merged: CodeForgeConfig = {
    files: envConfig.files ?? fileConfig.files,
    ignore: envConfig.ignore ?? fileConfig.ignore,
    rules: {
      ...fileConfig.rules,
      ...envConfig.rules,
    },
  }

  logger.debug('Merged config:', merged)
  return merged
}
