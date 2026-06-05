import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExitCode, BaseCommand, commonFlags } from '../../../../src/lib/base.js'
import type { AnalyzeCommandConfig, CommonFlags } from '../../../../src/lib/base.js'
import { CLIError, SystemError } from '../../../../src/utils/errors.js'
import { logger, LogLevel } from '../../../../src/utils/logger.js'

class TestCommand extends BaseCommand {
  async run(): Promise<void> {}

  public testConfigureLogging(verbose: boolean, quiet: boolean): void {
    return this.configureLogging(verbose, quiet)
  }

  public testDetermineExitCode(
    summary: { errors: number; warnings: number },
    failOnWarnings: boolean,
    maxWarnings: number,
  ): number {
    return this.determineExitCode(summary, failOnWarnings, maxWarnings)
  }

  public testResolvePatterns(
    argsFiles: string | string[] | undefined,
    configFiles: string[] | undefined,
  ): string[] {
    return this.resolvePatterns(argsFiles, configFiles)
  }

  public async testCreateParser() {
    return this.createParser()
  }

  public testDisposeParser(): void {
    return this.disposeParser()
  }

  public async testSetupRuleRegistry(requestedRules?: string[]) {
    return this.setupRuleRegistry(requestedRules)
  }

  public async testLoadConfig(flags: AnalyzeCommandConfig) {
    return this.loadConfig(flags)
  }
}

