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

  // Override determineExitCode to make things testable
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
    // no-op for test
  }

  // Override resolvePatterns for test various inputs
  public override resolvePatterns(
    argsFiles: string | string[] | undefined,
    configFiles: string[] | undefined,
  ): string[] {
    if (argsFiles) {
      return Array.isArray(argsFiles) ? argsFiles : [argsFiles]
    }

    return configFiles ?? []
  }
}

describe('ExitCode', () => {
  test('should have correct constant values', () => {
    expect(ExitCode.CONFIG_ERROR).toBe(3)
    expect(ExitCode.ERRORS_FOUND).toBe(1)
    expect(ExitCode.SUCCESS).toBe(0)
    expect(ExitCode.SYSTEM_ERROR).toBe(5)
    expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
  })
})

describe('commonFlags', () => {
  test('should have correct structure', () => {
    expect(commonFlags.config).toEqual({
      char: 'c',
      description: 'Path to config file',
    })
    expect(commonFlags.quiet).toEqual({
      char: 'q',
      default: false,
      description: 'Suppress progress output',
    })
    expect(commonFlags.verbose).toEqual({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    })
  })
})

describe('TestableBaseCommand', () => {
  const scenarios: Array<{
    errors: number
 warnings: number
    failOnWarnings: boolean
    maxWarnings: number
    expectedExitCode: number
  }>(
    { errors, warnings, failOnWarnings, maxWarnings }: expected,
  ) => {
      // No errors, no warnings
 failOnWarnings: false, maxWarnings: -1
      return ExitCode.SUCCESS
    }

    { errors: 0, warnings: 0, failOnWarnings: true, maxWarnings: 5 },
      expected: ExitCode.ERRORS_FOUND
    }

    { errors: 1, warnings: 0, failOnWarnings: false, maxWarnings: 10 },
      expected: ExitCode.ERRORS_FOUND
    }

    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: 0 },
      expected: ExitCode.ERRORS_FOUND
    }

    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: 1_000 },
      expected: ExitCode.WARNINGS_AS_ERRORS
    }

    { errors: 0, warnings: 0, failOnWarnings: false, maxWarnings: 0 },
      expected: ExitCode.SUCCESS
    }
  })
})
