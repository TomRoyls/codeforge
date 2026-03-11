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
  ConfigCache: vi.fn().mockImplementation(() => ({ getConfig: vi.fn().mockResolvedValue(null) })),
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
    async function setupConfigCache(config: unknown) {
      const { ConfigCache } = await import('../../../../src/config/cache.js')
      ;(ConfigCache as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getConfig: vi.fn().mockResolvedValue(config),
      }))
    }

    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Validate([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({ flags })
      return command
    }

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
})