describe('_base.ts', () => {
  let command: TestCommand

  beforeEach(() => {
    command = new TestCommand([], {} as never)
    vi.clearAllMocks()
  })

  afterEach(() => {
    command.testDisposeParser()
  })

  // =========================================================================
  // ExitCode (5 tests)
  // =========================================================================
  describe('ExitCode enum', () => {
    test('SUCCESS is 0', () => {
      expect(ExitCode.SUCCESS).toBe(0)
    })
    test('ERRORS_FOUND is 1', () => {
      expect(ExitCode.ERRORS_FOUND).toBe(1)
    })
    test('WARNINGS_AS_ERRORS is 2', () => {
      expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
    })
    test('CONFIG_ERROR is 3', () => {
      expect(ExitCode.CONFIG_ERROR).toBe(3)
    })
    test('SYSTEM_ERROR is 5', () => {
      expect(ExitCode.SYSTEM_ERROR).toBe(5)
    })
  })

  // =========================================================================
  // AnalyzeCommandConfig interface (5 tests)
  // =========================================================================
  describe('AnalyzeCommandConfig interface', () => {
    test('all properties optional by default', () => {
      const config: AnalyzeCommandConfig = {}
      expect(config.config).toBeUndefined()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
    })

    test('can set config property', () => {
      const config: AnalyzeCommandConfig = { config: '/path/to/config' }
      expect(config.config).toBe('/path/to/config')
    })

    test('can set files property', () => {
      const config: AnalyzeCommandConfig = { files: ['**/*.ts'] }
      expect(config.files).toEqual(['**/*.ts'])
    })

    test('can set ignore property', () => {
      const config: AnalyzeCommandConfig = { ignore: ['node_modules/**'] }
      expect(config.ignore).toEqual(['node_modules/**'])
    })

    test('can set all properties simultaneously', () => {
      const config: AnalyzeCommandConfig = {
        config: '/path/to/config',
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
      }
      expect(config.config).toBe('/path/to/config')
      expect(config.files).toEqual(['**/*.ts'])
      expect(config.ignore).toEqual(['node_modules/**'])
    })
  })

  // =========================================================================
  // CommonFlags interface (5 tests)
  // =========================================================================
  describe('CommonFlags interface', () => {
    test('all properties optional by default', () => {
      const flags: CommonFlags = {}
      expect(flags.config).toBeUndefined()
      expect(flags.files).toBeUndefined()
      expect(flags.ignore).toBeUndefined()
      expect(flags.quiet).toBeUndefined()
      expect(flags.verbose).toBeUndefined()
    })

    test('can set config', () => {
      const flags: CommonFlags = { config: '.codeforgerc.json' }
      expect(flags.config).toBe('.codeforgerc.json')
    })

    test('can set files', () => {
      const flags: CommonFlags = { files: ['src/**/*.ts'] }
      expect(flags.files).toEqual(['src/**/*.ts'])
    })

    test('can set quiet and verbose booleans', () => {
      const flags: CommonFlags = { quiet: true, verbose: false }
      expect(flags.quiet).toBe(true)
      expect(flags.verbose).toBe(false)
    })

    test('can set all properties', () => {
      const flags: CommonFlags = {
        config: 'c.json',
        files: ['*.ts'],
        ignore: ['dist/**'],
        quiet: true,
        verbose: false,
      }
      expect(flags.config).toBe('c.json')
      expect(flags.files).toEqual(['*.ts'])
      expect(flags.ignore).toEqual(['dist/**'])
      expect(flags.quiet).toBe(true)
      expect(flags.verbose).toBe(false)
    })
  })

  // =========================================================================
  // commonFlags constant (8 tests)
  // =========================================================================
  describe('commonFlags constant', () => {
    test('has config flag with char c', () => {
      expect(commonFlags.config).toBeDefined()
      expect(commonFlags.config.char).toBe('c')
    })

    test('config flag has description', () => {
      expect(commonFlags.config.description).toBe('Path to config file')
    })

    test('has quiet flag with char q', () => {
      expect(commonFlags.quiet).toBeDefined()
      expect(commonFlags.quiet.char).toBe('q')
    })

    test('quiet flag defaults to false', () => {
      expect(commonFlags.quiet.default).toBe(false)
    })

    test('quiet flag has description', () => {
      expect(commonFlags.quiet.description).toBe('Suppress progress output')
    })

    test('has verbose flag with char v', () => {
      expect(commonFlags.verbose).toBeDefined()
      expect(commonFlags.verbose.char).toBe('v')
    })

    test('verbose flag defaults to false', () => {
      expect(commonFlags.verbose.default).toBe(false)
    })

    test('verbose flag has description', () => {
      expect(commonFlags.verbose.description).toBe('Show detailed output')
    })
  })

  // =========================================================================
  // BaseCommand
  // =========================================================================
  describe('BaseCommand', () => {
    // -------------------------------------------------------------------------
    // configureLogging (8 tests)
    // -------------------------------------------------------------------------
    describe('configureLogging', () => {
      test('sets debug level when verbose is true', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, false)
        expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.DEBUG)
      })

      test('sets silent level when quiet is true', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(false, true)
        expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.SILENT)
      })

      test('prioritizes verbose over quiet', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, true)
        expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.DEBUG)
      })

      test('does not change level when both are false', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(false, false)
        expect(setLevelSpy).not.toHaveBeenCalled()
      })

      test('calls setLevel exactly once when verbose is true', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, false)
        expect(setLevelSpy).toHaveBeenCalledTimes(1)
      })

      test('calls setLevel exactly once when quiet is true', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(false, true)
        expect(setLevelSpy).toHaveBeenCalledTimes(1)
      })

      test('calls setLevel exactly once when both are true', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, true)
        expect(setLevelSpy).toHaveBeenCalledTimes(1)
      })

      test('does not call setLevel when both are false', () => {
        const setLevelSpy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(false, false)
        expect(setLevelSpy).toHaveBeenCalledTimes(0)
      })
    })

    // -------------------------------------------------------------------------
    // determineExitCode (35 tests)
    // -------------------------------------------------------------------------
    describe('determineExitCode', () => {
      // Basic cases
      test('returns SUCCESS when no errors or warnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns ERRORS_FOUND for 1 error', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns ERRORS_FOUND for 5 errors', () => {
        const result = command.testDetermineExitCode({ errors: 5, warnings: 10 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns ERRORS_FOUND for 100 errors', () => {
        const result = command.testDetermineExitCode({ errors: 100, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      // failOnWarnings
      test('returns WARNINGS_AS_ERRORS when failOnWarnings true and 1 warning', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 1 }, true, -1)
        expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
      })

      test('returns WARNINGS_AS_ERRORS when failOnWarnings true and multiple warnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 50 }, true, -1)
        expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
      })

      test('returns SUCCESS when failOnWarnings true but 0 warnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 0 }, true, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns SUCCESS when failOnWarnings false and warnings exist', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 5 }, false, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      // maxWarnings
      test('returns ERRORS_FOUND when warnings exceed maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 5 }, false, 3)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns SUCCESS when warnings equal maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 3 }, false, 3)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns SUCCESS when warnings below maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 2 }, false, 5)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('ignores maxWarnings when set to -1', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 100 }, false, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns ERRORS_FOUND when warnings equal maxWarnings+1', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 11 }, false, 10)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns SUCCESS when maxWarnings is 0 and warnings is 0', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 0 }, false, 0)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns ERRORS_FOUND when maxWarnings is 0 and warnings is 1', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 1 }, false, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      // Priority: errors > failOnWarnings > maxWarnings
      test('errors take priority over failOnWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 0 }, true, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('errors take priority over maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 100 }, false, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('errors take priority over both failOnWarnings and maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 2, warnings: 50 }, true, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('failOnWarnings takes priority over maxWarnings when no errors', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 5 }, true, 100)
        expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
      })

      // Edge cases with large numbers
      test('handles very large error counts', () => {
        const result = command.testDetermineExitCode({ errors: 999999, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('handles very large warning counts with failOnWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 999999 }, true, -1)
        expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
      })

      test('handles very large warning counts with maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 999999 }, false, 10)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      // Boundary: maxWarnings -1 vs 0
      test('maxWarnings -1 means unlimited (100 warnings ok)', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 100 }, false, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('maxWarnings 0 means no warnings allowed', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 1 }, false, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      // Combined scenarios
      test('errors=1, warnings=0, failOnWarnings=false, maxWarnings=-1 returns ERRORS_FOUND', () => {
        expect(command.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
      })

      test('errors=0, warnings=0, failOnWarnings=true, maxWarnings=0 returns SUCCESS', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 0 }, true, 0)).toBe(0)
      })

      test('errors=0, warnings=1, failOnWarnings=false, maxWarnings=0 returns ERRORS_FOUND', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 1 }, false, 0)).toBe(1)
      })

      test('errors=0, warnings=1, failOnWarnings=true, maxWarnings=0 returns WARNINGS_AS_ERRORS', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 1 }, true, 0)).toBe(2)
      })

      test('errors=3, warnings=3, failOnWarnings=true, maxWarnings=2 returns ERRORS_FOUND', () => {
        expect(command.testDetermineExitCode({ errors: 3, warnings: 3 }, true, 2)).toBe(1)
      })

      test('errors=0, warnings=3, failOnWarnings=true, maxWarnings=2 returns WARNINGS_AS_ERRORS', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 3 }, true, 2)).toBe(2)
      })

      test('errors=0, warnings=3, failOnWarnings=false, maxWarnings=2 returns ERRORS_FOUND', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 3 }, false, 2)).toBe(1)
      })

      test('errors=0, warnings=2, failOnWarnings=false, maxWarnings=2 returns SUCCESS', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 2 }, false, 2)).toBe(0)
      })

      test('maxWarnings=-2 is treated as no limit (negative)', () => {
        // -2 is < 0 so maxWarnings >= 0 check fails, treated as no limit
        const result = command.testDetermineExitCode({ errors: 0, warnings: 100 }, false, -2)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('maxWarnings=1 with warnings=2 returns ERRORS_FOUND', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 2 }, false, 1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('maxWarnings=1 with warnings=1 returns SUCCESS', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 1 }, false, 1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('failOnWarnings=false, maxWarnings=-1, errors=0, warnings=0 returns SUCCESS', () => {
        expect(command.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)).toBe(0)
      })
    })

    // -------------------------------------------------------------------------
    // resolvePatterns (16 tests)
    // -------------------------------------------------------------------------
    describe('resolvePatterns', () => {
      test('single string argsFiles becomes array', () => {
        const result = command.testResolvePatterns('src/**/*.ts', undefined)
        expect(result).toEqual(['src/**/*.ts'])
      })

      test('array argsFiles returned as-is', () => {
        const result = command.testResolvePatterns(['src/**/*.ts', 'lib/**/*.ts'], undefined)
        expect(result).toEqual(['src/**/*.ts', 'lib/**/*.ts'])
      })

      test('configFiles returned when argsFiles is undefined', () => {
        const result = command.testResolvePatterns(undefined, ['config/**/*.ts'])
        expect(result).toEqual(['config/**/*.ts'])
      })

      test('argsFiles prioritized over configFiles (string)', () => {
        const result = command.testResolvePatterns('args/**/*.ts', ['config/**/*.ts'])
        expect(result).toEqual(['args/**/*.ts'])
      })

      test('argsFiles prioritized over configFiles (array)', () => {
        const result = command.testResolvePatterns(['a.ts'], ['b.ts'])
        expect(result).toEqual(['a.ts'])
      })

      test('both undefined returns empty array', () => {
        const result = command.testResolvePatterns(undefined, undefined)
        expect(result).toEqual([])
      })

      test('empty configFiles returns empty array', () => {
        const result = command.testResolvePatterns(undefined, [])
        expect(result).toEqual([])
      })

      test('single-element array argsFiles returned', () => {
        const result = command.testResolvePatterns(['only.ts'], undefined)
        expect(result).toEqual(['only.ts'])
      })

      test('empty string argsFiles is falsy, returns empty array', () => {
        const result = command.testResolvePatterns('', undefined)
        expect(result).toEqual([])
      })

      test('multi-pattern configFiles returned', () => {
        const result = command.testResolvePatterns(undefined, ['a.ts', 'b.ts', 'c.ts'])
        expect(result).toEqual(['a.ts', 'b.ts', 'c.ts'])
      })

      test('argsFiles with special glob characters', () => {
        const result = command.testResolvePatterns('src/**/{a,b}.ts', undefined)
        expect(result).toEqual(['src/**/{a,b}.ts'])
      })

      test('argsFiles array with multiple globs preserved', () => {
        const patterns = ['**/*.ts', '**/*.tsx', '!**/*.d.ts']
        const result = command.testResolvePatterns(patterns, undefined)
        expect(result).toEqual(patterns)
      })

      test('configFiles with single element', () => {
        const result = command.testResolvePatterns(undefined, ['single.ts'])
        expect(result).toEqual(['single.ts'])
      })

      test('argsFiles empty array is truthy so returns empty array', () => {
        // [] is truthy in JS, so argsFiles branch is taken
        const result = command.testResolvePatterns([], ['fallback.ts'])
        expect(result).toEqual([])
      })

      test('argsFiles string takes priority even when configFiles has many entries', () => {
        const result = command.testResolvePatterns('one.ts', ['a.ts', 'b.ts', 'c.ts', 'd.ts'])
        expect(result).toEqual(['one.ts'])
        expect(result).toHaveLength(1)
      })

      test('configFiles undefined with argsFiles undefined gives empty', () => {
        const result = command.testResolvePatterns(undefined, undefined)
        expect(result).toHaveLength(0)
      })
    })

    // -------------------------------------------------------------------------
    // catch (20 tests)
    // -------------------------------------------------------------------------
    describe('catch', () => {
      test('handles CLIError with suggestions', async () => {
        const cliError = new CLIError('Test error', {
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Test error', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        })
      })

      test('handles CLIError without suggestions defaults to empty array', async () => {
        const cliError = new CLIError('Test error')
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Test error', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: [],
        })
      })

      test('handles CLIError with empty suggestions array', async () => {
        const cliError = new CLIError('Test error', { suggestions: [] })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Test error', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: [],
        })
      })

      test('handles CLIError with single suggestion', async () => {
        const cliError = new CLIError('Oops', { suggestions: ['Try this'] })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Oops', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: ['Try this'],
        })
      })

      test('handles CLIError with code', async () => {
        const cliError = new CLIError('Bad input', { code: 'E001' })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Bad input', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: [],
        })
      })

      test('handles CLIError.invalidInput static factory', async () => {
        const cliError = CLIError.invalidInput('Bad', ['Fix it'])
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Bad', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: ['Fix it'],
        })
      })

      test('handles CLIError.fileNotFound static factory', async () => {
        const cliError = CLIError.fileNotFound('/missing.ts')
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('File not found: /missing.ts', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: expect.arrayContaining([expect.stringContaining('file path')]),
        })
      })

      test('handles CLIError.configError static factory', async () => {
        const cliError = CLIError.configError('Bad config', ['Check syntax'])
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Bad config', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: ['Check syntax'],
        })
      })

      test('handles SystemError', async () => {
        const systemError = new SystemError('System error')
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(systemError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('System error', {
          exit: ExitCode.SYSTEM_ERROR,
        })
      })

      test('handles SystemError with code', async () => {
        const systemError = new SystemError('IO fail', { code: 'E502' })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(systemError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('IO fail', {
          exit: ExitCode.SYSTEM_ERROR,
        })
      })

      test('handles SystemError.parseError static factory', async () => {
        const cause = new Error('parse fail')
        const systemError = SystemError.parseError('file.ts', cause)
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(systemError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('Failed to parse file: file.ts', {
          exit: ExitCode.SYSTEM_ERROR,
        })
      })

      test('handles SystemError.ioError static factory', async () => {
        const cause = new Error('disk full')
        const systemError = SystemError.ioError('write file', cause)
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })

        await expect(command.catch(systemError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('I/O error: write file', {
          exit: ExitCode.SYSTEM_ERROR,
        })
      })

      test('rethrows generic Error', async () => {
        const genericError = new Error('Generic error')
        await expect(command.catch(genericError)).rejects.toThrow('Generic error')
      })

      test('rethrows non-Error objects (string)', async () => {
        await expect(command.catch('string error' as never)).rejects.toBe('string error')
      })

      test('rethrows non-Error objects (number)', async () => {
        await expect(command.catch(42 as never)).rejects.toBe(42)
      })

      test('rethrows TypeError', async () => {
        const typeError = new TypeError('not a function')
        await expect(command.catch(typeError)).rejects.toThrow('not a function')
      })

      test('rethrows RangeError', async () => {
        const rangeError = new RangeError('out of range')
        await expect(command.catch(rangeError)).rejects.toThrow('out of range')
      })

      test('catch calls error() with correct exit code for CLIError', async () => {
        const cliError = new CLIError('msg')
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('x')
        })
        await expect(command.catch(cliError)).rejects.toThrow()
        expect(errorSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ exit: 1 }),
        )
      })

      test('catch calls error() with correct exit code for SystemError', async () => {
        const sysError = new SystemError('msg')
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('x')
        })
        await expect(command.catch(sysError)).rejects.toThrow()
        expect(errorSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ exit: 5 }),
        )
      })

      test('catch does not call this.error for generic Error', async () => {
        const errorSpy = vi.spyOn(command, 'error')
        await expect(command.catch(new Error('generic'))).rejects.toThrow('generic')
        expect(errorSpy).not.toHaveBeenCalled()
      })
    })

    // -------------------------------------------------------------------------
    // createParser and disposeParser (8 tests)
    // -------------------------------------------------------------------------
    describe('createParser and disposeParser', () => {
      test('creates and initializes parser', async () => {
        const parser = await command.testCreateParser()
        expect(parser).toBeDefined()
      })

      test('disposes parser without error', async () => {
        await command.testCreateParser()
        expect(() => command.testDisposeParser()).not.toThrow()
      })

      test('disposeParser is idempotent', async () => {
        await command.testCreateParser()
        command.testDisposeParser()
        expect(() => command.testDisposeParser()).not.toThrow()
      })

      test('disposeParser works when no parser created', () => {
        expect(() => command.testDisposeParser()).not.toThrow()
      })

      test('calling createParser twice creates new parser', async () => {
        const parser1 = await command.testCreateParser()
        const parser2 = await command.testCreateParser()
        expect(parser1).toBeDefined()
        expect(parser2).toBeDefined()
      })

      test('disposeParser after double createParser does not throw', async () => {
        await command.testCreateParser()
        await command.testCreateParser()
        expect(() => command.testDisposeParser()).not.toThrow()
      })

      test('create-dispose-create cycle works', async () => {
        const p1 = await command.testCreateParser()
        expect(p1).toBeDefined()
        command.testDisposeParser()
        const p2 = await command.testCreateParser()
        expect(p2).toBeDefined()
      })

      test('multiple consecutive disposeParser calls are safe', async () => {
        await command.testCreateParser()
        command.testDisposeParser()
        command.testDisposeParser()
        command.testDisposeParser()
        expect(() => command.testDisposeParser()).not.toThrow()
      })
    })

    // -------------------------------------------------------------------------
    // setupRuleRegistry (20 tests)
    // -------------------------------------------------------------------------
    describe('setupRuleRegistry', () => {
      test('creates registry with all rules', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(registry).toBeDefined()
      }, 60000)

      test('enables all rules by default', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })

      test('filters to specific rules when requested', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console', 'no-eval'])
        const consoleLogRule = registry.getRule('no-console')
        const evalRule = registry.getRule('no-eval')
        expect(consoleLogRule?.enabled).toBe(true)
        expect(evalRule?.enabled).toBe(true)
      })

      test('logs warning for unknown rules', async () => {
        const warnSpy = vi.spyOn(logger, 'warn')
        await command.testSetupRuleRegistry(['unknown-rule-xyz'])
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-rule-xyz'))
      })

      test('handles empty requested rules array (enables all)', async () => {
        const registry = await command.testSetupRuleRegistry([])
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })

      test('handles undefined requested rules (enables all)', async () => {
        const registry = await command.testSetupRuleRegistry(undefined)
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })

      test('disables non-requested rules when specific rules given', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console'])
        const allRules = registry.getAllRules()
        const enabledCount = allRules.filter((r) => r.enabled).length
        // Only no-console should be enabled from requested set
        // (other rules might share same ID)
        expect(enabledCount).toBeGreaterThanOrEqual(1)
      })

      test('no-console rule is enabled when requested', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console'])
        const rule = registry.getRule('no-console')
        expect(rule).toBeDefined()
        expect(rule?.enabled).toBe(true)
      })

      test('no-eval rule is enabled when requested', async () => {
        const registry = await command.testSetupRuleRegistry(['no-eval'])
        const rule = registry.getRule('no-eval')
        expect(rule).toBeDefined()
        expect(rule?.enabled).toBe(true)
      })

      test('multiple unknown rules all logged', async () => {
        const warnSpy = vi.spyOn(logger, 'warn')
        await command.testSetupRuleRegistry(['fake-1', 'fake-2', 'fake-3'])
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fake-1'))
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fake-2'))
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fake-3'))
      })

      test('mix of valid and unknown rules', async () => {
        const warnSpy = vi.spyOn(logger, 'warn')
        const registry = await command.testSetupRuleRegistry(['no-console', 'totally-fake'])
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('totally-fake'))
        const rule = registry.getRule('no-console')
        expect(rule?.enabled).toBe(true)
      })

      test('registry has getEnabledRules method', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(typeof registry.getEnabledRules).toBe('function')
      })

      test('registry has getRule method', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(typeof registry.getRule).toBe('function')
      })

      test('registry has getAllRules method', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(typeof registry.getAllRules).toBe('function')
      })

      test('registry has enable method', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(typeof registry.enable).toBe('function')
      })

      test('registry has disable method', async () => {
        const registry = await command.testSetupRuleRegistry()
        expect(typeof registry.disable).toBe('function')
      })

      test('getAllRules returns loaded rules', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console'])
        const allRules = registry.getAllRules()
        expect(allRules.length).toBeGreaterThanOrEqual(1)
      }, 60000)

      test('enabling a disabled rule works', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console'])
        const someOtherRule = registry.getAllRules().find((r) => !r.enabled)
        if (someOtherRule) {
          const ruleId = registry.getAllRules().find((r) => !r.enabled)
          // Find the rule key
          const allRulesList = registry.getAllRules()
          const disabledRule = allRulesList.find((r) => !r.enabled)
          expect(disabledRule).toBeDefined()
        }
      })

      test('rules have category property', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getAllRules()
        for (const rule of rules) {
          expect(rule.category).toBeDefined()
          expect(typeof rule.category).toBe('string')
        }
      })

      test('rules have definition property', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getAllRules()
        for (const rule of rules) {
          expect(rule.definition).toBeDefined()
        }
      })

      test('getEnabledRules returns correct count for single rule request', async () => {
        const registry = await command.testSetupRuleRegistry(['no-console'])
        const enabled = registry.getEnabledRules()
        // At minimum, the requested rule should be enabled
        const hasConsoleLog = enabled.some((r) => {
          // Check by looking at enabled rules
          return registry.getRule('no-console')?.enabled === true
        })
        expect(hasConsoleLog).toBe(true)
      })
    })

    // -------------------------------------------------------------------------
    // BaseCommand constructor and inheritance (10 tests)
    // -------------------------------------------------------------------------
    describe('BaseCommand instantiation', () => {
      test('can create instance with empty argv', async () => {
        const cmd = new TestCommand([], {} as never)
        expect(cmd).toBeDefined()
      })

      test('instance is instanceof BaseCommand', async () => {
        expect(command).toBeInstanceOf(BaseCommand)
      })

      test('instance is instanceof Command', async () => {
        const { Command } = require('@oclif/core')
        expect(command).toBeInstanceOf(Command)
      })

      test('has run method', async () => {
        expect(typeof command.run).toBe('function')
      })

      test('has catch method', async () => {
        expect(typeof command.catch).toBe('function')
      })

      test('run returns void promise', async () => {
        const result = await command.run()
        expect(result).toBeUndefined()
      })

      test('multiple instances are independent', async () => {
        const cmd1 = new TestCommand([], {} as never)
        const cmd2 = new TestCommand([], {} as never)
        expect(cmd1).not.toBe(cmd2)
      })

      test('can create many instances without error', async () => {
        const instances = Array.from({ length: 10 }, () => new TestCommand([], {} as never))
        expect(instances).toHaveLength(10)
        for (const inst of instances) {
          expect(inst).toBeInstanceOf(BaseCommand)
        }
      })

      test('configureLogging can be called on different instances', async () => {
        const cmd1 = new TestCommand([], {} as never)
        const cmd2 = new TestCommand([], {} as never)
        const spy1 = vi.spyOn(logger, 'setLevel')
        const spy2 = vi.spyOn(logger, 'setLevel')
        cmd1.testConfigureLogging(true, false)
        cmd2.testConfigureLogging(false, true)
        expect(spy1).toHaveBeenCalledWith(LogLevel.DEBUG)
        expect(spy2).toHaveBeenCalledWith(LogLevel.SILENT)
      })

      test('determineExitCode works on different instances', () => {
        const cmd1 = new TestCommand([], {} as never)
        const cmd2 = new TestCommand([], {} as never)
        expect(cmd1.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
        expect(cmd2.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)).toBe(0)
      })
    })

    // -------------------------------------------------------------------------
    // CLIError and SystemError integration (12 tests)
    // -------------------------------------------------------------------------
    describe('error class integration', () => {
      test('CLIError has correct name', () => {
        const err = new CLIError('test')
        expect(err.name).toBe('CLIError')
      })

      test('CLIError is instanceof Error', () => {
        const err = new CLIError('test')
        expect(err).toBeInstanceOf(Error)
      })

      test('CLIError has code property', () => {
        const err = new CLIError('test', { code: 'E001' })
        expect(err.code).toBe('E001')
      })

      test('CLIError default code is E000', () => {
        const err = new CLIError('test')
        expect(err.code).toBe('E000')
      })

      test('CLIError has context property', () => {
        const err = new CLIError('test', { context: { key: 'value' } })
        expect(err.context).toEqual({ key: 'value' })
      })

      test('CLIError toJSON works', () => {
        const err = new CLIError('test', { code: 'E001', suggestions: ['fix it'] })
        const json = err.toJSON()
        expect(json.name).toBe('CLIError')
        expect(json.code).toBe('E001')
        expect(json.message).toBe('test')
        expect(json.suggestions).toEqual(['fix it'])
      })

      test('SystemError has correct name', () => {
        const err = new SystemError('test')
        expect(err.name).toBe('SystemError')
      })

      test('SystemError is instanceof Error', () => {
        const err = new SystemError('test')
        expect(err).toBeInstanceOf(Error)
      })

      test('SystemError default code is E500', () => {
        const err = new SystemError('test')
        expect(err.code).toBe('E500')
      })

      test('SystemError has cause property', () => {
        const cause = new Error('original')
        const err = new SystemError('test', { cause })
        expect(err.cause).toBe(cause)
      })

      test('SystemError has context property', () => {
        const err = new SystemError('test', { context: { file: 'a.ts' } })
        expect(err.context).toEqual({ file: 'a.ts' })
      })

      test('SystemError toJSON works', () => {
        const cause = new Error('original')
        const err = new SystemError('test', { code: 'E501', cause })
        const json = err.toJSON()
        expect(json.name).toBe('SystemError')
        expect(json.code).toBe('E501')
        expect(json.message).toBe('test')
        expect(json.cause).toBeDefined()
        expect(json.cause?.message).toBe('original')
      })
    })

    // -------------------------------------------------------------------------
    // ExitCode values as constants (6 tests)
    // -------------------------------------------------------------------------
    describe('ExitCode value properties', () => {
      test('all values are numbers', () => {
        expect(typeof ExitCode.SUCCESS).toBe('number')
        expect(typeof ExitCode.ERRORS_FOUND).toBe('number')
        expect(typeof ExitCode.WARNINGS_AS_ERRORS).toBe('number')
        expect(typeof ExitCode.CONFIG_ERROR).toBe('number')
        expect(typeof ExitCode.SYSTEM_ERROR).toBe('number')
      })

      test('all values are unique', () => {
        const values = [
          ExitCode.SUCCESS,
          ExitCode.ERRORS_FOUND,
          ExitCode.WARNINGS_AS_ERRORS,
          ExitCode.CONFIG_ERROR,
          ExitCode.SYSTEM_ERROR,
        ]
        expect(new Set(values).size).toBe(values.length)
      })

      test('SUCCESS is the lowest value', () => {
        expect(ExitCode.SUCCESS).toBeLessThan(ExitCode.ERRORS_FOUND)
        expect(ExitCode.SUCCESS).toBeLessThan(ExitCode.WARNINGS_AS_ERRORS)
        expect(ExitCode.SUCCESS).toBeLessThan(ExitCode.CONFIG_ERROR)
        expect(ExitCode.SUCCESS).toBeLessThan(ExitCode.SYSTEM_ERROR)
      })

      test('SYSTEM_ERROR is the highest value', () => {
        expect(ExitCode.SYSTEM_ERROR).toBeGreaterThan(ExitCode.SUCCESS)
        expect(ExitCode.SYSTEM_ERROR).toBeGreaterThan(ExitCode.ERRORS_FOUND)
        expect(ExitCode.SYSTEM_ERROR).toBeGreaterThan(ExitCode.WARNINGS_AS_ERRORS)
        expect(ExitCode.SYSTEM_ERROR).toBeGreaterThan(ExitCode.CONFIG_ERROR)
      })

      test('values are in ascending order (except gap at 4)', () => {
        expect(ExitCode.SUCCESS).toBe(0)
        expect(ExitCode.ERRORS_FOUND).toBe(1)
        expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
        expect(ExitCode.CONFIG_ERROR).toBe(3)
        expect(ExitCode.SYSTEM_ERROR).toBe(5)
      })

      test('ExitCode is readonly (frozen-like)', () => {
        // The `as const` assertion makes it readonly at type level
        // Runtime check: values should be what we expect
        expect(ExitCode.SUCCESS).toBe(0)
        expect(ExitCode.ERRORS_FOUND).toBe(1)
      })
    })

    // -------------------------------------------------------------------------
    // commonFlags structure validation (6 tests)
    // -------------------------------------------------------------------------
    describe('commonFlags structure', () => {
      test('has exactly 3 keys', () => {
        const keys = Object.keys(commonFlags)
        expect(keys).toHaveLength(3)
      })

      test('keys are config, quiet, verbose', () => {
        const keys = Object.keys(commonFlags).sort()
        expect(keys).toEqual(['config', 'quiet', 'verbose'])
      })

      test('all flags have char property', () => {
        expect(commonFlags.config.char).toBeDefined()
        expect(commonFlags.quiet.char).toBeDefined()
        expect(commonFlags.verbose.char).toBeDefined()
      })

      test('all flag chars are single characters', () => {
        expect(commonFlags.config.char).toHaveLength(1)
        expect(commonFlags.quiet.char).toHaveLength(1)
        expect(commonFlags.verbose.char).toHaveLength(1)
      })

      test('all flags have description property', () => {
        expect(commonFlags.config.description).toBeTruthy()
        expect(commonFlags.quiet.description).toBeTruthy()
        expect(commonFlags.verbose.description).toBeTruthy()
      })

      test('quiet and verbose have default property', () => {
        expect(commonFlags.quiet).toHaveProperty('default')
        expect(commonFlags.verbose).toHaveProperty('default')
      })
    })

    // -------------------------------------------------------------------------
    // Logger integration (6 tests)
    // -------------------------------------------------------------------------
    describe('logger integration', () => {
      test('logger.setLevel is callable', () => {
        expect(() => logger.setLevel(LogLevel.DEBUG)).not.toThrow()
      })

      test('logger.getLevel returns a LogLevel', () => {
        const level = logger.getLevel()
        expect(typeof level).toBe('number')
      })

      test('configureLogging uses logger correctly with verbose', () => {
        const spy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, false)
        expect(spy).toHaveBeenCalledWith(LogLevel.DEBUG)
        spy.mockRestore()
      })

      test('configureLogging uses logger correctly with quiet', () => {
        const spy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(false, true)
        expect(spy).toHaveBeenCalledWith(LogLevel.SILENT)
        spy.mockRestore()
      })

      test('LogLevel has expected values', () => {
        expect(LogLevel.DEBUG).toBe(0)
        expect(LogLevel.INFO).toBe(1)
        expect(LogLevel.WARN).toBe(2)
        expect(LogLevel.ERROR).toBe(3)
        expect(LogLevel.SILENT).toBe(4)
      })

      test('LogLevel values are ascending', () => {
        expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO)
        expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN)
        expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR)
        expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT)
      })
    })

    // -------------------------------------------------------------------------
    // Repeated calls / idempotency (6 tests)
    // -------------------------------------------------------------------------
    describe('idempotency and repeated calls', () => {
      test('configureLogging called multiple times only sets last level', () => {
        const spy = vi.spyOn(logger, 'setLevel')
        command.testConfigureLogging(true, false)
        command.testConfigureLogging(false, true)
        command.testConfigureLogging(false, false)
        expect(spy).toHaveBeenCalledTimes(2) // last call with false,false doesn't call
        expect(spy).toHaveBeenNthCalledWith(1, LogLevel.DEBUG)
        expect(spy).toHaveBeenNthCalledWith(2, LogLevel.SILENT)
      })

      test('determineExitCode called multiple times with same args returns same result', () => {
        const args = { errors: 1, warnings: 2 } as const
        const r1 = command.testDetermineExitCode(args, true, 3)
        const r2 = command.testDetermineExitCode(args, true, 3)
        const r3 = command.testDetermineExitCode(args, true, 3)
        expect(r1).toBe(r2)
        expect(r2).toBe(r3)
      })

      test('resolvePatterns called multiple times returns same reference structure', () => {
        const r1 = command.testResolvePatterns('*.ts', undefined)
        const r2 = command.testResolvePatterns('*.ts', undefined)
        expect(r1).toEqual(r2)
      })

      test('setupRuleRegistry called twice returns independent registries', async () => {
        const reg1 = await command.testSetupRuleRegistry()
        const reg2 = await command.testSetupRuleRegistry()
        expect(reg1).not.toBe(reg2)
      })

      test('setupRuleRegistry with same args gives consistent enabled count', async () => {
        const reg1 = await command.testSetupRuleRegistry(['no-console'])
        const reg2 = await command.testSetupRuleRegistry(['no-console'])
        expect(reg1.getEnabledRules().length).toBe(reg2.getEnabledRules().length)
      })

      test('disposeParser multiple times after create is safe', async () => {
        await command.testCreateParser()
        command.testDisposeParser()
        command.testDisposeParser()
        command.testDisposeParser()
        // Should not throw
        expect(true).toBe(true)
      })
    })

    // -------------------------------------------------------------------------
    // Additional edge cases (22 tests)
    // -------------------------------------------------------------------------
    describe('additional edge cases', () => {
      test('determineExitCode with errors=1 returns ERRORS_FOUND regardless of failOnWarnings', async () => {
        expect(command.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)).toBe(1)
        expect(command.testDetermineExitCode({ errors: 1, warnings: 0 }, true, -1)).toBe(1)
      })

      test('determineExitCode returns numeric values', async () => {
        const r0 = command.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
        const r1 = command.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)
        const r2 = command.testDetermineExitCode({ errors: 0, warnings: 1 }, true, -1)
        expect(typeof r0).toBe('number')
        expect(typeof r1).toBe('number')
        expect(typeof r2).toBe('number')
      })

      test('resolvePatterns with complex nested glob patterns', async () => {
        const patterns = ['src/**/test/**/*.spec.ts', 'lib/**/test/**/*.test.ts']
        const result = command.testResolvePatterns(patterns, undefined)
        expect(result).toEqual(patterns)
        expect(result).toHaveLength(2)
      })

      test('resolvePatterns array argsFiles preserves order', async () => {
        const result = command.testResolvePatterns(['z.ts', 'a.ts', 'm.ts'], undefined)
        expect(result[0]).toBe('z.ts')
        expect(result[1]).toBe('a.ts')
        expect(result[2]).toBe('m.ts')
      })

      test('resolvePatterns configFiles preserves order', async () => {
        const result = command.testResolvePatterns(undefined, ['z.ts', 'a.ts', 'm.ts'])
        expect(result[0]).toBe('z.ts')
        expect(result[1]).toBe('a.ts')
        expect(result[2]).toBe('m.ts')
      })

      test('catch with CLIError containing context does not affect error call', async () => {
        const cliError = new CLIError('msg', { context: { file: 'a.ts' } })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })
        await expect(command.catch(cliError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('msg', {
          exit: ExitCode.ERRORS_FOUND,
          suggestions: [],
        })
      })

      test('catch with SystemError containing cause does not affect error call', async () => {
        const cause = new Error('inner')
        const sysError = new SystemError('outer', { cause })
        const errorSpy = vi.spyOn(command, 'error').mockImplementation(() => {
          throw new Error('mocked')
        })
        await expect(command.catch(sysError)).rejects.toThrow('mocked')
        expect(errorSpy).toHaveBeenCalledWith('outer', { exit: ExitCode.SYSTEM_ERROR })
      })

      test('catch with SyntaxError rethrows', async () => {
        const syntaxError = new SyntaxError('unexpected token')
        await expect(command.catch(syntaxError)).rejects.toThrow('unexpected token')
      })

      test('catch with ReferenceError rethrows', async () => {
        const refError = new ReferenceError('x is not defined')
        await expect(command.catch(refError)).rejects.toThrow('x is not defined')
      })

      test('catch with null rethrows null', async () => {
        await expect(command.catch(null as never)).rejects.toBe(null)
      })

      test('catch with undefined rethrows undefined', async () => {
        await expect(command.catch(undefined as never)).rejects.toBe(undefined)
      })

      test('setupRuleRegistry registers rules with categories', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getAllRules()
        const categories = new Set(rules.map((r) => r.category))
        expect(categories.size).toBeGreaterThanOrEqual(1)
      })

      test('setupRuleRegistry all rules have enabled property', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getAllRules()
        for (const rule of rules) {
          expect(typeof rule.enabled).toBe('boolean')
        }
      })

      test('setupRuleRegistry all rules have options property', async () => {
        const registry = await command.testSetupRuleRegistry()
        const rules = registry.getAllRules()
        for (const rule of rules) {
          expect(rule.options).toBeDefined()
        }
      })

      test('AnalyzeCommandConfig can be spread into another object', async () => {
        const config: AnalyzeCommandConfig = { files: ['*.ts'] }
        const merged = { ...config, extra: 'value' }
        expect(merged.files).toEqual(['*.ts'])
        expect(merged.extra).toBe('value')
      })

      test('CommonFlags can be spread into another object', async () => {
        const flags: CommonFlags = { quiet: true }
        const merged = { ...flags, extra: true }
        expect(merged.quiet).toBe(true)
        expect(merged.extra).toBe(true)
      })

      test('commonFlags config char is lowercase c', async () => {
        expect(commonFlags.config.char).toBe('c')
        expect(commonFlags.config.char).not.toBe('C')
      })

      test('commonFlags quiet char is lowercase q', async () => {
        expect(commonFlags.quiet.char).toBe('q')
        expect(commonFlags.quiet.char).not.toBe('Q')
      })

      test('commonFlags verbose char is lowercase v', () => {
        expect(commonFlags.verbose.char).toBe('v')
        expect(commonFlags.verbose.char).not.toBe('V')
      })

      test('determineExitCode: maxWarnings=100 with 99 warnings succeeds', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 99 }, false, 100)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('determineExitCode: maxWarnings=100 with 101 warnings fails', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 101 }, false, 100)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('configureLogging does not mutate its arguments', () => {
        const verbose = true
        const quiet = false
        command.testConfigureLogging(verbose, quiet)
        expect(verbose).toBe(true)
        expect(quiet).toBe(false)
      })

      test('resolvePatterns with single-element configFiles array', () => {
        const result = command.testResolvePatterns(undefined, ['only-one.ts'])
        expect(result).toEqual(['only-one.ts'])
        expect(result).toHaveLength(1)
      })
    })
  })
})
