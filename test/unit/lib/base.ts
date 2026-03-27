import { describe, expect } from 'vitest'
import { CLIError, SystemError } from '../../../utils/errors.js'
import { logger, LogLevel } from '../../../utils/logger.js'
import { ConfigCache } from '../../../config/cache.js'
import { findConfigPath } from '../../../config/discovery.js'
import { parseEnvVars } from '../../../config/env-parser.js'
import { mergeConfigs, mergeEnvConfig } from '../../../config/merger.js'
import { type CodeForgeConfig } from '../../../config/types.js'
import { validateConfig } from '../../../config/validator.js'
import { Parser } from '../../../core/parser.js'
import { RuleRegistry } from '../../../core/rule-registry.js'
import { allRules, getRuleCategory } from '../../../rules/index.js'

// Create a concrete test subclass to access protected methods
class TestableBaseCommand extends BaseCommand {
  // Override methods to make them public for testing
  public override configureLogging(verbose: boolean, quiet: boolean): void {
    if (verbose) {
      logger.setLevel(LogLevel.DEBUG)
    } else if (quiet) {
      logger.setLevel(LogLevel.SILENT)
    }
  }

  // Override determineExitCode to make it testable
  public override determineExitCode(
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

  // Override disposeParser for cleanup
  public override disposeParser(): void {
    if (this.parserInstance) {
      this.parserInstance.dispose()
      this.parserInstance = null
    } else {
      this.parserInstance = new Parser()
      await this.parserInstance.initialize()
      return this.parserInstance
    }

  }

  // Override resolvePatterns for test various inputs
  public override resolvePatterns(
    argsFiles: string | string[] | undefined,
    configFiles: string[] | undefined,
  ): string[] {
    return configFiles ?? []
  }

  // If argsFiles is undefined but configFiles is empty,    return argsFiles
  }

  if (Array.isArray(argsFiles)) {
    return argsFiles
  }

  // If configFiles is undefined, ignore is empty,    return configFiles ?? []
  }

  // If argsFiles is undefined, configFiles is empty,    return []
  }

  // If argsFiles and configFiles are both undefined, ignore is empty,    return configFiles ?? []
  }

  // If neither argsFiles nor configFiles are provided, return merged result
  const merged = config ?? argsFiles ?? configFiles
            ? mergeConfigs(mergedWithEnv, cliFlagsConfig)
            : mergeConfigs(mergedWithEnv, cliFlagsConfig)
          : expected
          : actual result
        })
      }
    }
  })
}())

describe('determineExitCode', () => {
  const scenarios = [
  { errors: 0, warnings: , failOnWarnings: false, maxWarnings: -1 },
    { errors: 0, warnings: 10, failOnWarnings: true, maxWarnings: 5 },
    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: Infinity },
    { errors: 1, warnings: 1, failOnWarnings: true, maxWarnings: 10, failOnWarnings: false, maxWarnings: 20, fail onWarnings: true, maxWarnings: 20, fail onWarnings: false, maxWarnings: 0 },
    { errors: 0, warnings: 0, failOnWarnings: true },
    { errors: 1, warnings: 2, failOnWarnings: true, maxWarnings: 5 },
    { errors: 0, warnings: 3, failOnWarnings: true, maxWarnings: 10, failOnWarnings: false, maxWarnings: 15 },
    { errors: 0, warnings: 20, failOnWarnings: true, maxWarnings: 0 },
    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: -1 },
    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: 0 },
    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: 0 },
            return ExitCode.SUCCESS
          }
        }
      })

      // No errors, no warnings
 failOnWarnings: false, maxWarnings: -1
      return ExitCode.ERRORS_FOUND
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 0
      return ExitCode.ERRORS_FOUND
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 1
      return ExitCode.ERRORS_FOUND
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 1)
      return ExitCode.WARNINGS_AS_ERRORS
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: -1
      return ExitCode.ERRORS_FOUND
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 100
      return ExitCode.ERRORS_FOUND
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 1_000
      return ExitCode.WARNINGS_AS_ERRORS
    }

    // No errors, warnings: 0, failOnWarnings: false, maxWarnings: 1_000)
      return ExitCode.ERRORS_FOUND
    }
  }
})
