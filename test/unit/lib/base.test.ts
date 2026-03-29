import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExitCode, commonFlags, BaseCommand } from '../../../src/lib/base.js'
import { CLIError, SystemError } from '../../../src/utils/errors.js'
import { logger, LogLevel } from '../../../src/utils/logger.js'

vi.mock('../../../src/config/cache.js', () => ({
  ConfigCache: class {
    getConfig = vi.fn().mockResolvedValue({ files: ['src/**/*.ts'] })
  },
}))

vi.mock('../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn().mockResolvedValue('/project/.codeforgerc.json'),
}))

vi.mock('../../../src/config/env-parser.js', () => ({
  parseEnvVars: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((a, b) => ({ ...a, ...b })),
  mergeEnvConfig: vi.fn((a) => a),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    dispose = vi.fn()
  },
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: class {
    register = vi.fn()
    disable = vi.fn()
  },
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'test-rule': { id: 'test-rule', meta: { name: 'Test Rule' } },
  },
  getRuleCategory: vi.fn().mockReturnValue('best-practices'),
}))

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
  public async run(): Promise<void> {
    return Promise.resolve()
  }

  public async testCatch(error: Error): Promise<void> {
    return this.catch(error)
  }

  public testConfigureLogging(verbose: boolean, quiet: boolean): void {
    return this.configureLogging(verbose, quiet)
  }

  public async testCreateParser() {
    return this.createParser()
  }

  public async testLoadConfig(flags: { config?: string; files?: string[]; ignore?: string[] }) {
    return this.loadConfig(flags)
  }

  public testSetupRuleRegistry(requestedRules?: string[]) {
    return this.setupRuleRegistry(requestedRules)
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
}

describe('TestableBaseCommand', () => {
  let cmd: TestableBaseCommand
  let originalLevel: LogLevel

  beforeEach(() => {
    cmd = new TestableBaseCommand([], {} as never)
    originalLevel = logger.getLevel()
  })

  afterEach(() => {
    logger.setLevel(originalLevel)
    vi.clearAllMocks()
  })

  describe('configureLogging', () => {
    test('should set DEBUG level when verbose is true', () => {
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    })

    test('should set SILENT level when quiet is true', () => {
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
    })

    test('should prefer verbose over quiet', () => {
      cmd.testConfigureLogging(true, true)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    })

    test('should not change level when both are false', () => {
      const initialLevel = logger.getLevel()
      cmd.testConfigureLogging(false, false)
      expect(logger.getLevel()).toBe(initialLevel)
    })
  })

  describe('createParser', () => {
    test('should create and initialize parser', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser).toBeDefined()
    })
  })

  describe('catch', () => {
    test('should handle CLIError with suggestions', async () => {
      const cliError = new CLIError('Test error', ['suggestion 1', 'suggestion 2'])
      vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      await expect(cmd.testCatch(cliError)).rejects.toThrow('mocked')
    })

    test('should handle SystemError', async () => {
      const sysError = new SystemError('System error')
      vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked system')
      })

      await expect(cmd.testCatch(sysError)).rejects.toThrow('mocked system')
    })

    test('should rethrow non-CLIError/SystemError errors', async () => {
      const genericError = new Error('Generic error')

      await expect(cmd.testCatch(genericError)).rejects.toThrow('Generic error')
    })
  })

  describe('loadConfig', () => {
    test('should load config from file when found', async () => {
      const config = await cmd.testLoadConfig({ config: '.codeforgerc.json' })
      expect(config).toBeDefined()
    })

    test('should return merged config when no config file found', async () => {
      vi.mocked(
        await import('../../../src/config/discovery.js'),
      ).findConfigPath.mockResolvedValueOnce(null)
      const config = await cmd.testLoadConfig({})
      expect(config).toBeDefined()
    })

    test('should merge CLI flags with config', async () => {
      const config = await cmd.testLoadConfig({
        files: ['*.ts'],
        ignore: ['node_modules'],
      })
      expect(config).toBeDefined()
    })
  })

  describe('setupRuleRegistry', () => {
    test('should register all rules when no filter', () => {
      const registry = cmd.testSetupRuleRegistry()
      expect(registry).toBeDefined()
    })

    test('should filter to requested rules', () => {
      const registry = cmd.testSetupRuleRegistry(['test-rule'])
      expect(registry).toBeDefined()
    })

    test('should warn on unknown rules', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      cmd.testSetupRuleRegistry(['unknown-rule'])
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown rules'))
    })
  })

  describe('determineExitCode', () => {
    test('should return ERRORS_FOUND when there are errors', () => {
      const result = cmd.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return ERRORS_FOUND when errors exist regardless of warnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 2, warnings: 10 }, true, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return WARNINGS_AS_ERRORS when failOnWarnings=true and warnings>0', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 5 }, true, -1)
      expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
    })

    test('should return ERRORS_FOUND when warnings exceed maxWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 10 }, false, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return SUCCESS when no errors or warnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return SUCCESS when no errors and warnings within maxWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 3 }, false, 5)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return ERRORS_FOUND when warnings equal maxWarnings+1', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 6 }, false, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return SUCCESS when warnings equal maxWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 5 }, false, 5)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return ERRORS_FOUND when maxWarnings is 0 and warnings>0', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 1 }, false, 0)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should ignore maxWarnings when negative', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 100 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })
  })

  describe('resolvePatterns', () => {
    test('should return argsFiles as array when provided as array', () => {
      const result = cmd.testResolvePatterns(['foo.ts', 'bar.ts'], undefined)
      expect(result).toEqual(['foo.ts', 'bar.ts'])
    })

    test('should return argsFiles as single-item array when string provided', () => {
      const result = cmd.testResolvePatterns('single.ts', undefined)
      expect(result).toEqual(['single.ts'])
    })

    test('should return configFiles when argsFiles is undefined', () => {
      const result = cmd.testResolvePatterns(undefined, ['config.ts'])
      expect(result).toEqual(['config.ts'])
    })

    test('should return empty array when both are undefined', () => {
      const result = cmd.testResolvePatterns(undefined, undefined)
      expect(result).toEqual([])
    })

    test('should prefer argsFiles over configFiles', () => {
      const result = cmd.testResolvePatterns('args.ts', ['config.ts'])
      expect(result).toEqual(['args.ts'])
    })
  })
})
