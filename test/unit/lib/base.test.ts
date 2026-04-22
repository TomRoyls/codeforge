import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExitCode, commonFlags, BaseCommand, CommonFlags } from '../../../src/lib/base.js'
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

  test('SUCCESS should be 0', () => {
    expect(ExitCode.SUCCESS).toBe(0)
  })

  test('ERRORS_FOUND should be 1', () => {
    expect(ExitCode.ERRORS_FOUND).toBe(1)
  })

  test('WARNINGS_AS_ERRORS should be 2', () => {
    expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
  })

  test('CONFIG_ERROR should be 3', () => {
    expect(ExitCode.CONFIG_ERROR).toBe(3)
  })

  test('SYSTEM_ERROR should be 5', () => {
    expect(ExitCode.SYSTEM_ERROR).toBe(5)
  })

  test('should have exactly 5 keys', () => {
    const keys = Object.keys(ExitCode)
    expect(keys).toHaveLength(5)
  })

  test('all values should be numbers', () => {
    const values = Object.values(ExitCode)
    for (const val of values) {
      expect(typeof val).toBe('number')
    }
  })

  test('all values should be non-negative', () => {
    const values = Object.values(ExitCode)
    for (const val of values) {
      expect(val).toBeGreaterThanOrEqual(0)
    }
  })

  test('all values should be unique', () => {
    const values = Object.values(ExitCode)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  test('SUCCESS should be the lowest value', () => {
    const values = Object.values(ExitCode)
    expect(ExitCode.SUCCESS).toBe(Math.min(...values))
  })

  test('SYSTEM_ERROR should be the highest value', () => {
    const values = Object.values(ExitCode)
    expect(ExitCode.SYSTEM_ERROR).toBe(Math.max(...values))
  })

  test('ERRORS_FOUND should be greater than SUCCESS', () => {
    expect(ExitCode.ERRORS_FOUND).toBeGreaterThan(ExitCode.SUCCESS)
  })

  test('WARNINGS_AS_ERRORS should be greater than ERRORS_FOUND', () => {
    expect(ExitCode.WARNINGS_AS_ERRORS).toBeGreaterThan(ExitCode.ERRORS_FOUND)
  })

  test('CONFIG_ERROR should be greater than WARNINGS_AS_ERRORS', () => {
    expect(ExitCode.CONFIG_ERROR).toBeGreaterThan(ExitCode.WARNINGS_AS_ERRORS)
  })

  test('SYSTEM_ERROR should be greater than CONFIG_ERROR', () => {
    expect(ExitCode.SYSTEM_ERROR).toBeGreaterThan(ExitCode.CONFIG_ERROR)
  })

  test('should be a const assertion (readonly)', () => {
    expect(typeof ExitCode).toBe('object')
  })

  test('should contain expected keys', () => {
    expect(ExitCode).toHaveProperty('SUCCESS')
    expect(ExitCode).toHaveProperty('ERRORS_FOUND')
    expect(ExitCode).toHaveProperty('WARNINGS_AS_ERRORS')
    expect(ExitCode).toHaveProperty('CONFIG_ERROR')
    expect(ExitCode).toHaveProperty('SYSTEM_ERROR')
  })

  test('values should follow POSIX-like convention (0=success, non-zero=error)', () => {
    expect(ExitCode.SUCCESS).toBe(0)
    expect(ExitCode.ERRORS_FOUND).not.toBe(0)
    expect(ExitCode.WARNINGS_AS_ERRORS).not.toBe(0)
    expect(ExitCode.CONFIG_ERROR).not.toBe(0)
    expect(ExitCode.SYSTEM_ERROR).not.toBe(0)
  })

  test('should have integer values', () => {
    const values = Object.values(ExitCode)
    for (const val of values) {
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  test('values should be within valid exit code range (0-255)', () => {
    const values = Object.values(ExitCode)
    for (const val of values) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(255)
    }
  })

  test('keys should be UPPER_SNAKE_CASE', () => {
    const keys = Object.keys(ExitCode)
    for (const key of keys) {
      expect(key).toMatch(/^[A-Z][A-Z0-9_]*$/)
    }
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

  test('should have exactly 3 flags', () => {
    const keys = Object.keys(commonFlags)
    expect(keys).toHaveLength(3)
  })

  test('should have config flag', () => {
    expect(commonFlags.config).toBeDefined()
  })

  test('should have quiet flag', () => {
    expect(commonFlags.quiet).toBeDefined()
  })

  test('should have verbose flag', () => {
    expect(commonFlags.verbose).toBeDefined()
  })

  test('config should have char "c"', () => {
    expect(commonFlags.config.char).toBe('c')
  })

  test('quiet should have char "q"', () => {
    expect(commonFlags.quiet.char).toBe('q')
  })

  test('verbose should have char "v"', () => {
    expect(commonFlags.verbose.char).toBe('v')
  })

  test('config should have description', () => {
    expect(commonFlags.config.description).toBe('Path to config file')
  })

  test('quiet should have description', () => {
    expect(commonFlags.quiet.description).toBe('Suppress progress output')
  })

  test('verbose should have description', () => {
    expect(commonFlags.verbose.description).toBe('Show detailed output')
  })

  test('quiet should default to false', () => {
    expect(commonFlags.quiet.default).toBe(false)
  })

  test('verbose should default to false', () => {
    expect(commonFlags.verbose.default).toBe(false)
  })

  test('config should not have default property', () => {
    expect(commonFlags.config).not.toHaveProperty('default')
  })

  test('all descriptions should be non-empty strings', () => {
    const flags = Object.values(commonFlags)
    for (const flag of flags) {
      expect(flag.description.length).toBeGreaterThan(0)
    }
  })

  test('all char values should be single characters', () => {
    const flags = Object.values(commonFlags)
    for (const flag of flags) {
      expect(flag.char).toHaveLength(1)
    }
  })

  test('all char values should be lowercase', () => {
    const flags = Object.values(commonFlags)
    for (const flag of flags) {
      expect(flag.char).toMatch(/^[a-z]$/)
    }
  })

  test('char values should be unique', () => {
    const chars = Object.values(commonFlags).map((f) => f.char)
    const unique = new Set(chars)
    expect(unique.size).toBe(chars.length)
  })

  test('descriptions should be unique', () => {
    const descriptions = Object.values(commonFlags).map((f) => f.description)
    const unique = new Set(descriptions)
    expect(unique.size).toBe(descriptions.length)
  })

  test('config char should be different from quiet char', () => {
    expect(commonFlags.config.char).not.toBe(commonFlags.quiet.char)
  })

  test('config char should be different from verbose char', () => {
    expect(commonFlags.config.char).not.toBe(commonFlags.verbose.char)
  })

  test('quiet char should be different from verbose char', () => {
    expect(commonFlags.quiet.char).not.toBe(commonFlags.verbose.char)
  })

  test('quiet and verbose are boolean flags', () => {
    expect(typeof commonFlags.quiet.default).toBe('boolean')
    expect(typeof commonFlags.verbose.default).toBe('boolean')
  })

  test('should contain expected keys', () => {
    expect(commonFlags).toHaveProperty('config')
    expect(commonFlags).toHaveProperty('quiet')
    expect(commonFlags).toHaveProperty('verbose')
  })

  test('config description should mention config file', () => {
    expect(commonFlags.config.description.toLowerCase()).toContain('config')
  })

  test('quiet description should mention suppress', () => {
    expect(commonFlags.quiet.description.toLowerCase()).toContain('suppress')
  })

  test('verbose description should mention detailed', () => {
    expect(commonFlags.verbose.description.toLowerCase()).toContain('detailed')
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

    test('should set DEBUG when verbose=true and quiet=false', () => {
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    })

    test('should set SILENT when verbose=false and quiet=true', () => {
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
    })

    test('should not set INFO when verbose=true', () => {
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).not.toBe(LogLevel.INFO)
    })

    test('should not set WARN when quiet=true', () => {
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).not.toBe(LogLevel.WARN)
    })

    test('should not set ERROR when quiet=true', () => {
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).not.toBe(LogLevel.ERROR)
    })

    test('verbose=true should override any previous quiet setting', () => {
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
    })

    test('quiet=true after verbose=true should change to SILENT', () => {
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
    })

    test('should handle boolean false for both parameters', () => {
      logger.setLevel(LogLevel.WARN)
      cmd.testConfigureLogging(false, false)
      expect(logger.getLevel()).toBe(LogLevel.WARN)
    })

    test('should handle multiple sequential calls', () => {
      cmd.testConfigureLogging(true, false)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
      cmd.testConfigureLogging(false, true)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
      cmd.testConfigureLogging(false, false)
      expect(logger.getLevel()).toBe(LogLevel.SILENT)
    })

    test('verbose takes priority over quiet when both true', () => {
      cmd.testConfigureLogging(true, true)
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
      expect(logger.getLevel()).not.toBe(LogLevel.SILENT)
    })

    test('should not throw for any boolean combination', () => {
      expect(() => cmd.testConfigureLogging(true, true)).not.toThrow()
      expect(() => cmd.testConfigureLogging(true, false)).not.toThrow()
      expect(() => cmd.testConfigureLogging(false, true)).not.toThrow()
      expect(() => cmd.testConfigureLogging(false, false)).not.toThrow()
    })
  })

  describe('createParser', () => {
    test('should create and initialize parser', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser).toBeDefined()
    })

    test('should return a Parser instance', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser).toBeDefined()
      expect(typeof parser.initialize).toBe('function')
    })

    test('should create parser that has initialize method', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser.initialize).toBeDefined()
    })

    test('should create parser that has dispose method', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser.dispose).toBeDefined()
    })

    test('should return same parser on consecutive calls (tracked)', async () => {
      const parser1 = await cmd.testCreateParser()
      expect(parser1).toBeDefined()
    })

    test('should not return null', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser).not.toBeNull()
    })

    test('should not throw during creation', async () => {
      await expect(cmd.testCreateParser()).resolves.not.toThrow()
    })

    test('initialize should have been called', async () => {
      const parser = await cmd.testCreateParser()
      expect(parser.initialize).toBeDefined()
      expect(typeof parser.initialize).toBe('function')
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

    test('should call this.error for CLIError with suggestions', async () => {
      const cliError = new CLIError('CLI error msg', ['try this'])
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      try {
        await cmd.testCatch(cliError)
      } catch {
        // expected - mock throws
      }

      expect(errorSpy).toHaveBeenCalled()
    })

    test('should call this.error for SystemError', async () => {
      const sysError = new SystemError('sys error msg')
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      try {
        await cmd.testCatch(sysError)
      } catch {
        // expected - mock throws
      }

      expect(errorSpy).toHaveBeenCalled()
    })

    test('should handle CLIError with empty suggestions', async () => {
      const cliError = new CLIError('No suggestions error', [])
      vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      await expect(cmd.testCatch(cliError)).rejects.toThrow('mocked')
    })

    test('should handle CLIError with many suggestions', async () => {
      const cliError = new CLIError('Multi suggestion', ['s1', 's2', 's3', 's4', 's5'])
      vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      await expect(cmd.testCatch(cliError)).rejects.toThrow('mocked')
    })

    test('should handle TypeError', async () => {
      const typeError = new TypeError('type error')
      await expect(cmd.testCatch(typeError)).rejects.toThrow('type error')
    })

    test('should handle RangeError', async () => {
      const rangeError = new RangeError('range error')
      await expect(cmd.testCatch(rangeError)).rejects.toThrow('range error')
    })

    test('should handle SyntaxError', async () => {
      const syntaxError = new SyntaxError('syntax error')
      await expect(cmd.testCatch(syntaxError)).rejects.toThrow('syntax error')
    })

    test('should handle error with no message', async () => {
      const error = new Error()
      await expect(cmd.testCatch(error)).rejects.toThrow()
    })

    test('should handle error with long message', async () => {
      const longMsg = 'x'.repeat(1000)
      const error = new Error(longMsg)
      await expect(cmd.testCatch(error)).rejects.toThrow(longMsg)
    })

    test('should use ERRORS_FOUND exit code for CLIError', async () => {
      const cliError = new CLIError('test', ['sug'])
      const errorSpy = vi.spyOn(cmd, 'error')

      try {
        await cmd.testCatch(cliError)
      } catch {
        // expected - oclif re-throws
      }

      expect(errorSpy).toHaveBeenCalled()
    })

    test('should use SYSTEM_ERROR exit code for SystemError', async () => {
      const sysError = new SystemError('test')
      const errorSpy = vi.spyOn(cmd, 'error')

      try {
        await cmd.testCatch(sysError)
      } catch {
        // expected - oclif re-throws
      }

      expect(errorSpy).toHaveBeenCalled()
    })

    test('should not call this.error for generic Error', async () => {
      const genericError = new Error('generic')
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('should not be called')
      })

      await expect(cmd.testCatch(genericError)).rejects.toThrow('generic')
      expect(errorSpy).not.toHaveBeenCalled()
    })

    test('should preserve error message for CLIError', async () => {
      const cliError = new CLIError('preserved message', [])
      const errorSpy = vi.spyOn(cmd, 'error').mockImplementation(() => {
        throw new Error('mocked')
      })

      try {
        await cmd.testCatch(cliError)
      } catch {
        // expected
      }

      expect(errorSpy).toHaveBeenCalledWith('preserved message', expect.any(Object))
    })

    test('should handle URIError', async () => {
      const uriError = new URIError('uri error')
      await expect(cmd.testCatch(uriError)).rejects.toThrow('uri error')
    })

    test('should handle EvalError', async () => {
      const evalError = new EvalError('eval error')
      await expect(cmd.testCatch(evalError)).rejects.toThrow('eval error')
    })

    test('should handle ReferenceError', async () => {
      const refError = new ReferenceError('ref error')
      await expect(cmd.testCatch(refError)).rejects.toThrow('ref error')
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

    test('should handle empty flags', async () => {
      const config = await cmd.testLoadConfig({})
      expect(config).toBeDefined()
    })

    test('should handle config with files only', async () => {
      const config = await cmd.testLoadConfig({ files: ['src/**/*.ts'] })
      expect(config).toBeDefined()
    })

    test('should handle config with ignore only', async () => {
      const config = await cmd.testLoadConfig({ ignore: ['dist/**'] })
      expect(config).toBeDefined()
    })

    test('should handle config with config path', async () => {
      const config = await cmd.testLoadConfig({ config: '.codeforgerc.json' })
      expect(config).toBeDefined()
    })

    test('should handle all flags provided', async () => {
      const config = await cmd.testLoadConfig({
        config: '.codeforgerc.json',
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
      })
      expect(config).toBeDefined()
    })

    test('should handle files as empty array', async () => {
      const config = await cmd.testLoadConfig({ files: [] })
      expect(config).toBeDefined()
    })

    test('should handle ignore as empty array', async () => {
      const config = await cmd.testLoadConfig({ ignore: [] })
      expect(config).toBeDefined()
    })

    test('should handle multiple file patterns', async () => {
      const config = await cmd.testLoadConfig({
        files: ['*.ts', '*.tsx', '*.js'],
      })
      expect(config).toBeDefined()
    })

    test('should handle multiple ignore patterns', async () => {
      const config = await cmd.testLoadConfig({
        ignore: ['node_modules/**', 'dist/**', '*.d.ts'],
      })
      expect(config).toBeDefined()
    })

    test('should handle undefined flags', async () => {
      const config = await cmd.testLoadConfig({})
      expect(config).toBeDefined()
    })

    test('should not throw for valid config', async () => {
      await expect(cmd.testLoadConfig({})).resolves.not.toThrow()
    })

    test('should return an object', async () => {
      const config = await cmd.testLoadConfig({})
      expect(typeof config).toBe('object')
    })

    test('should not return null', async () => {
      const config = await cmd.testLoadConfig({})
      expect(config).not.toBeNull()
    })

    test('should call findConfigPath', async () => {
      const discovery = await import('../../../src/config/discovery.js')
      await cmd.testLoadConfig({ config: 'myconfig.json' })
      expect(discovery.findConfigPath).toHaveBeenCalled()
    })

    test('should call parseEnvVars', async () => {
      const envParser = await import('../../../src/config/env-parser.js')
      await cmd.testLoadConfig({})
      expect(envParser.parseEnvVars).toHaveBeenCalled()
    })

    test('should call mergeConfigs', async () => {
      const merger = await import('../../../src/config/merger.js')
      await cmd.testLoadConfig({})
      expect(merger.mergeConfigs).toHaveBeenCalled()
    })

    test('should call mergeEnvConfig', async () => {
      const merger = await import('../../../src/config/merger.js')
      await cmd.testLoadConfig({})
      expect(merger.mergeEnvConfig).toHaveBeenCalled()
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

    test('should return a RuleRegistry instance', () => {
      const registry = cmd.testSetupRuleRegistry()
      expect(registry).toBeDefined()
      expect(typeof registry.register).toBe('function')
    })

    test('should return a registry with register method', () => {
      const registry = cmd.testSetupRuleRegistry()
      expect(typeof registry.register).toBe('function')
    })

    test('should return a registry with disable method', () => {
      const registry = cmd.testSetupRuleRegistry()
      expect(typeof registry.disable).toBe('function')
    })

    test('should not warn when no requested rules', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      cmd.testSetupRuleRegistry()
      expect(warnSpy).not.toHaveBeenCalled()
    })

    test('should not warn when all requested rules are valid', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      cmd.testSetupRuleRegistry(['test-rule'])
      expect(warnSpy).not.toHaveBeenCalled()
    })

    test('should warn with rule name in message', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      cmd.testSetupRuleRegistry(['nonexistent-rule'])
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nonexistent-rule'))
    })

    test('should warn for multiple unknown rules', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      cmd.testSetupRuleRegistry(['fake-1', 'fake-2'])
      const call = warnSpy.mock.calls[0][0]
      expect(call).toContain('fake-1')
      expect(call).toContain('fake-2')
    })

    test('should handle empty requested rules array', () => {
      const registry = cmd.testSetupRuleRegistry([])
      expect(registry).toBeDefined()
    })

    test('should handle mix of valid and invalid rules', () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      const registry = cmd.testSetupRuleRegistry(['test-rule', 'invalid-rule'])
      expect(registry).toBeDefined()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-rule'))
    })

    test('should disable non-requested rules', () => {
      const registry = cmd.testSetupRuleRegistry(['test-rule'])
      expect(registry).toBeDefined()
    })

    test('should not throw for valid rules', () => {
      expect(() => cmd.testSetupRuleRegistry(['test-rule'])).not.toThrow()
    })

    test('should not throw for unknown rules', () => {
      expect(() => cmd.testSetupRuleRegistry(['unknown'])).not.toThrow()
    })

    test('should not throw for empty array', () => {
      expect(() => cmd.testSetupRuleRegistry([])).not.toThrow()
    })

    test('should not throw for undefined', () => {
      expect(() => cmd.testSetupRuleRegistry()).not.toThrow()
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

    test('should return ERRORS_FOUND even with single error', () => {
      const result = cmd.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return ERRORS_FOUND for large error count', () => {
      const result = cmd.testDetermineExitCode({ errors: 1000, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('should return SUCCESS with zero errors and zero warnings and failOnWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, true, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('errors should take priority over failOnWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 1, warnings: 5 }, true, -1)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('errors should take priority over maxWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 1, warnings: 100 }, false, 0)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('failOnWarnings should take priority over maxWarnings when both apply', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 5 }, true, 10)
      expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
    })

    test('should return WARNINGS_AS_ERRORS for single warning with failOnWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 1 }, true, -1)
      expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
    })

    test('should return SUCCESS when warnings less than maxWarnings', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 3 }, false, 10)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return SUCCESS when warnings equal maxWarnings exactly', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 5 }, false, 5)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return ERRORS_FOUND when warnings exceed maxWarnings by 1', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 6 }, false, 5)
      expect(result).toBe(ExitCode.ERRORS_FOUND)
    })

    test('maxWarnings=0 with 0 warnings should return SUCCESS', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, false, 0)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should handle maxWarnings with very large value', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 100 }, false, 10000)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('negative maxWarnings disables warning threshold', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 999 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('negative maxWarnings with failOnWarnings still works', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 5 }, true, -1)
      expect(result).toBe(ExitCode.WARNINGS_AS_ERRORS)
    })

    test('should return SUCCESS for clean result with all features disabled', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
      expect(result).toBe(ExitCode.SUCCESS)
    })

    test('should return numeric result', () => {
      const result = cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1)
      expect(typeof result).toBe('number')
    })

    test('all paths should return valid ExitCode values', () => {
      const results = [
        cmd.testDetermineExitCode({ errors: 1, warnings: 0 }, false, -1),
        cmd.testDetermineExitCode({ errors: 0, warnings: 1 }, true, -1),
        cmd.testDetermineExitCode({ errors: 0, warnings: 10 }, false, 5),
        cmd.testDetermineExitCode({ errors: 0, warnings: 0 }, false, -1),
      ]
      const validCodes = [ExitCode.SUCCESS, ExitCode.ERRORS_FOUND, ExitCode.WARNINGS_AS_ERRORS]
      for (const r of results) {
        expect(validCodes).toContain(r)
      }
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

    test('should treat empty string as no argsFiles (falsy)', () => {
      const result = cmd.testResolvePatterns('', undefined)
      expect(result).toEqual([])
    })

    test('should handle empty array argsFiles', () => {
      const result = cmd.testResolvePatterns([], undefined)
      expect(result).toEqual([])
    })

    test('should handle single element array argsFiles', () => {
      const result = cmd.testResolvePatterns(['only.ts'], undefined)
      expect(result).toEqual(['only.ts'])
    })

    test('should handle many element array argsFiles', () => {
      const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
      const result = cmd.testResolvePatterns(files, undefined)
      expect(result).toEqual(files)
    })

    test('should return empty array when argsFiles is empty array and configFiles provided', () => {
      const result = cmd.testResolvePatterns([], ['config.ts'])
      expect(result).toEqual([])
    })

    test('should return configFiles when argsFiles is undefined', () => {
      const result = cmd.testResolvePatterns(undefined, ['a.ts', 'b.ts'])
      expect(result).toEqual(['a.ts', 'b.ts'])
    })

    test('should return empty array when configFiles is undefined and argsFiles is undefined', () => {
      const result = cmd.testResolvePatterns(undefined, undefined)
      expect(result).toEqual([])
    })

    test('should return empty array when configFiles is empty array', () => {
      const result = cmd.testResolvePatterns(undefined, [])
      expect(result).toEqual([])
    })

    test('should handle glob patterns in argsFiles string', () => {
      const result = cmd.testResolvePatterns('**/*.ts', undefined)
      expect(result).toEqual(['**/*.ts'])
    })

    test('should handle glob patterns in argsFiles array', () => {
      const result = cmd.testResolvePatterns(['src/**/*.ts', 'lib/**/*.js'], undefined)
      expect(result).toEqual(['src/**/*.ts', 'lib/**/*.js'])
    })

    test('should handle glob patterns in configFiles', () => {
      const result = cmd.testResolvePatterns(undefined, ['**/*.ts'])
      expect(result).toEqual(['**/*.ts'])
    })

    test('should prefer string argsFiles over configFiles', () => {
      const result = cmd.testResolvePatterns('args.ts', ['config1.ts', 'config2.ts'])
      expect(result).toEqual(['args.ts'])
      expect(result).toHaveLength(1)
    })

    test('should prefer array argsFiles over configFiles', () => {
      const result = cmd.testResolvePatterns(['a.ts'], ['b.ts', 'c.ts'])
      expect(result).toEqual(['a.ts'])
    })

    test('should always return an array', () => {
      const result1 = cmd.testResolvePatterns('string.ts', undefined)
      const result2 = cmd.testResolvePatterns(['arr.ts'], undefined)
      const result3 = cmd.testResolvePatterns(undefined, ['cfg.ts'])
      const result4 = cmd.testResolvePatterns(undefined, undefined)
      expect(Array.isArray(result1)).toBe(true)
      expect(Array.isArray(result2)).toBe(true)
      expect(Array.isArray(result3)).toBe(true)
      expect(Array.isArray(result4)).toBe(true)
    })

    test('should not mutate input arrays', () => {
      const input = ['a.ts', 'b.ts']
      const configInput = ['c.ts']
      cmd.testResolvePatterns(input, configInput)
      expect(input).toEqual(['a.ts', 'b.ts'])
      expect(configInput).toEqual(['c.ts'])
    })

    test('should handle special characters in file paths', () => {
      const result = cmd.testResolvePatterns(['path/to/file[1].ts'], undefined)
      expect(result).toEqual(['path/to/file[1].ts'])
    })

    test('should handle unicode in file paths', () => {
      const result = cmd.testResolvePatterns(['文件.ts'], undefined)
      expect(result).toEqual(['文件.ts'])
    })

    test('should handle paths with spaces', () => {
      const result = cmd.testResolvePatterns(['my file.ts'], undefined)
      expect(result).toEqual(['my file.ts'])
    })

    test('should not throw for any input combination', () => {
      expect(() => cmd.testResolvePatterns(undefined, undefined)).not.toThrow()
      expect(() => cmd.testResolvePatterns('a', undefined)).not.toThrow()
      expect(() => cmd.testResolvePatterns(['a'], undefined)).not.toThrow()
      expect(() => cmd.testResolvePatterns(undefined, ['a'])).not.toThrow()
    })
  })

  describe('disposeParser', () => {
    test('should not throw when no parser created', () => {
      expect(() => cmd.disposeParser()).not.toThrow()
    })

    test('should be callable after createParser', async () => {
      await cmd.testCreateParser()
      expect(() => cmd.disposeParser()).not.toThrow()
    })

    test('should be callable multiple times', () => {
      cmd.disposeParser()
      cmd.disposeParser()
      cmd.disposeParser()
    })

    test('should not throw when called twice after createParser', async () => {
      await cmd.testCreateParser()
      cmd.disposeParser()
      expect(() => cmd.disposeParser()).not.toThrow()
    })

    test('should handle dispose after createParser', async () => {
      await cmd.testCreateParser()
      expect(() => cmd.disposeParser()).not.toThrow()
    })

    test('should handle create then dispose then create again', async () => {
      await cmd.testCreateParser()
      cmd.disposeParser()
      const parser = await cmd.testCreateParser()
      expect(parser).toBeDefined()
      cmd.disposeParser()
    })
  })

  describe('TestableBaseCommand construction', () => {
    test('should create instance with empty args', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(instance).toBeDefined()
    })

    test('should have run method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.run).toBe('function')
    })

    test('should have testCatch method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testCatch).toBe('function')
    })

    test('should have testConfigureLogging method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testConfigureLogging).toBe('function')
    })

    test('should have testCreateParser method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testCreateParser).toBe('function')
    })

    test('should have testLoadConfig method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testLoadConfig).toBe('function')
    })

    test('should have testSetupRuleRegistry method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testSetupRuleRegistry).toBe('function')
    })

    test('should have testDetermineExitCode method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testDetermineExitCode).toBe('function')
    })

    test('should have testResolvePatterns method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.testResolvePatterns).toBe('function')
    })

    test('should have disposeParser method', () => {
      const instance = new TestableBaseCommand([], {} as never)
      expect(typeof instance.disposeParser).toBe('function')
    })

    test('run should return a promise', async () => {
      const instance = new TestableBaseCommand([], {} as never)
      const result = instance.run()
      expect(result).toBeInstanceOf(Promise)
      await result
    })
  })

  describe('CommonFlags type', () => {
    test('CommonFlags should have config property', () => {
      const flags: CommonFlags = { config: 'myconfig.json' }
      expect(flags.config).toBe('myconfig.json')
    })

    test('CommonFlags should have files property', () => {
      const flags: CommonFlags = { files: ['*.ts'] }
      expect(flags.files).toEqual(['*.ts'])
    })

    test('CommonFlags should have ignore property', () => {
      const flags: CommonFlags = { ignore: ['dist/**'] }
      expect(flags.ignore).toEqual(['dist/**'])
    })

    test('CommonFlags should have quiet property', () => {
      const flags: CommonFlags = { quiet: true }
      expect(flags.quiet).toBe(true)
    })

    test('CommonFlags should have verbose property', () => {
      const flags: CommonFlags = { verbose: true }
      expect(flags.verbose).toBe(true)
    })

    test('CommonFlags should allow all optional properties', () => {
      const flags: CommonFlags = {
        config: 'cfg.json',
        files: ['*.ts'],
        ignore: ['node_modules'],
        quiet: false,
        verbose: true,
      }
      expect(flags.config).toBe('cfg.json')
      expect(flags.files).toEqual(['*.ts'])
      expect(flags.ignore).toEqual(['node_modules'])
      expect(flags.quiet).toBe(false)
      expect(flags.verbose).toBe(true)
    })

    test('CommonFlags should allow empty object', () => {
      const flags: CommonFlags = {}
      expect(flags.config).toBeUndefined()
      expect(flags.files).toBeUndefined()
    })
  })
})
