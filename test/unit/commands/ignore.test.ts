import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Ignore Command', () => {
  let Ignore: typeof import('../../../src/commands/ignore.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Ignore = (await import('../../../src/commands/ignore.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-ignore-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Ignore.description).toBe('Manage ignore patterns for CodeForge analysis')
    })

    test('has examples defined', () => {
      expect(Ignore.examples).toBeDefined()
      expect(Ignore.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Ignore.flags).toBeDefined()
      expect(Ignore.flags.file).toBeDefined()
    })

    test('file flag has default value', () => {
      expect(Ignore.flags.file.default).toBe('.codeforgeignore')
    })

    test('file flag has char f', () => {
      expect(Ignore.flags.file.char).toBe('f')
    })

    test('has action args', () => {
      expect(Ignore.args).toBeDefined()
      expect(Ignore.args.action).toBeDefined()
      expect(Ignore.args.pattern).toBeDefined()
    })

    test('action arg has default list', () => {
      expect(Ignore.args.action.default).toBe('list')
    })

    test('action arg has options', () => {
      expect(Ignore.args.action.options).toContain('add')
      expect(Ignore.args.action.options).toContain('remove')
      expect(Ignore.args.action.options).toContain('list')
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(
      args: Record<string, unknown>,
      flags: Record<string, unknown>,
    ) {
      const command = new Ignore([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args,
        flags,
      })
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      return { command, restoreCwd: () => vi.spyOn(process, 'cwd').mockImplementation(originalCwd) }
    }

    describe('add action', () => {
      test('creates new ignore file if it does not exist', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('node_modules/**')

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Added pattern')
      })

      test('appends pattern to existing file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('dist/**\nnode_modules/**')

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Added pattern')
      })

      test('warns when adding duplicate pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('node_modules/**')

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')
      })

      test('preserves comments and blank lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# Comment\n\ndist/**\n\n# Another comment', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# Comment')
        expect(content).toContain('# Another comment')
        expect(content).toContain('dist/**')
        expect(content).toContain('node_modules/**')
      })

      test('errors when pattern is missing', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: undefined },
          { file: path.join(tempDir, '.codeforgeignore') },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })
    })

    describe('remove action', () => {
      test('removes pattern from file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**\ndist/**\ncoverage/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('node_modules/**\ncoverage/**')

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Removed pattern')
      })

      test('errors when pattern not found', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('errors when file does not exist', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('errors when pattern is missing', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: undefined },
          { file: path.join(tempDir, '.codeforgeignore') },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('preserves comments when removing', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# Build artifacts\ndist/**\n# Dependencies\nnode_modules/**',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# Build artifacts')
        expect(content).toContain('# Dependencies')
        expect(content).toContain('node_modules/**')
        expect(content).not.toContain('dist/**')
      })
    })

    describe('list action', () => {
      test('lists patterns from file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**\ndist/**\ncoverage/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('node_modules/**')
        expect(output).toContain('dist/**')
        expect(output).toContain('coverage/**')
        expect(output).toContain('3 patterns found')
      })

      test('shows empty message for empty file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('(empty)')
        expect(output).toContain('0 patterns found')
      })

      test('shows message when file does not exist', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('No ignore file found')
      })

      test('filters out comments and blank lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# Comment\n\ndist/**\n\n# Another comment\nnode_modules/**',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
        expect(output).toContain('node_modules/**')
        expect(output).toContain('2 patterns found')
      })

      test('uses singular form for one pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 pattern found')
      })
    })

    describe('default action (no args)', () => {
      test('defaults to list when no action provided', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
      })
    })

    describe('--file flag', () => {
      test('uses custom file path', async () => {
        const customPath = path.join(tempDir, '.customignore')
        await fs.writeFile(customPath, 'custom/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('custom/**')
        expect(output).toContain('.customignore')
      })

      test('adds to custom file', async () => {
        const customPath = path.join(tempDir, '.customignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(customPath, 'utf8')
        expect(content).toBe('dist/**')
      })
    })

    describe('Error handling', () => {
      test('handles read errors gracefully', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        // Create a directory instead of file to cause read error
        await fs.mkdir(ignorePath)

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })
    })
  })
})
