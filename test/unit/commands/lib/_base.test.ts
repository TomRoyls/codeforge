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

  public testSetupRuleRegistry(requestedRules?: string[]) {
    return this.setupRuleRegistry(requestedRules)
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

  describe('ExitCode enum', () => {
    test('has correct exit codes', () => {
      expect(ExitCode.SUCCESS).toBe(0)
      expect(ExitCode.ERRORS_FOUND).toBe(1)
      expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
      expect(ExitCode.CONFIG_ERROR).toBe(3)
      expect(ExitCode.SYSTEM_ERROR).toBe(5)
    })
  })

  describe('AnalyzeCommandConfig interface', () => {
    test('has optional properties', () => {
      const config: AnalyzeCommandConfig = {}
      expect(config.config).toBeUndefined()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
    })

    test('can have all properties', () => {
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

  describe('CommonFlags interface', () => {
    test('has optional properties', () => {
      const flags: CommonFlags = {}
      expect(flags.config).toBeUndefined()
      expect(flags.files).toBeUndefined()
      expect(flags.ignore).toBeUndefined()
      expect(flags.quiet).toBeUndefined()
      expect(flags.verbose).toBeUndefined()
    })
  })

  describe('commonFlags constant', () => {
    test('has config flag', () => {
      expect(commonFlags.config).toBeDefined()
      expect(commonFlags.config.char).toBe('c')
    })

    test('has quiet flag', () => {
      expect(commonFlags.quiet).toBeDefined()
      expect(commonFlags.quiet.char).toBe('q')
      expect(commonFlags.quiet.default).toBe(false)
    })

    test('has verbose flag', () => {
      expect(commonFlags.verbose).toBeDefined()
      expect(commonFlags.verbose.char).toBe('v')
      expect(commonFlags.verbose.default).toBe(false)
    })
  })

  describe('BaseCommand', () => {
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
    })

    describe('determineExitCode', () => {
      test('returns SUCCESS when no errors or warnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

      test('returns ERRORS_FOUND when errors exist', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns ERRORS_FOUND when multiple errors exist', () => {
        const result = command.testDetermineExitCode({ errors: 5, warnings: 10 }, false, -1)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('returns WARNINGS_AS_ERRORS when failOnWarnings is true and warnings exist', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 1 }, true, -1)
        expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
      })

      test('returns SUCCESS when failOnWarnings is true but no warnings', () => {
        const result = command.testDetermineExitCode({ errors: 0, warnings: 0 }, true, -1)
        expect(result).toBe(ExitCode.SUCCESS)
      })

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

      test('prioritizes errors over warnings', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 0 }, true, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })

      test('prioritizes errors over maxWarnings', () => {
        const result = command.testDetermineExitCode({ errors: 1, warnings: 100 }, false, 0)
        expect(result).toBe(ExitCode.ERRORS_FOUND)
      })
    })

    describe('resolvePatterns', () => {
      test('returns array from single string argsFiles', () => {
        const result = command.testResolvePatterns('src/**/*.ts', undefined)
        expect(result).toEqual(['src/**/*.ts'])
      })

      test('returns array from array argsFiles', () => {
        const result = command.testResolvePatterns(['src/**/*.ts', 'lib/**/*.ts'], undefined)
        expect(result).toEqual(['src/**/*.ts', 'lib/**/*.ts'])
      })

      test('returns configFiles when argsFiles is undefined', () => {
        const result = command.testResolvePatterns(undefined, ['config/**/*.ts'])
        expect(result).toEqual(['config/**/*.ts'])
      })

      test('prioritizes argsFiles over configFiles', () => {
        const result = command.testResolvePatterns('args/**/*.ts', ['config/**/*.ts'])
        expect(result).toEqual(['args/**/*.ts'])
      })

      test('returns empty array when both are undefined', () => {
        const result = command.testResolvePatterns(undefined, undefined)
        expect(result).toEqual([])
      })

      test('returns empty array when configFiles is empty', () => {
        const result = command.testResolvePatterns(undefined, [])
        expect(result).toEqual([])
      })
    })

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

      test('handles CLIError without suggestions', async () => {
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

      test('rethrows other errors', async () => {
        const genericError = new Error('Generic error')

        await expect(command.catch(genericError)).rejects.toThrow('Generic error')
      })

      test('rethrows non-Error objects', async () => {
        const stringError = 'string error'

        await expect(command.catch(stringError as never)).rejects.toBe('string error')
      })
    })

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
    })

    describe('setupRuleRegistry', () => {
      test('creates registry with all rules', () => {
        const registry = command.testSetupRuleRegistry()
        expect(registry).toBeDefined()
      })

      test('enables all rules by default', () => {
        const registry = command.testSetupRuleRegistry()
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })

      test('filters to specific rules when requested', () => {
        const registry = command.testSetupRuleRegistry(['no-console-log', 'no-eval'])
        const consoleLogRule = registry.getRule('no-console-log')
        const evalRule = registry.getRule('no-eval')
        expect(consoleLogRule?.enabled).toBe(true)
        expect(evalRule?.enabled).toBe(true)
      })

      test('logs warning for unknown rules', () => {
        const warnSpy = vi.spyOn(logger, 'warn')
        command.testSetupRuleRegistry(['unknown-rule-xyz'])
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-rule-xyz'))
      })

      test('handles empty requested rules array', () => {
        const registry = command.testSetupRuleRegistry([])
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })

      test('handles undefined requested rules', () => {
        const registry = command.testSetupRuleRegistry(undefined)
        const rules = registry.getEnabledRules()
        expect(rules.length).toBeGreaterThan(0)
      })
    })
  })
})
