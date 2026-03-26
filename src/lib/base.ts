import { Command } from '@oclif/core'

import { ConfigCache } from '../config/cache.js'
import { findConfigPath } from '../config/discovery.js'
import { parseEnvVars } from '../config/env-parser.js'
import { mergeConfigs, mergeEnvConfig } from '../config/merger.js'
import { type CodeForgeConfig } from '../config/types.js'
import { validateConfig } from '../config/validator.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import { CLIError, SystemError } from '../utils/errors.js'
import { logger, LogLevel } from '../utils/logger.js'

/**
 * Exit codes used by CodeForge CLI commands
 */
export const ExitCode = {
  CONFIG_ERROR: 3,
  ERRORS_FOUND: 1,
  SUCCESS: 0,
  SYSTEM_ERROR: 5,
  WARNINGS_AS_ERRORS: 2,
} as const

/**
 * Base configuration for commands that analyze code
 */
export interface AnalyzeCommandConfig {
  config?: string
  files?: string[]
  ignore?: string[]
}

/**
 * BaseCommand provides common functionality for all CodeForge CLI commands.
 *
 * Features:
 * - Standardized error handling with CLIError suggestions
 * - Unified config loading with caching
 * - Parser lifecycle management
 * - Logging configuration
 * - Consistent exit code handling
 *
 * @example
 * ```typescript
 * export default class MyCommand extends BaseCommand {
 *   static override description = 'My command description'
 *
 *   async run(): Promise<void> {
 *     const { args, flags } = await this.parse(MyCommand)
 *     this.configureLogging(flags.verbose, flags.quiet)
 *
 *     const config = await this.loadConfig(flags)
 *     const parser = await this.createParser()
 *
 *     try {
 *       // Command logic here
 *     } finally {
 *       parser.dispose()
 *     }
 *   }
 * }
 * ```
 */
export abstract class BaseCommand extends Command {
  /**
   * Config cache instance for the command
   */
  protected configCache = new ConfigCache()

  /**
   * Parser instance (lazy initialized via createParser)
   */
  private parserInstance: null | Parser = null

  /**
   * Override to handle CLIError with suggestions display.
   * This ensures all commands show helpful error messages consistently.
   */
  async catch(error: Error): Promise<void> {
    if (error instanceof CLIError) {
      this.error(error.message, {
        exit: ExitCode.ERRORS_FOUND,
        suggestions: error.suggestions,
      })
    }

    if (error instanceof SystemError) {
      this.error(error.message, {
        exit: ExitCode.SYSTEM_ERROR,
      })
    }

    throw error
  }

  /**
   * Configure logging level based on verbose/quiet flags.
   */
  protected configureLogging(verbose: boolean, quiet: boolean): void {
    if (verbose) {
      logger.setLevel(LogLevel.DEBUG)
    } else if (quiet) {
      logger.setLevel(LogLevel.SILENT)
    }
  }

  /**
   * Create and initialize a Parser instance.
   * The parser is tracked and should be disposed via disposeParser().
   */
  protected async createParser(): Promise<Parser> {
    this.parserInstance = new Parser()
    await this.parserInstance.initialize()
    return this.parserInstance
  }

  /**
   * Exit with the appropriate code based on analysis results.
   */
  protected determineExitCode(
    summary: { errors: number; warnings: number },
    failOnWarnings: boolean,
    maxWarnings: number,
  ): number {
    if (summary.errors > 0) {
      return ExitCode.ERRORS_FOUND
    }

    if (failOnWarnings && summary.warnings > 0) {
      return ExitCode.WARNINGS_AS_ERRORS
    }

    if (maxWarnings >= 0 && summary.warnings > maxWarnings) {
      return ExitCode.ERRORS_FOUND
    }

    return ExitCode.SUCCESS
  }

  /**
   * Dispose of the parser instance if it was created.
   * Call this in a finally block to ensure cleanup.
   */
  protected disposeParser(): void {
    if (this.parserInstance) {
      this.parserInstance.dispose()
      this.parserInstance = null
    }
  }

  /**
   * Load and merge configuration from file, environment, and CLI flags.
   */
  protected async loadConfig(flags: AnalyzeCommandConfig): Promise<CodeForgeConfig> {
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
      const rawConfig = await this.configCache.getConfig(configPath)
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

  /**
   * Resolve file patterns from args or config.
   */
  protected resolvePatterns(
    argsFiles: string | string[] | undefined,
    configFiles: string[] | undefined,
  ): string[] {
    if (argsFiles) {
      return Array.isArray(argsFiles) ? argsFiles : [argsFiles]
    }

    return configFiles ?? []
  }

  /**
   * Set up a RuleRegistry with all rules registered.
   * Optionally filter to specific requested rules.
   */
  protected setupRuleRegistry(requestedRules?: string[]): RuleRegistry {
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
}

/**
 * Type helper for command flags that include common options
 */
export interface CommonFlags {
  config?: string
  files?: string[]
  ignore?: string[]
  quiet?: boolean
  verbose?: boolean
}

/**
 * Common flag definitions that can be spread into command flags
 */
export const commonFlags = {
  config: {
    char: 'c' as const,
    description: 'Path to config file',
  },
  quiet: {
    char: 'q' as const,
    default: false,
    description: 'Suppress progress output',
  },
  verbose: {
    char: 'v' as const,
    default: false,
    description: 'Show detailed output',
  },
}
