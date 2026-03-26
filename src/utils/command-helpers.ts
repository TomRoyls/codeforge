import type { CodeForgeConfig } from '../config/types.js'

import { ConfigCache } from '../config/cache.js'
import { findConfigPath } from '../config/discovery.js'
import { parseEnvVars } from '../config/env-parser.js'
import { mergeConfigs, mergeEnvConfig } from '../config/merger.js'
import { validateConfig } from '../config/validator.js'
import { type DiscoveredFile } from '../core/file-discovery.js'
import { type Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { type RuleWithFix } from '../fix/fixer.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import { logger } from '../utils/logger.js'

export function setupRuleRegistry(requestedRules?: string[]): RuleRegistry {
  const registry = new RuleRegistry()

  for (const [ruleId, ruleDef] of Object.entries(allRules)) {
    registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
  }

  if (requestedRules && requestedRules.length > 0) {
    const validRuleIds = new Set(Object.keys(allRules))
    const unknownRules = requestedRules.filter((r) => !validRuleIds.has(r))

    if (unknownRules.length > 0) {
      logger.warn(`Unknown rules will be ignored: ${unknownRules.join(', ')}`)
    }

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

export interface NormalizedFlags {
  ciMode: boolean
  concurrency: number
  dryRun: boolean
  failOnWarnings: boolean
  format: string
  maxWarnings: number
  output: string | undefined
  quiet: boolean
  shouldFix: boolean
  stagedMode: boolean
  verbose: boolean
}

export function normalizeFlags(flags: {
  ci: boolean
  concurrency: number
  'dry-run': boolean
  'fail-on-warnings': boolean
  fix: boolean
  format: string
  'max-warnings': number
  output?: string
  quiet: boolean
  staged: boolean
  verbose: boolean
}): NormalizedFlags {
  const ciMode = flags.ci
  const format = ciMode && flags.format === 'console' ? 'json' : flags.format
  const { output } = flags
  const quiet = ciMode || flags.quiet
  const verbose = flags.verbose && !ciMode
  const failOnWarnings = flags['fail-on-warnings']
  const maxWarnings = flags['max-warnings']
  const shouldFix = flags.fix
  const dryRun = flags['dry-run']
  const stagedMode = flags.staged
  const { concurrency } = flags

  return {
    ciMode,
    concurrency,
    dryRun,
    failOnWarnings,
    format,
    maxWarnings,
    output,
    quiet,
    shouldFix,
    stagedMode,
    verbose,
  }
}

export function filterFilesByExtension(
  files: DiscoveredFile[],
  extensionString?: string,
): DiscoveredFile[] {
  if (!extensionString) {
    return files
  }

  const extensions = extensionString
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (extensions.length === 0) {
    return files
  }

  return files.filter((f) => {
    const ext = f.path.split('.').pop()?.toLowerCase()
    return extensions.includes(`.${ext ?? ''}`)
  })
}

export interface ApplyFixesResult {
  fixesApplied: number
  fixesSkipped: number
}

export interface ApplyFixesOptions {
  allViolations: import('../ast/visitor.js').RuleViolation[]
  concurrency: number
  discoveredFiles: DiscoveredFile[]
  dryRun: boolean
  parseCache: Map<string, import('../core/parser.js').ParseResult>
  parser: Parser
  quiet: boolean
  rulesWithFixes: Map<string, RuleWithFix>
  verbose: boolean
}

export async function applyFixesToFiles(
  options: ApplyFixesOptions & {
    applyFixesFn: (opts: ApplyFixesOptions) => Promise<ApplyFixesResult>
  },
): Promise<ApplyFixesResult> {
  const { allViolations, applyFixesFn, dryRun, quiet, ...applyFixesOptions } = options

  if (allViolations.length === 0) {
    return { fixesApplied: 0, fixesSkipped: 0 }
  }

  const fixResult = await applyFixesFn({ ...applyFixesOptions, allViolations, dryRun, quiet })

  return fixResult
}
