import type { CodeForgeConfig, RuleEnvConfig } from '../config/types.js'

import { ConfigCache } from '../config/cache.js'
import { findConfigPath } from '../config/discovery.js'
import { parseEnvVars } from '../config/env-parser.js'
import { mergeConfigs, mergeEnvConfig } from '../config/merger.js'
import { validateConfig } from '../config/validator.js'
import { type DiscoveredFile } from '../core/file-discovery.js'
import { type Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { type RuleWithFix } from '../fix/fixer.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { logger } from '../utils/logger.js'

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
  cacheResults: boolean
  changedMode: string | undefined
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
  'cache-results': boolean
  changed?: string
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
  const cacheResults = flags['cache-results']
  const changedMode = flags.changed
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
    cacheResults,
    changedMode,
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
  extensionInput?: null | string | string[],
): DiscoveredFile[] {
  let extensions: string[]

  if (!extensionInput) {
    return files
  }

  if (Array.isArray(extensionInput)) {
    extensions = extensionInput
  } else {
    extensions = extensionInput
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
  }

  if (extensions.length === 0) {
    return []
  }

  return files.filter((f) => {
    const lastDot = f.path.lastIndexOf('.')
    const lastSep = Math.max(f.path.lastIndexOf('/'), f.path.lastIndexOf('\\'))
    if (lastDot <= lastSep) return false
    const basename = f.path.slice(lastSep + 1)
    if (basename.startsWith('.') && !basename.slice(1).includes('.')) return false
    const ext = f.path.slice(lastDot).toLowerCase()
    return extensions.some((e) => e.toLowerCase() === ext)
  })
}

interface ApplyFixesResult {
  fileFixReports?: import('../fix/types.js').FileFixReport[]
  fixesApplied: number
  fixesSkipped: number
}

interface ApplyFixesOptions {
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

/**
 * Set up the rule registry from CLI flags and/or config rules.
 *
 * Priority (highest first):
 * 1. CLI --rules flag (requestedRules) — loads ONLY those rules
 * 2. config.rules (configRules) — loads ONLY those rules with configured severity
 * 3. Neither specified — loads ALL registered rules (default behavior)
 *
 * Rules explicitly set to severity "off" in config are disabled after registration.
 */
export async function setupRuleRegistryLazy(
  requestedRules?: string[],
  configRules?: RuleEnvConfig,
): Promise<RuleRegistry> {
  const registry = new RuleRegistry()

  if (requestedRules && requestedRules.length > 0) {
    const validRuleIds = lazyRuleLoader.getRuleIds()
    const validSet = new Set(validRuleIds)
    const unknownRules = requestedRules.filter((r) => !validSet.has(r))

    if (unknownRules.length > 0) {
      logger.warn(`Unknown rules will be ignored: ${unknownRules.join(', ')}`)
    }

    const knownRequested = requestedRules.filter((r) => validSet.has(r))
    const loadedRules = await lazyRuleLoader.loadRules(knownRequested)

    for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }
  } else if (configRules && Object.keys(configRules).length > 0) {
    const validRuleIds = lazyRuleLoader.getRuleIds()
    const validSet = new Set(validRuleIds)
    const configRuleIds = Object.keys(configRules)
    const unknownRules = configRuleIds.filter((r) => !validSet.has(r))

    if (unknownRules.length > 0) {
      logger.warn(`Unknown rules in config will be ignored: ${unknownRules.join(', ')}`)
    }

    const knownConfigRules = configRuleIds.filter((r) => validSet.has(r))
    const loadedRules = await lazyRuleLoader.loadRules(knownConfigRules)

    for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }
  } else {
    const loadedRules = await lazyRuleLoader.loadAllRules()

    for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }
  }

  return registry
}

const PROFILE_SEVERITY_OVERRIDES: Record<string, Record<string, 'error' | 'info' | 'warning'>> = {
  lenient: {
    'max-complexity': 'info',
    'max-depth': 'info',
    'max-file-size': 'info',
    'max-lines': 'info',
    'max-params': 'info',
    'no-console': 'info',
    'no-magic-numbers': 'info',
  },
  moderate: {
    'max-complexity': 'warning',
    'max-depth': 'warning',
    'max-file-size': 'warning',
    'no-console': 'warning',
    'no-magic-numbers': 'warning',
  },
  strict: {
    'no-console': 'error',
    'no-debugger': 'error',
    'no-eval': 'error',
    'no-explicit-any': 'error',
    'no-implicit-coercion': 'error',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
  },
}

export function getProfileSeverityOverrides(
  profile: 'lenient' | 'moderate' | 'strict',
): Record<string, 'error' | 'info' | 'warning'> {
  return PROFILE_SEVERITY_OVERRIDES[profile] ?? {}
}
