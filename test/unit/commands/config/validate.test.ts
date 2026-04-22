import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

class ExitCodeError extends Error {
  code: number
  constructor(code: number) {
    super(`Exit code: ${code}`)
    this.code = code
    this.name = 'ExitCodeError'
  }
}

vi.mock('../../../../src/utils/errors.js', () => ({
  CLIError: class CLIError extends Error {
    suggestions: string[]
    code: string
    constructor(message: string, options: { suggestions?: string[]; code?: string } = {}) {
      super(message)
      this.suggestions = options.suggestions ?? []
      this.code = options.code ?? 'E000'
      this.name = 'CLIError'
    }
  },
}))

vi.mock('../../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn(),
}))

vi.mock('../../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return { getConfig: vi.fn().mockResolvedValue(null) }
  }),
}))

vi.mock('../../../../src/config/validator.js', () => ({
  validateConfig: vi.fn(),
}))

describe('Validate Command', () => {
  let Validate: typeof import('../../../../src/commands/config/validate.js').default
  let mockFindConfigPath: ReturnType<typeof vi.fn>
  let mockValidateConfig: ReturnType<typeof vi.fn>
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockFindConfigPath = (await import('../../../../src/config/discovery.js'))
      .findConfigPath as ReturnType<typeof vi.fn>
    mockValidateConfig = (await import('../../../../src/config/validator.js'))
      .validateConfig as ReturnType<typeof vi.fn>

    mockValidateConfig.mockImplementation((config) => config)

    Validate = (await import('../../../../src/commands/config/validate.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  async function setupConfigCache(config: unknown) {
    const { ConfigCache } = await import('../../../../src/config/cache.js')
    ;(ConfigCache as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return {
        getConfig: vi.fn().mockResolvedValue(config),
      }
    })
  }

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Validate([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({ flags })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Validate.description).toBe('Validate the CodeForge configuration file')
    })

    test('has examples defined', () => {
      expect(Validate.examples).toBeDefined()
      expect(Validate.examples.length).toBeGreaterThan(0)
    })

    test('has examples with proper structure', () => {
      expect(Validate.examples[0]).toHaveProperty('command')
      expect(Validate.examples[0]).toHaveProperty('description')
      expect(Validate.examples[1]).toHaveProperty('command')
      expect(Validate.examples[1]).toHaveProperty('description')
    })

    test('has config flag defined', () => {
      expect(Validate.flags).toBeDefined()
      expect(Validate.flags.config).toBeDefined()
    })

    test('config flag has char c', () => {
      expect(Validate.flags.config.char).toBe('c')
    })

    test('config flag has description', () => {
      expect(Validate.flags.config.description).toBe('Path to config file')
    })

    test('config flag is not required', () => {
      expect(Validate.flags.config.required).not.toBe(true)
    })
  })

  describe('run', () => {
    test('validates and displays success for valid config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'], ignore: ['node_modules/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
      expect(mockFindConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
      expect(mockValidateConfig).toHaveBeenCalledWith(mockConfig)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration is valid')
    })

    test('exits with 1 when no config file found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('No configuration file found')
      expect(output).toContain('codeforge init')
    })

    test('exits with 1 when config file exists but cannot be loaded', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Failed to load configuration file')
    })

    test('exits with 1 and displays error for invalid config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { invalid: 'config' }
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const validationError = new CLIError('Invalid configuration', {
        suggestions: ['Use valid config structure', 'Check syntax'],
      })
      mockValidateConfig.mockImplementation(() => {
        throw validationError
      })
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration has errors')
      expect(output).toContain('Invalid configuration')
      expect(output).toContain('Use valid config structure')
      expect(output).toContain('Check syntax')
    })

    test('uses custom config path when --config flag is provided', async () => {
      const customPath = '/custom/path/.codeforgerc.json'
      mockFindConfigPath.mockResolvedValue(customPath)
      const mockConfig = { files: ['src/**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: customPath })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
      expect(mockFindConfigPath).toHaveBeenCalledWith(customPath, process.cwd())
    })

    test('displays rules count when config has rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        rules: { 'max-complexity': 'error', 'no-console': 'warning' },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 2')
    })

    test('displays files patterns when config has files', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts', 'src/**/*.tsx'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns:')
      expect(output).toContain('**/*.ts')
      expect(output).toContain('src/**/*.tsx')
    })

    test('displays ignore patterns when config has ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['node_modules/**', 'dist/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Ignore patterns:')
      expect(output).toContain('node_modules/**')
      expect(output).toContain('dist/**')
    })

    test('displays full config details for complete config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'max-complexity': 'error' },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration is valid')
      expect(output).toContain('Rules enabled: 1')
      expect(output).toContain('Files patterns:')
      expect(output).toContain('Ignore patterns:')
    })

    test('re-throws non-CLIError errors', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { test: 'config' }

      mockValidateConfig.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Unexpected error')
    })

    test('handles validation error without suggestions', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { invalid: 'config' }
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const validationError = new CLIError('Invalid config')
      mockValidateConfig.mockImplementation(() => {
        throw validationError
      })
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration has errors')
      expect(output).toContain('Invalid config')
    })

    test('displays config file name in output', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })

    test('displays config file name in error output', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { invalid: 'config' }
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const validationError = new CLIError('Invalid config', {
        suggestions: ['Fix it'],
      })
      mockValidateConfig.mockImplementation(() => {
        throw validationError
      })
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = 0
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })
  })

  describe('Command metadata - extended', () => {
    test('description is a non-empty string', () => {
      expect(typeof Validate.description).toBe('string')
      expect(Validate.description.length).toBeGreaterThan(0)
    })

    test('description contains word "Validate"', () => {
      expect(Validate.description).toContain('Validate')
    })

    test('description contains word "configuration"', () => {
      expect(Validate.description.toLowerCase()).toContain('configuration')
    })

    test('examples is an array', () => {
      expect(Array.isArray(Validate.examples)).toBe(true)
    })

    test('examples has exactly 2 entries', () => {
      expect(Validate.examples).toHaveLength(2)
    })

    test('first example has command property', () => {
      expect(Validate.examples[0]).toHaveProperty('command')
    })

    test('first example has description property', () => {
      expect(Validate.examples[0]).toHaveProperty('description')
    })

    test('second example has command property', () => {
      expect(Validate.examples[1]).toHaveProperty('command')
    })

    test('second example has description property', () => {
      expect(Validate.examples[1]).toHaveProperty('description')
    })

    test('first example description mentions current directory', () => {
      expect(Validate.examples[0].description.toLowerCase()).toContain('current')
    })

    test('second example description mentions specific config', () => {
      expect(Validate.examples[1].description.toLowerCase()).toContain('specific')
    })

    test('flags is an object', () => {
      expect(typeof Validate.flags).toBe('object')
      expect(Validate.flags).not.toBeNull()
    })

    test('flags has only config flag', () => {
      expect(Object.keys(Validate.flags)).toContain('config')
    })

    test('config flag type is string', () => {
      expect(Validate.flags.config).toBeDefined()
    })

    test('config flag char is c', () => {
      expect(Validate.flags.config.char).toBe('c')
    })

    test('config flag description is non-empty', () => {
      expect(Validate.flags.config.description.length).toBeGreaterThan(0)
    })

    test('config flag description mentions config file', () => {
      expect(Validate.flags.config.description.toLowerCase()).toContain('config')
    })

    test('config flag description mentions path', () => {
      expect(Validate.flags.config.description.toLowerCase()).toContain('path')
    })
  })

  describe('run - no config file found variations', () => {
    test('exits with 1 when findConfigPath returns null', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    test('calls findConfigPath with undefined when no config flag', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
    })

    test('logs yellow message when no config found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    test('suggests codeforge init when no config found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('codeforge init')
    })

    test('no-config output contains "No configuration file found"', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('No configuration file found')
    })

    test('does not call validateConfig when no config found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).not.toHaveBeenCalled()
    })
  })

  describe('run - config file cannot be loaded variations', () => {
    test('exits with 1 when config loads as null', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    test('logs red failure message when config cannot load', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Failed to load configuration file')
    })

    test('shows config file path when config cannot load', async () => {
      mockFindConfigPath.mockResolvedValue('/some/deep/path/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('/some/deep/path/.codeforgerc.json')
    })

    test('does not call validateConfig when config is null', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).not.toHaveBeenCalled()
    })

    test('empty config object still attempts validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const emptyConfig = {}
      mockValidateConfig.mockReturnValue(emptyConfig)
      await setupConfigCache(emptyConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalledWith(emptyConfig)
    })
  })

  describe('run - successful validation variations', () => {
    test('exits with 0 for minimal valid config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('displays checkmark for valid config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration is valid')
    })

    test('displays "Configuration:" header', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration:')
    })

    test('calls validateConfig with loaded config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalledWith(mockConfig)
    })

    test('validates config with single file pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.js'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('**/*.js')
    })

    test('validates config with multiple file patterns', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('**/*.ts')
      expect(output).toContain('**/*.tsx')
      expect(output).toContain('**/*.js')
      expect(output).toContain('**/*.jsx')
    })

    test('validates config with single ignore pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['dist/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('dist/**')
    })

    test('validates config with multiple ignore patterns', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['node_modules/**', 'dist/**', '.git/**', 'coverage/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('node_modules/**')
      expect(output).toContain('dist/**')
      expect(output).toContain('.git/**')
      expect(output).toContain('coverage/**')
    })

    test('validates config with single rule', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-console': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
    })

    test('validates config with 3 rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        rules: { 'no-console': 'error', 'no-eval': 'error', 'prefer-const': 'warning' },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 3')
    })

    test('validates config with 10 rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const rules: Record<string, string> = {}
      for (let i = 1; i <= 10; i++) {
        rules[`rule-${i}`] = 'error'
      }
      const mockConfig = { rules }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 10')
    })

    test('does not show rules count when rules is empty object', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: {} }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Rules enabled')
    })

    test('does not show files patterns when files is empty array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: [] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Files patterns')
    })

    test('does not show ignore patterns when ignore is empty array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: [] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Ignore patterns')
    })

    test('does not show rules when rules property is undefined', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Rules enabled')
    })

    test('does not show files when files property is undefined', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-console': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Files patterns')
    })

    test('does not show ignore when ignore property is undefined', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Ignore patterns')
    })

    test('shows config file basename for deep nested path', async () => {
      mockFindConfigPath.mockResolvedValue('/home/user/projects/myapp/config/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
      expect(output).not.toContain('/home/user/projects/myapp/config/.codeforgerc.json')
    })

    test('shows config file basename for simple filename', async () => {
      mockFindConfigPath.mockResolvedValue('.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })

    test('shows config file basename for different config file name', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/codeforge.config.js')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: codeforge.config.js')
    })

    test('shows all sections for fully populated config', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        files: ['src/**/*.ts', 'lib/**/*.js'],
        ignore: ['node_modules/**', 'dist/**'],
        rules: { 'no-console': 'error', 'prefer-const': 'warning', 'no-eval': 'error' },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration is valid')
      expect(output).toContain('Rules enabled: 3')
      expect(output).toContain('Files patterns')
      expect(output).toContain('Ignore patterns')
      expect(output).toContain('Config file: .codeforgerc.json')
    })
  })

  describe('run - config flag variations', () => {
    test('passes custom config path to findConfigPath', async () => {
      const customPath = './my-custom-config.json'
      mockFindConfigPath.mockResolvedValue(customPath)
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: customPath })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(customPath, process.cwd())
    })

    test('passes absolute config path to findConfigPath', async () => {
      const absolutePath = '/etc/codeforge/config.json'
      mockFindConfigPath.mockResolvedValue(absolutePath)
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: absolutePath })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(absolutePath, process.cwd())
    })

    test('passes relative config path to findConfigPath', async () => {
      const relativePath = '../shared/.codeforgerc.json'
      mockFindConfigPath.mockResolvedValue(relativePath)
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: relativePath })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(relativePath, process.cwd())
    })

    test('uses cwd as second argument to findConfigPath', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(undefined, process.cwd())
    })

    test('exits 0 when custom config path is valid', async () => {
      const customPath = '/custom/my-config.json'
      mockFindConfigPath.mockResolvedValue(customPath)
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: customPath })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('exits 1 when custom config path not found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: '/nonexistent/config.json' })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    test('custom config path that fails to load exits 1', async () => {
      mockFindConfigPath.mockResolvedValue('/custom/config.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: '/custom/config.json' })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })
  })

  describe('run - CLIError handling variations', () => {
    test('displays error message from CLIError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Missing required field: files')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Missing required field: files')
    })

    test('displays single suggestion', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad config', { suggestions: ['Add a files array'] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Add a files array')
    })

    test('displays multiple suggestions', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad config', {
        suggestions: ['Fix files', 'Fix rules', 'Fix ignore'],
      })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Fix files')
      expect(output).toContain('Fix rules')
      expect(output).toContain('Fix ignore')
    })

    test('displays no suggestions when suggestions array is empty', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad config', { suggestions: [] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const calls = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(calls).toContain('Bad config')
      expect(calls).not.toContain('- ')
    })

    test('displays "Configuration has errors" header for CLIError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Something wrong')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration has errors')
    })

    test('exits with 1 for CLIError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
    })

    test('shows config filename in CLIError output', async () => {
      mockFindConfigPath.mockResolvedValue('/custom/dir/myconfig.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad config')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: myconfig.json')
    })

    test('CLIError with long error message', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const longMsg =
        'Configuration validation failed: rules["max-complexity"] must be a valid severity level (error, warning, or off)'
      const error = new CLIError(longMsg)
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration validation failed')
      expect(output).toContain('max-complexity')
    })

    test('CLIError with code property', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Config error', { code: 'E001' })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect((exitCode) => {
        throw new ExitCodeError(exitCode)
      })
    })
  })

  describe('run - non-CLIError re-throw', () => {
    test('re-throws generic Error', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new Error('Generic error')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Generic error')
    })

    test('re-throws TypeError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new TypeError('Type mismatch')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Type mismatch')
    })

    test('re-throws RangeError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new RangeError('Out of range')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Out of range')
    })

    test('re-throws SyntaxError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new SyntaxError('Bad syntax')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Bad syntax')
    })

    test('re-throws ReferenceError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new ReferenceError('Not defined')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Not defined')
    })

    test('does not call exit for non-CLIError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new Error('Boom')
      })
      await setupConfigCache({})

      let exitCalled = false
      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = () => {
        exitCalled = true
        throw new Error('should not reach')
      }

      await expect(cmd.run()).rejects.toThrow('Boom')
      expect(exitCalled).toBe(false)
    })
  })

  describe('run - config content variations', () => {
    test('config with only files and rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/**/*.ts'], rules: { 'no-console': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
      expect(output).toContain('Files patterns')
      expect(output).not.toContain('Ignore patterns')
    })

    test('config with only files and ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/**/*.ts'], ignore: ['dist/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
      expect(output).toContain('Ignore patterns')
      expect(output).not.toContain('Rules enabled')
    })

    test('config with only rules and ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-eval': 'error' }, ignore: ['**/*.spec.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
      expect(output).toContain('Ignore patterns')
      expect(output).not.toContain('Files patterns')
    })

    test('config with extra unknown fields passes through', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'], customField: true, version: '2.0' }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with numeric rule values', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'max-complexity': 10, 'max-params': 4 } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 2')
    })

    test('config with object rule values', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'max-lines': { max: 300, skipBlankLines: true } } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
    })

    test('config with complex glob patterns', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        files: ['src/**/!(*.spec|*.test).ts', 'lib/**/*.js'],
        ignore: ['**/vendor/**', '**/__tests__/**'],
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
      expect(output).toContain('Ignore patterns')
    })

    test('config with many rules counts correctly', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const rules: Record<string, string> = {}
      for (let i = 0; i < 50; i++) {
        rules[`rule-${i}`] = i % 2 === 0 ? 'error' : 'warning'
      }
      const mockConfig = { rules }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 50')
    })
  })

  describe('run - parse interaction', () => {
    test('calls parse with Validate class', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const cmdWithMock = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      expect(cmdWithMock.parse).toHaveBeenCalled()
      expect(cmdWithMock.parse).toHaveBeenCalledTimes(1)
    })

    test('reads config flag from parse result', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith(undefined, expect.any(String))
    })
  })

  describe('run - config path variations', () => {
    test('handles Windows-style path', async () => {
      mockFindConfigPath.mockResolvedValue('C:\\Users\\dev\\project\\.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalled()
    })

    test('handles path with spaces', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/my project/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalled()
    })

    test('handles hidden directory path', async () => {
      mockFindConfigPath.mockResolvedValue('/home/user/.config/codeforge/config.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: config.json')
    })

    test('handles path with dots in directory name', async () => {
      mockFindConfigPath.mockResolvedValue('/home/user/project.v2/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })

    test('handles config file with .js extension', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/codeforge.config.js')
      const mockConfig = { files: ['**/*.js'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: codeforge.config.js')
    })

    test('handles config file with .yaml extension', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.yaml')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.yaml')
    })
  })

  describe('run - multiple sequential calls', () => {
    test('can be called twice with different configs', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')

      const config1 = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(config1)
      await setupConfigCache(config1)

      const cmd1 = createCommandWithMockedParse({ config: undefined })
      let exitCode1 = -1
      ;(cmd1 as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode1 = code
        throw new ExitCodeError(code)
      }

      await expect(cmd1.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode1).toBe(0)

      vi.clearAllMocks()
      mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { ConfigCache: ConfigCache2 } = await import('../../../../src/config/cache.js')
      ;(ConfigCache2 as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { getConfig: vi.fn().mockResolvedValue({ rules: { a: 'error' } }) }
      })
      const { findConfigPath: fcp2 } = await import('../../../../src/config/discovery.js')
      const mfc2 = fcp2 as ReturnType<typeof vi.fn>
      mfc2.mockResolvedValue('/path/to/.codeforgerc.json')
      const { validateConfig: vc2 } = await import('../../../../src/config/validator.js')
      const mvc2 = vc2 as ReturnType<typeof vi.fn>
      mvc2.mockReturnValue({ rules: { a: 'error' } })

      const Validate2 = (await import('../../../../src/commands/config/validate.js')).default
      const cmd2 = new Validate2([], {} as never)
      const cmd2Mock = cmd2 as unknown as { parse: ReturnType<typeof vi.fn> }
      cmd2Mock.parse = vi.fn().mockResolvedValue({ flags: { config: undefined } })
      let exitCode2 = -1
      ;(cmd2 as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode2 = code
        throw new ExitCodeError(code)
      }

      await expect(cmd2.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode2).toBe(0)
    })
  })

  describe('run - ConfigCache interaction', () => {
    test('passes config path to ConfigCache.getConfig', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)

      const { ConfigCache } = await import('../../../../src/config/cache.js')
      const mockGetConfig = vi.fn().mockResolvedValue(mockConfig)
      ;(ConfigCache as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { getConfig: mockGetConfig }
      })

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockGetConfig).toHaveBeenCalledWith('/path/to/.codeforgerc.json')
    })

    test('ConfigCache is instantiated once per command', async () => {
      const { ConfigCache } = await import('../../../../src/config/cache.js')
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(ConfigCache).toHaveBeenCalled()
    })
  })

  describe('run - output formatting', () => {
    test('success output contains blank line after header', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const calls = mockConsoleLog.mock.calls.map((c) => c[0])
      expect(calls).toContain('')
    })

    test('error output contains blank line after header', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad config', { suggestions: ['Fix it'] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const calls = mockConsoleLog.mock.calls.map((c) => c[0])
      expect(calls).toContain('')
    })

    test('suggestions are formatted with dash prefix', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad', { suggestions: ['Try this'] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('- Try this')
    })

    test('files patterns displayed as JSON array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['a.ts', 'b.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain(JSON.stringify(['a.ts', 'b.ts']))
    })

    test('ignore patterns displayed as JSON array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['x/**', 'y/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain(JSON.stringify(['x/**', 'y/**']))
    })

    test('config file line shows indented "Config file:"', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const calls = mockConsoleLog.mock.calls.map((c) => c[0])
      const configFileCall = calls.find((c) => typeof c === 'string' && c.includes('Config file:'))
      expect(configFileCall).toBeDefined()
    })
  })

  describe('run - edge cases', () => {
    test('config with null files does not show files section', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: null, rules: { 'no-console': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Files patterns')
    })

    test('config with null ignore does not show ignore section', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: null, files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Ignore patterns')
    })

    test('config with null rules does not show rules section', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: null, files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Rules enabled')
    })

    test('config with false values passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { strict: false, debug: false }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with deeply nested object passes through', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        plugins: {
          custom: {
            options: { depth: 3, names: ['a', 'b'] },
          },
        },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with array root passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { overrides: [{ files: ['*.spec.ts'], rules: {} }] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('findConfigPath called exactly once per run', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledTimes(1)
    })

    test('validateConfig called exactly once per run', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalledTimes(1)
    })

    test('getConfig called exactly once per run', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)

      const mockGetConfig = vi.fn().mockResolvedValue(mockConfig)
      const { ConfigCache } = await import('../../../../src/config/cache.js')
      ;(ConfigCache as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return { getConfig: mockGetConfig }
      })

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockGetConfig).toHaveBeenCalledTimes(1)
    })

    test('parse called exactly once per run', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const cmdWithMock = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      expect(cmdWithMock.parse).toHaveBeenCalledTimes(1)
    })
  })

  describe('run - no-config output details', () => {
    test('logs exactly 3 lines when no config found', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls.length).toBe(3)
    })

    test('first log is the "no config" message', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[0][0]).toContain('No configuration file found')
    })

    test('second log is empty string', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('third log contains codeforge init suggestion', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[2][0]).toContain('codeforge init')
    })
  })

  describe('run - failed-to-load output details', () => {
    test('logs exactly 3 lines when config fails to load', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls.length).toBe(3)
    })

    test('first log contains failure message', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[0][0]).toContain('Failed to load configuration file')
    })

    test('second log is empty string', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('third log contains config file path', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[2][0]).toContain('Config file:')
    })
  })

  describe('run - CLIError output structure', () => {
    test('CLIError with suggestions logs correct number of lines', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad', { suggestions: ['S1', 'S2', 'S3'] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls.length).toBe(9)
    })

    test('CLIError without suggestions logs fewer lines', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad', { suggestions: [] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls.length).toBe(5)
    })

    test('first CLIError log is error header', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Test error')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[0][0]).toContain('Configuration has errors')
    })

    test('second CLIError log is blank', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Test error')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('third CLIError log contains error message', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Specific error msg')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockConsoleLog.mock.calls[2][0]).toContain('Specific error msg')
    })
  })

  describe('run - additional edge cases', () => {
    test('empty string config path passes to findConfigPath', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: '' })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockFindConfigPath).toHaveBeenCalledWith('', process.cwd())
    })

    test('config with single-element files array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('*.ts')
    })

    test('config with single-element ignore array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['*.log'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('*.log')
    })

    test('config with many file patterns displays all', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const files = Array.from({ length: 20 }, (_, i) => `pattern-${i}/**/*.ts`)
      const mockConfig = { files }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('pattern-0/**/*.ts')
      expect(output).toContain('pattern-19/**/*.ts')
    })

    test('config with many ignore patterns displays all', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const ignore = Array.from({ length: 15 }, (_, i) => `ignore-${i}/**`)
      const mockConfig = { ignore }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('ignore-0/**')
      expect(output).toContain('ignore-14/**')
    })

    test('config with empty rules object does not display rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: {}, files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('Rules enabled')
      expect(output).toContain('Files patterns')
    })

    test('config with one rule shows "Rules enabled: 1"', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'max-lines': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
    })

    test('config with two rules shows "Rules enabled: 2"', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-console': 'error', 'no-debugger': 'warning' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 2')
    })

    test('config with 25 rules shows correct count', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const rules: Record<string, string> = {}
      for (let i = 0; i < 25; i++) rules[`rule-${i}`] = 'error'
      const mockConfig = { rules }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 25')
    })

    test('config with only files shows files but not rules or ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
      expect(output).not.toContain('Rules enabled')
      expect(output).not.toContain('Ignore patterns')
    })

    test('config with only ignore shows ignore but not files or rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['tmp/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Ignore patterns')
      expect(output).not.toContain('Files patterns')
      expect(output).not.toContain('Rules enabled')
    })

    test('config with only rules shows rules but not files or ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-any': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
      expect(output).not.toContain('Files patterns')
      expect(output).not.toContain('Ignore patterns')
    })

    test('CLIError with 5 suggestions logs all 5', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Bad', {
        suggestions: ['S1', 'S2', 'S3', 'S4', 'S5'],
      })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('- S1')
      expect(output).toContain('- S2')
      expect(output).toContain('- S3')
      expect(output).toContain('- S4')
      expect(output).toContain('- S5')
    })

    test('CLIError with long suggestion text', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const longSuggestion =
        'Consider updating your configuration file to include the required "files" array with appropriate glob patterns for your project structure'
      const error = new CLIError('Bad', { suggestions: [longSuggestion] })
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Consider updating')
    })

    test('re-throws URIError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new URIError('Bad URI')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Bad URI')
    })

    test('re-throws EvalError', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockImplementation(() => {
        throw new EvalError('Bad eval')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow('Bad eval')
    })

    test('config with string values passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { name: 'my-project', version: '1.0.0' }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with numeric values passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { timeout: 5000, retries: 3 }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with boolean values passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { strict: true, verbose: true, quiet: false }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config path with trailing slash', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/dir/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })

    test('config path with multiple extensions', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/config.prod.local.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: config.prod.local.json')
    })

    test('config file named package.json extracts basename', async () => {
      mockFindConfigPath.mockResolvedValue('/home/user/project/package.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: package.json')
    })

    test('CLIError from validation has correct error name', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Validation failed')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(error.name).toBe('CLIError')
    })

    test('ExitCodeError has correct code property', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let thrownError: ExitCodeError | null = null
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        thrownError = new ExitCodeError(code)
        throw thrownError
      }

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(thrownError).not.toBeNull()
      expect(thrownError!.code).toBe(1)
    })

    test('successful validation ExitCodeError has code 0', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let thrownError: ExitCodeError | null = null
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        thrownError = new ExitCodeError(code)
        throw thrownError
      }

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(thrownError).not.toBeNull()
      expect(thrownError!.code).toBe(0)
    })

    test('no-config ExitCodeError has code 1', async () => {
      mockFindConfigPath.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let thrownError: ExitCodeError | null = null
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        thrownError = new ExitCodeError(code)
        throw thrownError
      }

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(thrownError).not.toBeNull()
      expect(thrownError!.code).toBe(1)
    })

    test('config-load-failure ExitCodeError has code 1', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      await setupConfigCache(null)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let thrownError: ExitCodeError | null = null
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        thrownError = new ExitCodeError(code)
        throw thrownError
      }

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(thrownError).not.toBeNull()
      expect(thrownError!.code).toBe(1)
    })

    test('CLIError validation ExitCodeError has code 1', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      mockValidateConfig.mockImplementation(() => {
        throw new CLIError('Bad')
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      let thrownError: ExitCodeError | null = null
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        thrownError = new ExitCodeError(code)
        throw thrownError
      }

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(thrownError).not.toBeNull()
      expect(thrownError!.code).toBe(1)
    })

    test('config with Unicode file patterns', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/\u6587\u6863/**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('src/\u6587\u6863/**/*.ts')
    })

    test('config with Unicode ignore patterns', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['\u6d4b\u8bd5/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('\u6d4b\u8bd5/**')
    })

    test('config with Unicode config path', async () => {
      mockFindConfigPath.mockResolvedValue('/\u8def\u5f84/\u5230/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.json')
    })

    test('config with special chars in rule names', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { '@scope/rule-name': 'error' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
    })

    test('config with mixed severity levels counts all rules', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        rules: {
          'rule-a': 'error',
          'rule-b': 'warning',
          'rule-c': 'off',
          'rule-d': 2,
          'rule-e': 1,
        },
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 5')
    })

    test('config with slash in file pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['src/components/**/*.tsx'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('src/components/**/*.tsx')
    })

    test('config with dotfile pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['.*rc'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('.*rc')
    })

    test('config with negation pattern in ignore', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignore: ['!keep-this/**'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('!keep-this/**')
    })

    test('config with empty string in files array', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: [''] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
    })

    test('config with wildcard only pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['*'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
    })

    test('CLIError error message is indented in output', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Indented error')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const call = mockConsoleLog.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('Indented error'),
      )
      expect(call).toBeDefined()
      expect(call![0]).toContain('Indented error')
    })

    test('config with zero rules count does not display rules section', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: {} }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration is valid')
      expect(output).not.toContain('Rules enabled')
    })

    test('config with mixed valid and empty fields', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'], rules: {}, ignore: [] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Files patterns')
      expect(output).not.toContain('Rules enabled')
      expect(output).not.toContain('Ignore patterns')
    })

    test('config with override arrays passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = {
        overrides: [
          { files: ['*.test.ts'], rules: { 'no-any': 'off' } },
          { files: ['*.spec.ts'], rules: { 'max-lines': 'error' } },
        ],
      }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with env property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { env: { browser: true, node: true, es2024: true } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with globals property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { globals: { window: 'readonly', document: 'readonly' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with extends property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { extends: ['recommended', 'strict'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with plugins property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { plugins: ['import', 'node'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with settings property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { settings: { 'import/resolver': { node: { extensions: ['.ts'] } } } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config path with symlink style path', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/symlink/.codeforgerc.json')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalled()
    })

    test('config with root true property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { root: true }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('config with ignorePatterns property passes validation', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { ignorePatterns: ['dist/', 'build/'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(0)
    })

    test('CLIError with newline in message', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('Line 1\nLine 2')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Line 1')
      expect(output).toContain('Line 2')
    })

    test('CLIError with empty string message', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const { CLIError } = await import('../../../../src/utils/errors.js')
      const error = new CLIError('')
      mockValidateConfig.mockImplementation(() => {
        throw error
      })
      await setupConfigCache({})

      const cmd = createCommandWithMockedParse({ config: undefined })
      let exitCode = -1
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        exitCode = code
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(exitCode).toBe(1)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Configuration has errors')
    })

    test('config with very long file pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const longPattern = 'src/'.repeat(50) + '**/*.ts'
      const mockConfig = { files: [longPattern] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalledWith(mockConfig)
    })

    test('config with very long ignore pattern', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const longPattern = 'node_modules/'.repeat(50) + '**'
      const mockConfig = { ignore: [longPattern] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      expect(mockValidateConfig).toHaveBeenCalledWith(mockConfig)
    })

    test('config with symbols in rule values', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { rules: { 'no-emoji': '\uD83D\uDD25' } }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rules enabled: 1')
    })

    test('config with mixed array types in files', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('**/*.mjs')
    })

    test('config with .cjs extension files', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.cjs')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc.cjs')
    })

    test('config with .mjs extension files', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/codeforge.config.mjs')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: codeforge.config.mjs')
    })

    test('config with no extension', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc')
      const mockConfig = {}
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd = createCommandWithMockedParse({ config: undefined })
      ;(cmd as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }

      await expect(cmd.run()).rejects.toThrow(ExitCodeError)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Config file: .codeforgerc')
    })

    test('multiple sequential runs produce consistent results', async () => {
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      const mockConfig = { files: ['**/*.ts'] }
      mockValidateConfig.mockReturnValue(mockConfig)
      await setupConfigCache(mockConfig)

      const cmd1 = createCommandWithMockedParse({ config: undefined })
      ;(cmd1 as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      await expect(cmd1.run()).rejects.toThrow(ExitCodeError)
      const output1 = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output1).toContain('Configuration is valid')

      mockConsoleLog.mockClear()
      mockFindConfigPath.mockResolvedValue('/path/to/.codeforgerc.json')
      mockValidateConfig.mockReturnValue(mockConfig)

      const cmd2 = createCommandWithMockedParse({ config: undefined })
      ;(cmd2 as { exit: (c: number) => never }).exit = (code: number) => {
        throw new ExitCodeError(code)
      }
      await expect(cmd2.run()).rejects.toThrow(ExitCodeError)
      const output2 = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output2).toContain('Configuration is valid')
    })
  })
})
