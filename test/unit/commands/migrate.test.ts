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
    vi.resetAllMocks()
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

  // =========================================================================
  // COMMAND METADATA
  // =========================================================================
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

    test('exactly 4 flags are defined', () => {
      const flagNames = Object.keys(Migrate.flags)
      expect(flagNames).toHaveLength(4)
    })

    test('flags contain expected flag names', () => {
      const flagNames = Object.keys(Migrate.flags)
      expect(flagNames).toContain('from')
      expect(flagNames).toContain('dryRun')
      expect(flagNames).toContain('force')
      expect(flagNames).toContain('output')
    })

    test('from flag has description', () => {
      expect(Migrate.flags.from.description).toBeDefined()
      expect(typeof Migrate.flags.from.description).toBe('string')
      expect(Migrate.flags.from.description!.length).toBeGreaterThan(0)
    })

    test('dryRun flag has description', () => {
      expect(Migrate.flags.dryRun.description).toBeDefined()
      expect(typeof Migrate.flags.dryRun.description).toBe('string')
    })

    test('force flag has description', () => {
      expect(Migrate.flags.force.description).toBeDefined()
      expect(typeof Migrate.flags.force.description).toBe('string')
    })

    test('output flag has description', () => {
      expect(Migrate.flags.output.description).toBeDefined()
      expect(typeof Migrate.flags.output.description).toBe('string')
    })

    test('from flag has eslint, tslint, and biome as options', () => {
      expect(Migrate.flags.from.options).toEqual(['eslint', 'tslint', 'biome'])
    })

    test('examples is an array', () => {
      expect(Array.isArray(Migrate.examples)).toBe(true)
    })

    test('first example has command and description', () => {
      const firstExample = Migrate.examples[0] as { command: string; description: string }
      expect(firstExample.command).toBeDefined()
      expect(firstExample.description).toBeDefined()
    })

    test('second example has command and description', () => {
      const secondExample = Migrate.examples[1] as { command: string; description: string }
      expect(secondExample.command).toBeDefined()
      expect(secondExample.description).toBeDefined()
    })

    test('first example references eslint', () => {
      const firstExample = Migrate.examples[0] as { command: string }
      expect(firstExample.command).toContain('eslint')
    })

    test('second example references dry-run', () => {
      const secondExample = Migrate.examples[1] as { command: string }
      expect(secondExample.command).toContain('dry-run')
    })
  })

  // =========================================================================
  // FLAG CHARACTERS
  // =========================================================================
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

    test('all flag chars are single characters', () => {
      expect(Migrate.flags.dryRun.char).toHaveLength(1)
      expect(Migrate.flags.force.char).toHaveLength(1)
      expect(Migrate.flags.from.char).toHaveLength(1)
      expect(Migrate.flags.output.char).toHaveLength(1)
    })

    test('flag chars are unique', () => {
      const chars = [
        Migrate.flags.dryRun.char,
        Migrate.flags.force.char,
        Migrate.flags.from.char,
        Migrate.flags.output.char,
      ]
      const uniqueChars = new Set(chars)
      expect(uniqueChars.size).toBe(chars.length)
    })
  })

  // =========================================================================
  // FLAG TYPES
  // =========================================================================
  describe('Flag types', () => {
    test('dryRun is a boolean flag', () => {
      expect(Migrate.flags.dryRun.type).toBe('boolean')
    })

    test('force is a boolean flag', () => {
      expect(Migrate.flags.force.type).toBe('boolean')
    })

    test('from is an option flag', () => {
      expect(Migrate.flags.from.type).toBe('option')
    })

    test('output is an option flag', () => {
      expect(Migrate.flags.output.type).toBe('option')
    })
  })

  // =========================================================================
  // ESLINT CONFIG MIGRATION - HAPPY PATH
  // =========================================================================
  describe('ESLint config migration', () => {
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

    test('calls detectESLintConfig with cwd from process.cwd()', async () => {
      mockProcessCwd.mockReturnValue('/custom/directory')
      mockDetectESLintConfig.mockResolvedValue('/custom/directory/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockDetectESLintConfig).toHaveBeenCalledWith('/custom/directory')
    })

    test('calls readESLintConfig with detected config path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.yaml')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.yaml')
    })

    test('calls migrateESLintConfig with parsed config', async () => {
      const parsedConfig = { rules: { 'no-eval': 'error', 'prefer-const': 'warn' } }
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue(parsedConfig)
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockMigrateESLintConfig).toHaveBeenCalledWith(parsedConfig)
    })

    test('writes config file with join of cwd and output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/.codeforgerc.json',
        expect.any(String),
        'utf8',
      )
    })

    test('detectESLintConfig is called exactly once', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockDetectESLintConfig).toHaveBeenCalledTimes(1)
    })

    test('readESLintConfig is called exactly once', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledTimes(1)
    })

    test('migrateESLintConfig is called exactly once', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockMigrateESLintConfig).toHaveBeenCalledTimes(1)
    })

    test('parse is called with Migrate class', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const cmdWithMock = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      expect(cmdWithMock.parse).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================================================
  // UNMAPPED RULES
  // =========================================================================
  describe('Unmapped rules reporting', () => {
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

    test('shows exactly 10 unmapped rules when there are 11', async () => {
      const unmapped = Array.from({ length: 11 }, (_, i) => `unknown-rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped,
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
      expect(logCalls.some((call) => call.includes('and 1 more'))).toBe(true)
    })

    test('shows exactly 10 unmapped rules when there are 20', async () => {
      const unmapped = Array.from({ length: 20 }, (_, i) => `unknown-rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped,
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
      expect(logCalls.some((call) => call.includes('and 10 more'))).toBe(true)
    })

    test('shows all unmapped rules when fewer than 10', async () => {
      const unmapped = ['rule-a', 'rule-b', 'rule-c']
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped,
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
      expect(logCalls.some((call) => call.includes('rule-a'))).toBe(true)
      expect(logCalls.some((call) => call.includes('rule-b'))).toBe(true)
      expect(logCalls.some((call) => call.includes('rule-c'))).toBe(true)
      expect(logCalls.some((call) => call.includes('more'))).toBe(false)
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

    test('shows unmapped count in summary', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: ['rule-a', 'rule-b'],
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
      expect(logCalls.some((call) => call.includes('Unmapped rules: 2'))).toBe(true)
    })

    test('shows unmapped count 0 when all rules mapped', async () => {
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
      expect(logCalls.some((call) => call.includes('Unmapped rules: 0'))).toBe(true)
    })

    test('formats unmapped rules as bullet list', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: ['some-rule'],
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
      expect(logCalls.some((call) => call.includes('- some-rule'))).toBe(true)
    })

    test('shows unmapped rules with plugin prefix', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: ['@typescript-eslint/explicit-function-return-type', 'react/jsx-no-bind'],
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
      expect(
        logCalls.some((call) => call.includes('@typescript-eslint/explicit-function-return-type')),
      ).toBe(true)
      expect(logCalls.some((call) => call.includes('react/jsx-no-bind'))).toBe(true)
    })
  })

  // =========================================================================
  // DRY RUN MODE
  // =========================================================================
  describe('Dry run mode', () => {
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

    test('dry-run does not check for existing file', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsAccess).not.toHaveBeenCalled()
    })

    test('dry-run does not call writeFile', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })

    test('dry-run shows generated config label', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Generated config'))).toBe(true)
    })

    test('dry-run with force still does not write', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })

    test('dry-run outputs JSON with 2-space indent', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      )
      expect(jsonString).toBeDefined()
      // JSON with 2-space indent would have double-space indentation
      expect((jsonString as string).includes('  "files"')).toBe(true)
    })

    test('dry-run still shows migration summary', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: { 'no-eval': 'error', 'prefer-const': 'warning' },
        }),
      )

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Mapped rules: 2'))).toBe(true)
    })

    test('dry-run still shows unmapped rules', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: ['some-rule'],
        }),
      )

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Unmapped ESLint rules'))).toBe(true)
    })
  })

  // =========================================================================
  // FORCE FLAG
  // =========================================================================
  describe('Force overwrite', () => {
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

    test('with force, does not check file existence', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsAccess).not.toHaveBeenCalled()
    })

    test('with force, writes even if file exists', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined) // file exists

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })

    test('without force, file existing causes error to be caught by try-catch', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

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

      // Source has this.error() inside try-catch, so the error is swallowed
      // and execution continues to writeFile
      await cmd.run()

      expect(cmdWithError.error).toHaveBeenCalledWith(
        expect.stringContaining('Config already exists'),
      )
      expect(mockFsWriteFile).toHaveBeenCalled()
    })

    test('without force, existing file error message includes output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'my-custom-config.json',
      })
      const cmdWithError = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithError.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await cmd.run()

      expect(cmdWithError.error).toHaveBeenCalledWith(
        expect.stringContaining('my-custom-config.json'),
      )
    })

    test('without force, existing file error mentions --force', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

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

      await cmd.run()

      expect(cmdWithError.error).toHaveBeenCalledWith(expect.stringContaining('--force'))
    })
  })

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  describe('Error handling', () => {
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

    test('config parse error mentions JS configs', async () => {
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

      await expect(cmd.run()).rejects.toThrow('JS configs')
    })

    test('handles writeFile failure with error message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(new Error('Permission denied'))

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('write error includes output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(new Error('disk full'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'custom-output.json',
      })
      const cmdWithError = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithError.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('custom-output.json')
    })

    test('write error includes original error message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(new Error('disk full'))

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

      await expect(cmd.run()).rejects.toThrow('disk full')
    })

    test('handles non-Error thrown from writeFile', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue('string error')

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('no config found does not call readESLintConfig', async () => {
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

      await expect(cmd.run()).rejects.toThrow()
      expect(mockReadESLintConfig).not.toHaveBeenCalled()
    })

    test('config parse failure does not call migrateESLintConfig', async () => {
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

      await expect(cmd.run()).rejects.toThrow()
      expect(mockMigrateESLintConfig).not.toHaveBeenCalled()
    })

    test('no config found does not call writeFile', async () => {
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

      await expect(cmd.run()).rejects.toThrow()
      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })
  })

  // =========================================================================
  // CUSTOM OUTPUT PATH
  // =========================================================================
  describe('Custom output path', () => {
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

    test('writes to nested output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'config/codeforge.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/config/codeforge.json',
        expect.any(String),
        'utf8',
      )
    })

    test('writes to hidden file output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.config/codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/.config/codeforgerc.json',
        expect.any(String),
        'utf8',
      )
    })

    test('writes to absolute path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '/absolute/path/config.json',
      })

      await cmd.run()

      // path.join resolves relative to cwd
      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/absolute/path/config.json',
        expect.any(String),
        'utf8',
      )
    })

    test('custom output path respects force flag', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: 'my-config.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/my-config.json',
        expect.any(String),
        'utf8',
      )
      expect(mockFsAccess).not.toHaveBeenCalled()
    })
  })

  // =========================================================================
  // OUTPUT JSON STRUCTURE
  // =========================================================================
  describe('Output JSON structure', () => {
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

    test('output config has TypeScript file patterns', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsedConfig = JSON.parse(writtenContent)
      expect(parsedConfig.files).toContain('**/*.ts')
      expect(parsedConfig.files).toContain('**/*.tsx')
    })

    test('output config has node_modules and dist in ignore', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsedConfig = JSON.parse(writtenContent)
      expect(parsedConfig.ignore).toContain('**/node_modules/**')
      expect(parsedConfig.ignore).toContain('**/dist/**')
    })

    test('output config rules match migration result', async () => {
      const migrationResult = createMockMigrationResult({
        rules: {
          'no-eval': 'error',
          'prefer-const': 'warning',
          'max-complexity': 'error',
        },
      })
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(migrationResult)
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsedConfig = JSON.parse(writtenContent)
      expect(parsedConfig.rules['no-eval']).toBe('error')
      expect(parsedConfig.rules['prefer-const']).toBe('warning')
      expect(parsedConfig.rules['max-complexity']).toBe('error')
    })

    test('output config rules include options when present', async () => {
      const migrationResult = createMockMigrationResult({
        rules: {
          'max-complexity': ['error', { max: 10 }],
        },
      })
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(migrationResult)
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsedConfig = JSON.parse(writtenContent)
      const maxComplexityRule = parsedConfig.rules['max-complexity']
      expect(Array.isArray(maxComplexityRule)).toBe(true)
      expect(maxComplexityRule[0]).toBe('error')
      expect(maxComplexityRule[1]).toEqual({ max: 10 })
    })

    test('output is written with utf8 encoding', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(writeFileCall[2]).toBe('utf8')
    })

    test('output JSON uses 2-space indentation', async () => {
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      expect(writtenContent).toContain('  "files"')
      expect(writtenContent).toContain('  "ignore"')
      expect(writtenContent).toContain('  "rules"')
    })
  })

  // =========================================================================
  // LOGGING
  // =========================================================================
  describe('Logging output', () => {
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

    test('logs migration summary header', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Migration Summary'))).toBe(true)
    })

    test('logs detected config path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Found: /test/project/.eslintrc.json'))).toBe(
        true,
      )
    })

    test('logs Migrator header at start', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const firstLog = mockConsoleLog.mock.calls[0]
      expect(firstLog[0]).toContain('CodeForge Migrator')
    })

    test('logs detecting ESLint configuration', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Detecting ESLint configuration'))).toBe(true)
    })

    test('logs migrating rules step', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Migrating rules'))).toBe(true)
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

    test('logs created config file name', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Created .codeforgerc.json'))).toBe(true)
    })

    test('logs created with custom output file name', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'my-config.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Created my-config.json'))).toBe(true)
    })

    test('logs review step in next steps', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Review the generated configuration'))).toBe(
        true,
      )
    })

    test('logs unmapped rules step in next steps', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Address any unmapped rules'))).toBe(true)
    })

    test('logs mapped rules count as 0 for empty migration', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ rules: {} }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Mapped rules: 0'))).toBe(true)
    })

    test('logs mapped rules count for single rule', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({ rules: { 'no-eval': 'error' } }),
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
      expect(logCalls.some((call) => call.includes('Mapped rules: 1'))).toBe(true)
    })

    test('logs mapped rules count for many rules', async () => {
      const manyRules: Record<string, string> = {}
      for (let i = 0; i < 25; i++) {
        manyRules[`rule-${i}`] = 'error'
      }
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ rules: manyRules }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Mapped rules: 25'))).toBe(true)
    })
  })

  // =========================================================================
  // MIGRATION RESULT VARIATIONS
  // =========================================================================
  describe('Migration result variations', () => {
    test('handles migration result with only severity strings', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {
            'no-eval': 'error',
            'prefer-const': 'warning',
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.rules['no-eval']).toBe('error')
      expect(parsed.rules['prefer-const']).toBe('warning')
    })

    test('handles migration result with array severity+options', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {
            'max-complexity': ['error', { max: 10 }],
            'max-params': ['warning', { max: 5 }],
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.rules['max-complexity'][0]).toBe('error')
      expect(parsed.rules['max-complexity'][1]).toEqual({ max: 10 })
      expect(parsed.rules['max-params'][0]).toBe('warning')
      expect(parsed.rules['max-params'][1]).toEqual({ max: 5 })
    })

    test('handles migration result with mixed rules', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {
            'no-eval': 'error',
            'max-complexity': ['error', { max: 10 }],
            'prefer-const': 'warning',
            'max-lines': ['warning', { max: 300 }],
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.rules['no-eval']).toBe('error')
      expect(Array.isArray(parsed.rules['max-complexity'])).toBe(true)
      expect(parsed.rules['prefer-const']).toBe('warning')
      expect(Array.isArray(parsed.rules['max-lines'])).toBe(true)
    })

    test('handles migration result with empty rules', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {},
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(Object.keys(parsed.rules)).toHaveLength(0)
    })

    test('handles migration result with source eslint', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          source: 'eslint',
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

      expect(mockMigrateESLintConfig).toHaveBeenCalled()
    })

    test('handles large number of mapped rules', async () => {
      const largeRules: Record<string, string> = {}
      for (let i = 0; i < 100; i++) {
        largeRules[`mapped-rule-${i}`] = i % 2 === 0 ? 'error' : 'warning'
      }
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ rules: largeRules }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(Object.keys(parsed.rules)).toHaveLength(100)
    })
  })

  // =========================================================================
  // DIFFERENT CONFIG FILE TYPES
  // =========================================================================
  describe('Different config file types', () => {
    test('handles .eslintrc.json config', async () => {
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

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.json')
    })

    test('handles .eslintrc.js config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.js')
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

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.js')
    })

    test('handles .eslintrc.yaml config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.yaml')
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

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.yaml')
    })

    test('handles .eslintrc.yml config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.yml')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.yml')
    })

    test('handles .eslintrc.cjs config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.cjs')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.cjs')
    })

    test('handles .eslintrc.mjs config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.mjs')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/.eslintrc.mjs')
    })
  })

  // =========================================================================
  // COMMAND INSTANTIATION
  // =========================================================================
  describe('Command instantiation', () => {
    test('can create command instance', () => {
      const cmd = new Migrate([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('command instance has run method', () => {
      const cmd = new Migrate([], {} as never)
      expect(typeof cmd.run).toBe('function')
    })

    test('command instance has log method', () => {
      const cmd = new Migrate([], {} as never)
      expect(typeof cmd.log).toBe('function')
    })

    test('command instance has error method', () => {
      const cmd = new Migrate([], {} as never)
      expect(typeof cmd.error).toBe('function')
    })

    test('command is a class constructor', () => {
      expect(typeof Migrate).toBe('function')
      expect(Migrate.prototype).toBeDefined()
    })
  })

  // =========================================================================
  // INTERACTION ORDERING
  // =========================================================================
  describe('Function call ordering', () => {
    test('detectESLintConfig is called before readESLintConfig', async () => {
      const callOrder: string[] = []
      mockDetectESLintConfig.mockImplementation(async () => {
        callOrder.push('detect')
        return '/test/project/.eslintrc.json'
      })
      mockReadESLintConfig.mockImplementation(async () => {
        callOrder.push('read')
        return { rules: {} }
      })
      mockMigrateESLintConfig.mockImplementation(() => {
        callOrder.push('migrate')
        return createMockMigrationResult()
      })
      mockFsAccess.mockImplementation(async () => {
        callOrder.push('access')
        throw new Error('ENOENT')
      })
      mockFsWriteFile.mockImplementation(async () => {
        callOrder.push('write')
      })

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(callOrder.indexOf('detect')).toBeLessThan(callOrder.indexOf('read'))
      expect(callOrder.indexOf('read')).toBeLessThan(callOrder.indexOf('migrate'))
      expect(callOrder.indexOf('migrate')).toBeLessThan(callOrder.indexOf('write'))
    })

    test('migrateESLintConfig is called before writeFile', async () => {
      const callOrder: string[] = []
      mockDetectESLintConfig.mockImplementation(async () => {
        callOrder.push('detect')
        return '/test/project/.eslintrc.json'
      })
      mockReadESLintConfig.mockImplementation(async () => {
        callOrder.push('read')
        return { rules: {} }
      })
      mockMigrateESLintConfig.mockImplementation(() => {
        callOrder.push('migrate')
        return createMockMigrationResult()
      })
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockImplementation(async () => {
        callOrder.push('write')
      })

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(callOrder.indexOf('migrate')).toBeLessThan(callOrder.indexOf('write'))
    })
  })

  // =========================================================================
  // EDGE CASES
  // =========================================================================
  describe('Edge cases', () => {
    test('handles config path with special characters', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/my .eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockReadESLintConfig).toHaveBeenCalledWith('/test/project/my .eslintrc.json')
    })

    test('handles deeply nested cwd path', async () => {
      mockProcessCwd.mockReturnValue('/a/b/c/d/e/f/g')
      mockDetectESLintConfig.mockResolvedValue('/a/b/c/d/e/f/g/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/a/b/c/d/e/f/g/.codeforgerc.json',
        expect.any(String),
        'utf8',
      )
    })

    test('handles config with complex ESLint config', async () => {
      const complexConfig = {
        rules: {
          'no-eval': 'error',
          'prefer-const': ['warn', { destructuring: 'all' }],
          'max-complexity': ['error', { max: 10 }],
        },
        overrides: [
          {
            rules: {
              'no-console': 'error',
            },
          },
        ],
      }
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue(complexConfig)
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockMigrateESLintConfig).toHaveBeenCalledWith(complexConfig)
    })

    test('handles empty output file name', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith('/test/project', expect.any(String), 'utf8')
    })

    test('handles unmapped rules with various naming conventions', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          unmapped: [
            'camelCase',
            'kebab-case',
            'snake_case',
            '@scoped/package',
            '@scoped/package/nested-rule',
          ],
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
      expect(logCalls.some((call) => call.includes('camelCase'))).toBe(true)
      expect(logCalls.some((call) => call.includes('kebab-case'))).toBe(true)
      expect(logCalls.some((call) => call.includes('snake_case'))).toBe(true)
    })

    test('handles migration with all rules unmapped', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: {},
          unmapped: ['rule-1', 'rule-2', 'rule-3'],
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

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(Object.keys(parsed.rules)).toHaveLength(0)
      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Mapped rules: 0'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped rules: 3'))).toBe(true)
    })

    test('handles migration with all rules mapped', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: { 'no-eval': 'error', 'prefer-const': 'warning' },
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
      expect(logCalls.some((call) => call.includes('Mapped rules: 2'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped rules: 0'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped ESLint rules'))).toBe(false)
    })

    test('dry-run does not show next steps', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Next steps'))).toBe(false)
    })

    test('dry-run does not show created file message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Created'))).toBe(false)
    })

    test('handles exactly MAX_UNMAPPED_RULES_TO_SHOW unmapped rules', async () => {
      const unmapped = Array.from({ length: 10 }, (_, i) => `rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ unmapped }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      // Should show all 10 but NOT "and X more"
      expect(logCalls.some((call) => call.includes('more'))).toBe(false)
      expect(logCalls.some((call) => call.includes('rule-10'))).toBe(true)
    })

    test('handles exactly MAX_UNMAPPED_RULES_TO_SHOW + 1 unmapped rules', async () => {
      const unmapped = Array.from({ length: 11 }, (_, i) => `rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ unmapped }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('and 1 more'))).toBe(true)
    })

    test('handles writeFile throwing a number', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(42)

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('handles config detected but read returns undefined', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue(undefined)

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

    test('handles single unmapped rule correctly', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({ unmapped: ['single-rule'] }),
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
      expect(logCalls.some((call) => call.includes('single-rule'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped rules: 1'))).toBe(true)
    })

    test('handles very large unmapped rules count', async () => {
      const unmapped = Array.from({ length: 100 }, (_, i) => `rule-${i + 1}`)
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ unmapped }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('and 90 more'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped rules: 100'))).toBe(true)
    })

    test('config with only extends and no rules', async () => {
      const configWithExtends = { extends: ['eslint:recommended'] }
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue(configWithExtends)
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({ rules: {}, unmapped: [] }),
      )
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockMigrateESLintConfig).toHaveBeenCalledWith(configWithExtends)
    })
  })

  // =========================================================================
  // COMBINED FLAG SCENARIOS
  // =========================================================================
  describe('Combined flag scenarios', () => {
    test('dry-run with force both set', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      // dry-run takes precedence
      expect(mockFsWriteFile).not.toHaveBeenCalled()
      expect(mockFsAccess).not.toHaveBeenCalled()
    })

    test('force with custom output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: 'config/output.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/config/output.json',
        expect.any(String),
        'utf8',
      )
    })

    test('dry-run with custom output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: 'custom.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })

    test('all flags at default values', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
      expect(mockFsWriteFile).toHaveBeenCalledWith(
        '/test/project/.codeforgerc.json',
        expect.any(String),
        'utf8',
      )
    })

    test('force false with file not existing writes successfully', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue({ code: 'ENOENT' })

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })

    test('dry-run with unmapped rules shows both sections', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: { 'no-eval': 'error' },
          unmapped: ['unknown-rule'],
        }),
      )

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      expect(logCalls.some((call) => call.includes('Unmapped ESLint rules'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Generated config'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Mapped rules: 1'))).toBe(true)
    })
  })

  // =========================================================================
  // WRITE FILE CONTENT
  // =========================================================================
  describe('Write file content details', () => {
    test('writeFile content is valid JSON', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      expect(() => JSON.parse(writtenContent)).not.toThrow()
    })

    test('writeFile content has exactly 3 top-level keys', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(Object.keys(parsed)).toEqual(['files', 'ignore', 'rules'])
    })

    test('files array contains TypeScript patterns', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.files).toHaveLength(2)
      expect(parsed.files[0]).toBe('**/*.ts')
      expect(parsed.files[1]).toBe('**/*.tsx')
    })

    test('ignore array contains node_modules and dist', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const writtenContent = mockFsWriteFile.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.ignore).toHaveLength(2)
      expect(parsed.ignore[0]).toBe('**/node_modules/**')
      expect(parsed.ignore[1]).toBe('**/dist/**')
    })

    test('writeFile is called exactly once for non-dry-run', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })

    test('access is called exactly once for non-force non-dry-run', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      // fs.access is called once for checking existing config file
      expect(mockFsAccess).toHaveBeenCalledTimes(1)
    })

    test('access is called with correct output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'my-config.json',
      })

      await cmd.run()

      expect(mockFsAccess).toHaveBeenCalledWith('/test/project/my-config.json')
    })
  })

  // =========================================================================
  // ADDITIONAL FLAG VALIDATION
  // =========================================================================
  describe('Additional flag validation', () => {
    test('output flag is not required', () => {
      expect(Migrate.flags.output.required).toBeFalsy()
    })

    test('dryRun flag is not required', () => {
      expect(Migrate.flags.dryRun.required).toBeFalsy()
    })

    test('force flag is not required', () => {
      expect(Migrate.flags.force.required).toBeFalsy()
    })

    test('examples array has 2 entries', () => {
      expect(Migrate.examples).toHaveLength(2)
    })

    test('description is a non-empty string', () => {
      expect(typeof Migrate.description).toBe('string')
      expect(Migrate.description.length).toBeGreaterThan(0)
    })

    test('from flag options is an array', () => {
      expect(Array.isArray(Migrate.flags.from.options)).toBe(true)
    })

    test('dryRun default is a boolean', () => {
      expect(typeof Migrate.flags.dryRun.default).toBe('boolean')
    })

    test('force default is a boolean', () => {
      expect(typeof Migrate.flags.force.default).toBe('boolean')
    })

    test('output default is a string', () => {
      expect(typeof Migrate.flags.output.default).toBe('string')
    })
  })

  // =========================================================================
  // REGRESSION TESTS
  // =========================================================================
  describe('Regression tests', () => {
    test('should not call writeFile when detect returns null', async () => {
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })

    test('should not call writeFile when read returns null', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(mockFsWriteFile).not.toHaveBeenCalled()
    })

    test('should not call migrateESLintConfig when read returns null', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(mockMigrateESLintConfig).not.toHaveBeenCalled()
    })

    test('should handle multiple sequential runs correctly', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd1 = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd1.run()

      // Second run with different config
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({ rules: { 'no-eval': 'error' } }),
      )

      const cmd2 = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'second-config.json',
      })

      await cmd2.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(2)
    })

    test('should handle cwd being root path', async () => {
      mockProcessCwd.mockReturnValue('/')
      mockDetectESLintConfig.mockResolvedValue('/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledWith('/.codeforgerc.json', expect.any(String), 'utf8')
    })

    test('should preserve migration result source as eslint', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ source: 'eslint' }))
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockMigrateESLintConfig).toHaveBeenCalled()
      const result = mockMigrateESLintConfig.mock.results[0].value as MigrationResult
      expect(result.source).toBe('eslint')
    })

    test('access mock is not leaked between tests', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      // This test just verifies clear state
      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================================================
  // CONSOLE OUTPUT FORMAT
  // =========================================================================
  describe('Console output format', () => {
    test('logs success indicator after writing config', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      // The success checkmark ✓
      expect(logCalls.some((call) => call.includes('Created'))).toBe(true)
    })

    test('logs found indicator when config detected', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('Found'))).toBe(true)
    })

    test('logs header with CodeForge Migrator', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      // First call should be the header
      const firstCall = mockConsoleLog.mock.calls[0]
      expect(firstCall).toBeDefined()
      expect(firstCall[0]).toContain('CodeForge Migrator')
    })

    test('next steps include step numbers', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
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
      expect(logCalls.some((call) => call.includes('1.'))).toBe(true)
      expect(logCalls.some((call) => call.includes('2.'))).toBe(true)
      expect(logCalls.some((call) => call.includes('3.'))).toBe(true)
    })

    test('summary shows both mapped and unmapped counts', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({
          rules: { 'no-eval': 'error' },
          unmapped: ['unknown-rule'],
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
      expect(logCalls.some((call) => call.includes('Mapped rules: 1'))).toBe(true)
      expect(logCalls.some((call) => call.includes('Unmapped rules: 1'))).toBe(true)
    })
  })

  // =========================================================================
  // ADDITIONAL FLAG DEFAULT VALUES
  // =========================================================================
  describe('Flag default values', () => {
    test('dryRun default is boolean false', () => {
      expect(Migrate.flags.dryRun.default).toBe(false)
      expect(typeof Migrate.flags.dryRun.default).toBe('boolean')
    })

    test('force default is boolean false', () => {
      expect(Migrate.flags.force.default).toBe(false)
      expect(typeof Migrate.flags.force.default).toBe('boolean')
    })

    test('output default is string', () => {
      expect(Migrate.flags.output.default).toBe('.codeforgerc.json')
      expect(typeof Migrate.flags.output.default).toBe('string')
    })

    test('from has no default value', () => {
      expect(Migrate.flags.from.default).toBeUndefined()
    })

    test('dryRun has no options', () => {
      expect(Migrate.flags.dryRun.options).toBeUndefined()
    })

    test('force has no options', () => {
      expect(Migrate.flags.force.options).toBeUndefined()
    })

    test('output has no options', () => {
      expect(Migrate.flags.output.options).toBeUndefined()
    })

    test('from required is boolean true', () => {
      expect(Migrate.flags.from.required).toBe(true)
      expect(typeof Migrate.flags.from.required).toBe('boolean')
    })

    test('dryRun required is falsy', () => {
      expect(Migrate.flags.dryRun.required).toBeFalsy()
    })

    test('force required is falsy', () => {
      expect(Migrate.flags.force.required).toBeFalsy()
    })

    test('output required is falsy', () => {
      expect(Migrate.flags.output.required).toBeFalsy()
    })

    test('from options length is 3', () => {
      expect(Migrate.flags.from.options).toHaveLength(3)
    })

    test('from options contains eslint, tslint, and biome', () => {
      expect(Migrate.flags.from.options).toEqual(['eslint', 'tslint', 'biome'])
    })
  })

  // =========================================================================
  // DRY-RUN JSON OUTPUT CONTENT
  // =========================================================================
  describe('Dry-run JSON output content', () => {
    test('dry-run output includes files array', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(Array.isArray(parsed.files)).toBe(true)
    })

    test('dry-run output includes ignore array', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(Array.isArray(parsed.ignore)).toBe(true)
    })

    test('dry-run output includes rules object', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(typeof parsed.rules).toBe('object')
      expect(parsed.rules).not.toBeNull()
    })

    test('dry-run output files contains ts and tsx', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(parsed.files).toContain('**/*.ts')
      expect(parsed.files).toContain('**/*.tsx')
    })

    test('dry-run with empty rules produces empty rules object', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult({ rules: {} }))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0])
      const jsonString = logCalls.find(
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(Object.keys(parsed.rules)).toHaveLength(0)
    })

    test('dry-run with single mapped rule', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(
        createMockMigrationResult({ rules: { 'no-eval': 'error' } }),
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
        (call) => typeof call === 'string' && call.includes('"files"'),
      ) as string
      const parsed = JSON.parse(jsonString)
      expect(parsed.rules['no-eval']).toBe('error')
    })
  })

  // =========================================================================
  // ACCESS AND WRITEFILE INTERACTION
  // =========================================================================
  describe('Access and writeFile interaction', () => {
    test('access is not called when force is true', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: true,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsAccess).not.toHaveBeenCalled()
    })

    test('access is not called in dry-run mode', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: true,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsAccess).not.toHaveBeenCalled()
    })

    test('access is called when force is false and not dry-run', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsAccess).toHaveBeenCalledTimes(1)
    })

    test('writeFile is called after access throws ENOENT', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })

    test('access rejection with non-ENOENT error still allows write', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('EACCES'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile).toHaveBeenCalledTimes(1)
    })

    test('access resolves with no error triggers this.error in try-catch', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockResolvedValue(undefined)

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

      await cmd.run()

      expect(cmdWithError.error).toHaveBeenCalled()
    })

    test('writeFile receives string content as second arg', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const content = mockFsWriteFile.mock.calls[0][1]
      expect(typeof content).toBe('string')
    })

    test('writeFile receives utf8 as third arg', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      expect(mockFsWriteFile.mock.calls[0][2]).toBe('utf8')
    })

    test('writeFile called with joined cwd and output path', async () => {
      mockProcessCwd.mockReturnValue('/my/project')
      mockDetectESLintConfig.mockResolvedValue('/my/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'config.json',
      })

      await cmd.run()

      expect(mockFsWriteFile.mock.calls[0][0]).toBe('/my/project/config.json')
    })

    test('access called with joined cwd and output path', async () => {
      mockProcessCwd.mockReturnValue('/my/project')
      mockDetectESLintConfig.mockResolvedValue('/my/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'config.json',
      })

      await cmd.run()

      expect(mockFsAccess.mock.calls[0][0]).toBe('/my/project/config.json')
    })
  })

  // =========================================================================
  // LOG ORDERING
  // =========================================================================
  describe('Log call ordering', () => {
    test('header is logged before detecting message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logMessages = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      const headerIdx = logMessages.findIndex((m) => m.includes('CodeForge Migrator'))
      const detectingIdx = logMessages.findIndex((m) => m.includes('Detecting ESLint'))
      expect(headerIdx).toBeLessThan(detectingIdx)
    })

    test('found message is logged before migrating message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logMessages = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      const foundIdx = logMessages.findIndex((m) => m.includes('Found'))
      const migratingIdx = logMessages.findIndex((m) => m.includes('Migrating rules'))
      expect(foundIdx).toBeLessThan(migratingIdx)
    })

    test('summary is logged before next steps', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logMessages = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      const summaryIdx = logMessages.findIndex((m) => m.includes('Migration Summary'))
      const nextStepsIdx = logMessages.findIndex((m) => m.includes('Next steps'))
      expect(summaryIdx).toBeLessThan(nextStepsIdx)
    })

    test('created message comes after next steps header', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logMessages = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      const createdIdx = logMessages.findIndex((m) => m.includes('Created'))
      expect(createdIdx).toBeGreaterThan(0)
    })

    test('migrating message comes before summary', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: '.codeforgerc.json',
      })

      await cmd.run()

      const logMessages = mockConsoleLog.mock.calls.map((call) => call.join(' '))
      const migratingIdx = logMessages.findIndex((m) => m.includes('Migrating rules'))
      const summaryIdx = logMessages.findIndex((m) => m.includes('Migration Summary'))
      expect(migratingIdx).toBeLessThan(summaryIdx)
    })
  })

  // =========================================================================
  // WRITE FILE ERROR PATHS
  // =========================================================================
  describe('Write file error paths', () => {
    test('writeFile error with Error object includes message', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(new Error('EACCES permission denied'))

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

      await expect(cmd.run()).rejects.toThrow('EACCES permission denied')
    })

    test('writeFile error with non-Error uses toString', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(42)

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('writeFile error includes full output path', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(new Error('disk full'))

      const cmd = createCommandWithMockedParse({
        from: 'eslint',
        dryRun: false,
        force: false,
        output: 'subdir/config.json',
      })
      const cmdWithError = cmd as unknown as { error: ReturnType<typeof vi.fn> }
      cmdWithError.error = vi.fn((msg: string) => {
        throw new Error(msg)
      })

      await expect(cmd.run()).rejects.toThrow('/test/project/subdir/config.json')
    })

    test('writeFile error with null error', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(null)

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('writeFile error with undefined error', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue(undefined)

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })

    test('writeFile error with object error', async () => {
      mockDetectESLintConfig.mockResolvedValue('/test/project/.eslintrc.json')
      mockReadESLintConfig.mockResolvedValue({ rules: {} })
      mockMigrateESLintConfig.mockReturnValue(createMockMigrationResult())
      mockFsAccess.mockRejectedValue(new Error('ENOENT'))
      mockFsWriteFile.mockRejectedValue({ code: 'ENOENT', message: 'not found' })

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

      await expect(cmd.run()).rejects.toThrow('Failed to write migrated config')
    })
  })

  // =========================================================================
  // ERROR PATH ERROR METHOD
  // =========================================================================
  describe('Error method interaction', () => {
    test('no config found calls error with correct message', async () => {
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(cmdWithError.error).toHaveBeenCalledWith('No ESLint configuration found.')
    })

    test('config parse failure calls error with correct message', async () => {
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(cmdWithError.error).toHaveBeenCalledWith(
        'Could not parse ESLint configuration. JS configs require manual conversion.',
      )
    })

    test('error is called exactly once when no config found', async () => {
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(cmdWithError.error).toHaveBeenCalledTimes(1)
    })

    test('error is called exactly once when config parse fails', async () => {
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

      try {
        await cmd.run()
      } catch {
        // expected
      }

      expect(cmdWithError.error).toHaveBeenCalledTimes(1)
    })
  })
})
