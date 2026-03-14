import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import type { MigrationResult } from '../../../src/core/migrators/eslint.js'

vi.mock('../../../src/core/migrators/eslint.js', () => ({
  detectESLintConfig: vi.fn(),
  migrateESLintConfig: vi.fn(),
  readESLintConfig: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  default: {
    access: vi.fn(),
    writeFile: vi.fn(),
  },
  access: vi.fn(),
  writeFile: vi.fn(),
}))

describe('Migrate Command', () => {
  let Migrate: typeof import('../../../src/commands/migrate.js').default
  let mockDetectESLintConfig: ReturnType<typeof vi.fn>
  let mockReadESLintConfig: ReturnType<typeof vi.fn>
  let mockMigrateESLintConfig: ReturnType<typeof vi.fn>
  let mockFsAccess: ReturnType<typeof vi.fn>
  let mockFsWriteFile: ReturnType<typeof vi.fn>
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockProcessCwd: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    const eslintModule = await import('../../../src/core/migrators/eslint.js')
    mockDetectESLintConfig = eslintModule.detectESLintConfig as ReturnType<typeof vi.fn>
    mockReadESLintConfig = eslintModule.readESLintConfig as ReturnType<typeof vi.fn>
    mockMigrateESLintConfig = eslintModule.migrateESLintConfig as ReturnType<typeof vi.fn>

    const fsModule = await import('node:fs/promises')
    mockFsAccess = fsModule.access as ReturnType<typeof vi.fn>
    mockFsWriteFile = fsModule.writeFile as ReturnType<typeof vi.fn>

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockProcessCwd = vi.spyOn(process, 'cwd').mockReturnValue('/test/project')

    Migrate = (await import('../../../src/commands/migrate.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
    mockProcessCwd.mockRestore()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Migrate.description).toBe('Migrate from another linter to CodeForge')
    })

    test('has examples defined', () => {
      expect(Migrate.examples).toBeDefined()
      expect(Migrate.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Migrate.flags).toBeDefined()
      expect(Migrate.flags.from).toBeDefined()
      expect(Migrate.flags.dryRun).toBeDefined()
      expect(Migrate.flags.force).toBeDefined()
      expect(Migrate.flags.output).toBeDefined()
    })

    test('from flag is required', () => {
      expect(Migrate.flags.from.required).toBe(true)
    })

    test('from flag has eslint as option', () => {
      expect(Migrate.flags.from.options).toContain('eslint')
    })

    test('dryRun flag has default false', () => {
      expect(Migrate.flags.dryRun.default).toBe(false)
    })

    test('force flag has default false', () => {
      expect(Migrate.flags.force.default).toBe(false)
    })

    test('output flag has correct default', () => {
      expect(Migrate.flags.output.default).toBe('.codeforgerc.json')
    })
  })

  describe('Flag characters', () => {
    test('dryRun flag has char d', () => {
      expect(Migrate.flags.dryRun.char).toBe('d')
    })

    test('force flag has char f', () => {
      expect(Migrate.flags.force.char).toBe('f')
    })

    test('from flag has char F', () => {
      expect(Migrate.flags.from.char).toBe('F')
    })

    test('output flag has char o', () => {
      expect(Migrate.flags.output.char).toBe('o')
    })
  })

  describe('ESLint config migration', () => {
    function createMockMigrationResult(overrides: Partial<MigrationResult> = {}): MigrationResult {
      return {
        rules: {
          'no-eval': 'error',
          'prefer-const': 'warning',
        },
        unmapped: [],
        source: 'eslint',
        ...overrides,
      }
    }

    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Migrate([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    test('successfully migrates ESLint config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockDetectESLintConfig).toHaveBeenCalledWith('/test/project')
      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.json')
      expect(mockMigrateESLintConfig).toHaveBeenCalled()
      expect(mockFsWriteFile).toHaveBeenCalled()
    })

    test('reports unmapped rules', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: ['unknown-rule-1', 'unknown-rule-2', 'custom-plugin/rule'],
        }),
      )
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Unmapped ESLint rules'))).toBe(true)
    })

    test('limits unmapped rules display to 10', async () => {
      const manyUnmapped = Array.from({ length: 15 }, (_, i) => `unknown-rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: manyUnmapped,
        }),
      )
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('and 5 more'))).toBe(true)
    })

    test('handles --dry-run flag without writing file', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).not.toHaveBeenCalled()
      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('dry run'))).toBe(true)
    })

    test('outputs valid JSON in dry-run mode', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {
            'no-eval': 'error',
            'max-complexity': ['error', { max: 10 }],
          },
        }),
      )

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"') && call.includes('"rules"'),
      )

      expect(jsonString).toBeDefined()
      const parsed = JSON.parse(jsonString as string)
      expect(parsed).toHaveProperty('files')
      expect(parsed).toHaveProperty('ignore')
      expect(parsed).toHaveProperty('rules')
    })

    test('handles --force flag to overwrite existing config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalled()
    })

    test('errors when no ESLint config found', async () => {
      mockDetectESLintConfig.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })
      const cmdWithError = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithError.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('No ESLint configuration found')
    })

    test('errors when ESLint config cannot be parsed', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.js')
      mockReadESLintConfig.mockResolvedValue(null)

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })
      const cmdWithError = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithError.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('Could not parse ESLint configuration')
    })

    test('writes config to custom output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'custom-config.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/custom-config.json',
        expect.any(String),
        'utf8',
      )
    })

    test('logs migration summary with mapped rule count', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {
            'no-eval': 'error',
            'prefer-const': 'warning',
            'max-complexity': 'error',
          },
        }),
      )
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Mapped rules: 3'))).toBe(true)
    })

    test('writes properly formatted JSON config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writeFileCall = mockFsWriteFile.mock.calls[0]
      const writtenContent = writeFileCall[1] as string
      const parsedConfig = JSON.parse(writtenContent)

      expect(parsedConfig).toHaveProperty('files')
      expect(parsedConfig).toHaveProperty('ignore')
      expect(parsedConfig).toHaveProperty('rules')
      expect(Array.isArray(parsedConfig.files)).toBe(true)
      expect(Array.isArray(parsedConfig.ignore)).toBe(true)
      expect(typeof parsedConfig.rules).toBe('object')
    })

    test('logs next steps after successful migration', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Next steps'))).toBe(true)
      expect(logCalls.some((call) => call.includes('codeforge analyze'))).toBe(true)
    })

    test('does not show unmapped section when no unmapped rules', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: [],
        }),
      )
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Unmapped ESLint rules'))).toBe(false)
    })
  })
})
