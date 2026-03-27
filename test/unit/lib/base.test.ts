import { describe, test, expect } from 'vitest'
import { ExitCode, commonFlags, BaseCommand } from '../../../src/lib/base.js'

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

class TestableBaseCommand extends BaseCommand {
  public override async run(): Promise<void> {
    return Promise.resolve()
  }

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

describe('TestableBaseCommand', () => {
  const cmd = new TestableBaseCommand()

  describe('determineExitCode', () => {
    test('should return ERRORS_FOUND when there are errors', () => {
      const result = cmd.determineExitCode({ errors: 1, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return ERRORS_FOUND when errors exist regardless of warnings', () => {
      const result = cmd.determineExitCode({ errors: 2, warnings: 10 }, true, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return WARNINGS_AS_ERRORS when failOnWarnings=true and warnings>0', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 5 }, true, -1)
      expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
    })

    test('should return ERRORS_FOUND when warnings exceed maxWarnings', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 10 }, false, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return SUCCESS when no errors or warnings', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return SUCCESS when no errors and warnings within maxWarnings', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 3 }, false, 5)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return ERRORS_FOUND when warnings equal maxWarnings+1', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 6 }, false, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return SUCCESS when warnings equal maxWarnings', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 5 }, false, 5)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return ERRORS_FOUND when maxWarnings is 0 and warnings>0', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 1 }, false, 0)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should ignore maxWarnings when negative', () => {
      const result = cmd.determineExitCode({ errors: 0, warnings: 100 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })
  })

  describe('resolvePatterns', () => {
    test('should return argsFiles as array when provided as array', () => {
      const result = cmd.resolvePatterns(['foo.ts', 'bar.ts'], undefined)
      expect(result).toEqual(['foo.ts', 'bar.ts'])
    })

    test('should return argsFiles as single-item array when string provided', () => {
      const result = cmd.resolvePatterns('single.ts', undefined)
      expect(result).toEqual(['single.ts'])
    })

    test('should return configFiles when argsFiles is undefined', () => {
      const result = cmd.resolvePatterns(undefined, ['config.ts'])
      expect(result).toEqual(['config.ts'])
    })

    test('should return empty array when both are undefined', () => {
      const result = cmd.resolvePatterns(undefined, undefined)
      expect(result).toEqual([])
    })

    test('should prefer argsFiles over configFiles', () => {
      const result = cmd.resolvePatterns('args.ts', ['config.ts'])
      expect(result).toEqual(['args.ts'])
    })
  })
})
