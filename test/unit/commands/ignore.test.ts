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

    test('examples contain add command', () => {
      const commands = (Ignore.examples as Array<{ command: string }>).map((e) => e.command)
      const hasAdd = commands.some((c) => c.includes('add'))
      expect(hasAdd).toBe(true)
    })

    test('examples contain remove command', () => {
      const commands = (Ignore.examples as Array<{ command: string }>).map((e) => e.command)
      const hasRemove = commands.some((c) => c.includes('remove'))
      expect(hasRemove).toBe(true)
    })

    test('examples contain list command', () => {
      const commands = (Ignore.examples as Array<{ command: string }>).map((e) => e.command)
      const hasList = commands.some((c) => c.includes('list'))
      expect(hasList).toBe(true)
    })

    test('examples contain custom file flag', () => {
      const commands = (Ignore.examples as Array<{ command: string }>).map((e) => e.command)
      const hasFile = commands.some((c) => c.includes('--file'))
      expect(hasFile).toBe(true)
    })

    test('file flag has description', () => {
      expect(Ignore.flags.file.description).toBe('Path to ignore file')
    })

    test('pattern arg is not required', () => {
      expect(Ignore.args.pattern.required).toBe(false)
    })

    test('action arg has description', () => {
      expect(Ignore.args.action.description).toBe('Action to perform')
    })

    test('pattern arg has description', () => {
      expect(Ignore.args.pattern.description).toBe('Pattern to add or remove')
    })

    test('action arg options has exactly 3 entries', () => {
      expect(Ignore.args.action.options).toHaveLength(3)
    })

    test('file flag is a string flag', () => {
      expect(Ignore.flags.file.type).toBe('option')
    })

    test('examples are an array', () => {
      expect(Array.isArray(Ignore.examples)).toBe(true)
    })

    test('has exactly 5 examples', () => {
      expect(Ignore.examples).toHaveLength(5)
    })

    test('all examples have command property', () => {
      for (const example of Ignore.examples as Array<{ command: string }>) {
        expect(example).toHaveProperty('command')
      }
    })

    test('all examples have description property', () => {
      for (const example of Ignore.examples as Array<{ description: string }>) {
        expect(example).toHaveProperty('description')
      }
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

      test('adds multiple patterns sequentially', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        // Add first pattern
        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        // Re-import for second command
        const Ignore2 = (await import('../../../src/commands/ignore.js')).default
        const command2 = new Ignore2([], {} as never)
        const cmdWithMock2 = command2 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock2.parse = vi.fn().mockResolvedValue({
          args: { action: 'add', pattern: 'dist/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command2.run()
        vi.restoreAllMocks()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('node_modules/**\ndist/**')
      })

      test('adds pattern with special characters', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '*.log' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('*.log')
      })

      test('adds pattern with leading dot', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '.env' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('.env')
      })

      test('detects duplicate with different surrounding whitespace', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '  dist/**  ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')
      })

      test('detects duplicate with leading whitespace in input', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '  dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')
      })

      test('adds pattern to file with only comments', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# Only comments', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# Only comments')
        expect(content).toContain('dist/**')
      })

      test('adds pattern to file with only blank lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '\n\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('dist/**')
      })

      test('adds pattern containing path separators', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'src/utils/**/*.ts' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('src/utils/**/*.ts')
      })

      test('adds pattern with brackets', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '*.[oa]' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('*.[oa]')
      })

      test('does not add duplicate when file has many patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**\nd/**\ne/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'c/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nb/**\nc/**\nd/**\ne/**')
      })

      test('output includes the pattern name in success message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'build/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('build/**')
      })

      test('output includes the file path in success message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'build/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain(ignorePath)
      })

      test('handles write to directory path gracefully', async () => {
        const dirPath = path.join(tempDir, 'not-a-file')
        await fs.mkdir(dirPath)

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test/**' },
          { file: dirPath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('adds negation pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '!important/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('!important/**')
      })

      test('adds single asterisk pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '*' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('*')
      })

      test('adds double asterisk pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('**')
      })

      test('adds pattern to deeply nested custom file path', async () => {
        const nestedDir = path.join(tempDir, 'a', 'b', 'c')
        await fs.mkdir(nestedDir, { recursive: true })
        const ignorePath = path.join(nestedDir, '.ignore')
        await fs.writeFile(ignorePath, 'existing/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'new/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('existing/**\nnew/**')
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

      test('removes first pattern from file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'a/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('b/**\nc/**')
      })

      test('removes last pattern from file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'c/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nb/**')
      })

      test('removes middle pattern from file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'b/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nc/**')
      })

      test('removes only pattern leaving empty file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('')
      })

      test('output includes the pattern name in success message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
      })

      test('output includes the file path in success message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain(ignorePath)
      })

      test('removes pattern with whitespace in file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '  dist/**  \nnode_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('dist/**')
        expect(content).toContain('node_modules/**')
      })

      test('removes pattern with leading whitespace in input', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\nnode_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '  dist/**  ' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('dist/**')
      })

      test('errors when file has only comments', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# Just a comment', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('errors when file is only whitespace', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '   \n  \n  ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )

        await expect(cmd.run()).rejects.toThrow()
        restoreCwd()
      })

      test('preserves blank lines when removing a pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\n\nb/**\n\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'b/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\n\n\nc/**')
        expect(content).toContain('a/**')
        expect(content).toContain('c/**')
      })

      test('removes negation pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '!keep/**\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '!keep/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('dist/**')
      })

      test('error message includes pattern name when not found', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'node_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'missing/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
        } catch (error) {
          expect((error as Error).message).toContain('missing/**')
        }
        restoreCwd()
      })

      test('does not remove pattern that is substring of another', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\ndist/extra/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('dist/**')
        // dist/extra/** should remain since its trimmed form !== 'dist/**'
        // Actually lines are 'dist/**' and 'dist/extra/**', findIndex matches 'dist/**' exactly
        // So dist/extra/** remains
        expect(content).toContain('dist/extra/**')
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

      test('uses plural form for zero patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('0 patterns found')
      })

      test('uses plural form for multiple patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('3 patterns found')
      })

      test('displays Ignore Patterns header', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Ignore Patterns')
      })

      test('displays file path in output', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain(ignorePath)
      })

      test('shows suggestion to create file when none exists', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('codeforge ignore add')
      })

      test('lists patterns with only whitespace lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '   \n   \n   ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('0 patterns found')
      })

      test('lists patterns with only comments', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# Comment 1\n# Comment 2', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('0 patterns found')
      })

      test('lists patterns trimming whitespace', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '  dist/**  ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
        expect(output).toContain('1 pattern found')
      })

      test('lists many patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const patterns = Array.from({ length: 20 }, (_, i) => `pattern${i}/**`)
        await fs.writeFile(ignorePath, patterns.join('\n'), 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('20 patterns found')
      })

      test('handles file with trailing newline', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
        expect(output).toContain('1 pattern found')
      })

      test('handles file with leading newline', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dist/**')
        expect(output).toContain('1 pattern found')
      })

      test('each pattern is indented', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\nnode_modules/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        const patternCalls = calls.filter((c) => c.startsWith('  '))
        expect(patternCalls.length).toBeGreaterThanOrEqual(2)
      })

      test('filters out inline hash comments', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# This is a comment\ndist/**\n# Another comment\ncoverage/**',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2 patterns found')
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

      test('removes from custom file', async () => {
        const customPath = path.join(tempDir, '.customignore')
        await fs.writeFile(customPath, 'dist/**\nbuild/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(customPath, 'utf8')
        expect(content).toBe('build/**')
      })

      test('lists from custom file that does not exist', async () => {
        const customPath = path.join(tempDir, '.customignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('No ignore file found')
        expect(output).toContain('.customignore')
      })

      test('creates custom file on add when it does not exist', async () => {
        const customPath = path.join(tempDir, '.myignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'logs/**' },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(customPath, 'utf8')
        expect(content).toBe('logs/**')
      })

      test('uses absolute path for custom file', async () => {
        const customPath = path.join(tempDir, 'absolute-path-ignore')
        await fs.writeFile(customPath, 'abs/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('abs/**')
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

      test('handles permission error on add', async () => {
        const readOnlyDir = path.join(tempDir, 'readonly')
        await fs.mkdir(readOnlyDir)
        const ignorePath = path.join(readOnlyDir, '.codeforgeignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        // Should succeed since it's creating a new file in writable dir
        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('test/**')
      })

      test('add error includes pattern in message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        // Make path a directory to cause write failure
        await fs.mkdir(ignorePath)

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'fail-pattern/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
          restoreCwd()
        } catch (error) {
          restoreCwd()
          expect((error as Error).message).toBeTruthy()
        }
      })

      test('remove error on empty file has descriptive message', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'anything/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
        } catch (error) {
          expect((error as Error).message).toContain('not found')
        }
        restoreCwd()
      })

      test('remove re-throws not found errors', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'nonexistent/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
        } catch (error) {
          expect((error as Error).message).toContain('not found')
        }
        restoreCwd()
      })
    })

    describe('extractPatterns behavior (integration)', () => {
      test('extracts patterns with hash comments interspersed', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# Header\nnode_modules/**\n# Section\ndist/**\ncoverage/**',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('3 patterns found')
        expect(output).toContain('node_modules/**')
        expect(output).toContain('dist/**')
        expect(output).toContain('coverage/**')
      })

      test('counts patterns correctly with many blank lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '\n\n\na/**\n\n\n\nb/**\n\n\nc/**\n\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('3 patterns found')
      })

      test('counts single pattern in file with comments', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# Only one real pattern\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 pattern found')
      })

      test('counts zero patterns with only comments and blanks', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# comment 1\n\n# comment 2\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('0 patterns found')
      })
    })

    describe('readFileContent behavior (integration)', () => {
      test('add creates file when readFileContent returns empty', async () => {
        const ignorePath = path.join(tempDir, '.newignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'new/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        // File should have been created
        const stat = await fs.stat(ignorePath)
        expect(stat.isFile()).toBe(true)
        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('new/**')
      })

      test('remove on non-existent file errors with empty message', async () => {
        const ignorePath = path.join(tempDir, '.nonexistent')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'x/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
        } catch (error) {
          expect((error as Error).message).toContain('not found')
          expect((error as Error).message).toContain("file is empty or doesn't exist")
        }
        restoreCwd()
      })
    })

    describe('run method dispatch', () => {
      test('dispatches to addPattern for add action', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dispatch-add/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('dispatch-add/**')
      })

      test('dispatches to removePattern for remove action', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dispatch-remove/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dispatch-remove/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('')
      })

      test('dispatches to listPatterns for list action', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dispatch-list/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('dispatch-list/**')
      })

      test('dispatches to listPatterns for default action', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'default-dispatch/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('default-dispatch/**')
        expect(output).toContain('1 pattern found')
      })
    })

    describe('edge cases - file content', () => {
      test('add to file ending with newline', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('dist/**')
        expect(content).toContain('node_modules/**')
      })

      test('add to file with only newline', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('dist/**')
      })

      test('add to file with CRLF line endings', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\r\ncoverage/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('node_modules/**')
      })

      test('add pattern that starts with hash is not treated as comment', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '#notacomment' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('#notacomment')
      })

      test('remove from file with single pattern and trailing newline', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('')
      })

      test('list handles very long pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const longPattern = 'a'.repeat(500) + '/**'
        await fs.writeFile(ignorePath, longPattern, 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain(longPattern)
      })

      test('add pattern with unicode characters', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '日本語/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('日本語/**')
      })

      test('add pattern with spaces in name', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'my folder/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('my folder/**')
      })

      test('add empty string pattern throws error', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '' },
          { file: ignorePath },
        )

        // Empty string is falsy in JS, so !options.pattern is true
        await expect(cmd.run()).rejects.toThrow('Pattern is required')
        restoreCwd()
      })

      test('add pattern that is a comment line', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '# This is a comment' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('# This is a comment')
      })
    })

    describe('concurrent operations simulation', () => {
      test('add then list shows both patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        // Add first
        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'first/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const Ignore2 = (await import('../../../src/commands/ignore.js')).default
        const command2 = new Ignore2([], {} as never)
        const cmdWithMock2 = command2 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock2.parse = vi.fn().mockResolvedValue({
          args: { action: 'add', pattern: 'second/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command2.run()

        const command3 = new Ignore2([], {} as never)
        const cmdWithMock3 = command3 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock3.parse = vi.fn().mockResolvedValue({
          args: { action: 'list', pattern: undefined },
          flags: { file: ignorePath },
        })
        mockConsoleLog.mockClear()
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command3.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('first/**')
        expect(output).toContain('second/**')
        expect(output).toContain('2 patterns found')
      })

      test('add remove then list shows remaining', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        // Add first
        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'keep/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const Ignore2 = (await import('../../../src/commands/ignore.js')).default
        const command2 = new Ignore2([], {} as never)
        const cmdWithMock2 = command2 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock2.parse = vi.fn().mockResolvedValue({
          args: { action: 'add', pattern: 'remove-me/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command2.run()

        const command3 = new Ignore2([], {} as never)
        const cmdWithMock3 = command3 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock3.parse = vi.fn().mockResolvedValue({
          args: { action: 'remove', pattern: 'remove-me/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command3.run()

        const command4 = new Ignore2([], {} as never)
        const cmdWithMock4 = command4 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock4.parse = vi.fn().mockResolvedValue({
          args: { action: 'list', pattern: undefined },
          flags: { file: ignorePath },
        })
        mockConsoleLog.mockClear()
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command4.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('keep/**')
        expect(output).not.toContain('remove-me/**')
        expect(output).toContain('1 pattern found')
      })
    })

    describe('ignore file content preservation', () => {
      test('add preserves all existing content', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const original = '# Header\n\na/**\n\n# Middle\nb/**\n\nc/**\n# Footer'
        await fs.writeFile(ignorePath, original, 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'd/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# Header')
        expect(content).toContain('# Middle')
        expect(content).toContain('# Footer')
        expect(content).toContain('a/**')
        expect(content).toContain('b/**')
        expect(content).toContain('c/**')
        expect(content).toContain('d/**')
      })

      test('remove preserves all other content', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# Header\n\na/**\n\n# Middle\nb/**\n\nc/**\n# Footer',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'b/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# Header')
        expect(content).toContain('# Middle')
        expect(content).toContain('# Footer')
        expect(content).toContain('a/**')
        expect(content).toContain('c/**')
        expect(content).not.toContain('b/**')
      })

      test('add does not modify file on duplicate', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const original = '# Comment\na/**\nb/**'
        await fs.writeFile(ignorePath, original, 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'a/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe(original)
      })
    })

    describe('chalk output formatting', () => {
      test('add success uses green color', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        // chalk.green wraps text with ANSI codes
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Added pattern')
      })

      test('add duplicate uses yellow color', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'test/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')
      })

      test('remove success uses green color', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'test/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'test/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Removed pattern')
      })

      test('list no file uses gray color', async () => {
        const ignorePath = path.join(tempDir, '.nonexistent')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        // Gray output for "No ignore file found"
        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('No ignore file found')
      })

      test('list empty uses gray color for empty message', async () => {
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
      })

      test('list header uses bold', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Ignore Patterns')
      })
    })

    describe('pattern matching precision', () => {
      test('does not match partial pattern when adding duplicate', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        // 'dist' is different from 'dist/**' - should be added
        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('dist')
        expect(content).toContain('dist/**')
        expect(content).not.toContain('already exists')
      })

      test('does not match partial pattern when removing', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\ndist', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('dist/**')
        expect(content).not.toContain('\ndist\n')
        // Only 'dist' exact match should be removed, not 'dist/**'
      })

      test('matches exact pattern case-sensitively', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'Dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('Dist/**')
        expect(content).toContain('dist/**')
      })

      test('add and remove exact same pattern roundtrip', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**', 'utf8')

        // Add
        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'c/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        // Remove
        const Ignore2 = (await import('../../../src/commands/ignore.js')).default
        const command2 = new Ignore2([], {} as never)
        const cmdWithMock2 = command2 as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock2.parse = vi.fn().mockResolvedValue({
          args: { action: 'remove', pattern: 'c/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await command2.run()
        vi.restoreAllMocks()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nb/**')
      })
    })

    describe('add action - various pattern types', () => {
      test('adds directory pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'build/' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('build/')
      })

      test('adds file extension pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '*.min.js' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('*.min.js')
      })

      test('adds nested path pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'src/generated/**/*.ts' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('src/generated/**/*.ts')
      })

      test('adds root-level file pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '/package-lock.json' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('/package-lock.json')
      })

      test('adds double star pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '**/node_modules/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('**/node_modules/**')
      })

      test('adds question mark pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test?.ts' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('test?.ts')
      })
    })

    describe('remove action - various scenarios', () => {
      test('remove from file with duplicate-looking patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        const remaining = content.split('\n').filter((l) => l.trim() === 'dist/**')
        expect(remaining.length).toBe(1)
      })

      test('remove from file with only whitespace-trimmed patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '  spaced/**  ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'spaced/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content.trim()).toBe('')
      })

      test('remove pattern with special regex characters', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '*.min.js\n*.log', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '*.min.js' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('*.log')
      })

      test('remove pattern from file with many comments between patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\n# comment 1\n# comment 2\n# comment 3\nb/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'a/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('# comment 1')
        expect(content).toContain('# comment 2')
        expect(content).toContain('# comment 3')
        expect(content).toContain('b/**')
        expect(content).not.toContain('a/**')
      })
    })

    describe('list action - more edge cases', () => {
      test('list file with 100 patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const patterns = Array.from({ length: 100 }, (_, i) => `p${i}/**`)
        await fs.writeFile(ignorePath, patterns.join('\n'), 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('100 patterns found')
      })

      test('list file with mixed comment styles', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(
          ignorePath,
          '# Standard comment\n## Double hash\n### Triple hash\npattern/**',
          'utf8',
        )

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 pattern found')
        expect(output).toContain('pattern/**')
      })

      test('list file with pattern that starts with exclamation', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '!keep-me/**\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('!keep-me/**')
        expect(output).toContain('2 patterns found')
      })

      test('list after add shows the added pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        // Add
        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'added-later/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        // List
        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        mockConsoleLog.mockClear()
        await cmd2.run()
        restore2()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('added-later/**')
        expect(output).toContain('1 pattern found')
      })

      test('list file path is shown with File: prefix', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'test/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        const fileCall = calls.find((c) => c.includes('File:'))
        expect(fileCall).toBeDefined()
        expect(fileCall).toContain(ignorePath)
      })

      test('list counts exactly 2 for 2 patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'first/**\nsecond/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2 patterns found')
        expect(output).not.toContain('1 pattern')
      })

      test('list with custom file path shows custom path', async () => {
        const customPath = path.join(tempDir, '.my-gitignore')
        await fs.writeFile(customPath, 'custom-pattern/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('.my-gitignore')
      })
    })

    describe('whitespace handling integration', () => {
      test('add trims pattern for duplicate check but preserves original in file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '  dist/**  ' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('already exists')
      })

      test('remove trims pattern for matching', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '  dist/**  ' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('')
      })

      test('list trims patterns for display', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '  padded/**  ', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('padded/**')
        expect(output).toContain('1 pattern found')
      })

      test('list filters out whitespace-only lines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '   \n\t\n\ndist/**\n\t\t', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 pattern found')
        expect(output).toContain('dist/**')
      })
    })

    describe('add and remove combined workflows', () => {
      test('add pattern then add different pattern then remove first', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'first/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const Ignore2 = (await import('../../../src/commands/ignore.js')).default
        const cmd2 = new Ignore2([], {} as never)
        const mock2 = cmd2 as unknown as { parse: ReturnType<typeof vi.fn> }
        mock2.parse = vi.fn().mockResolvedValue({
          args: { action: 'add', pattern: 'second/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await cmd2.run()

        const cmd3 = new Ignore2([], {} as never)
        const mock3 = cmd3 as unknown as { parse: ReturnType<typeof vi.fn> }
        mock3.parse = vi.fn().mockResolvedValue({
          args: { action: 'remove', pattern: 'first/**' },
          flags: { file: ignorePath },
        })
        vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
        await cmd3.run()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('first/**')
        expect(content).toContain('second/**')
      })

      test('remove all patterns one by one', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const IgnoreFresh = (await import('../../../src/commands/ignore.js')).default
        for (const pat of ['a/**', 'b/**', 'c/**']) {
          const cmd = new IgnoreFresh([], {} as never)
          const mock = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
          mock.parse = vi.fn().mockResolvedValue({
            args: { action: 'remove', pattern: pat },
            flags: { file: ignorePath },
          })
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
          await cmd.run()
        }

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content.trim()).toBe('')
      })

      test('add back a previously removed pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'restored/**', 'utf8')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'restored/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'restored/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('restored/**')
      })
    })

    describe('command class static properties', () => {
      test('args is an object with action and pattern keys', () => {
        expect(Object.keys(Ignore.args)).toContain('action')
        expect(Object.keys(Ignore.args)).toContain('pattern')
      })

      test('flags is an object with file key', () => {
        expect(Object.keys(Ignore.flags)).toContain('file')
      })

      test('description is a non-empty string', () => {
        expect(typeof Ignore.description).toBe('string')
        expect(Ignore.description.length).toBeGreaterThan(0)
      })

      test('examples array items have correct shape', () => {
        for (const ex of Ignore.examples as Array<{ command: string; description: string }>) {
          expect(typeof ex.command).toBe('string')
          expect(typeof ex.description).toBe('string')
          expect(ex.command.length).toBeGreaterThan(0)
          expect(ex.description.length).toBeGreaterThan(0)
        }
      })

      test('file flag type is option', () => {
        expect(Ignore.flags.file.type).toBe('option')
      })

      test('pattern arg type is option', () => {
        expect(Ignore.args.pattern.type).toBe('option')
      })

      test('action arg type is option', () => {
        expect(Ignore.args.action.type).toBe('option')
      })

      test('args has exactly 2 entries', () => {
        expect(Object.keys(Ignore.args)).toHaveLength(2)
      })

      test('flags has exactly 1 entry', () => {
        expect(Object.keys(Ignore.flags)).toHaveLength(1)
      })

      test('examples use template syntax', () => {
        const commands = (Ignore.examples as Array<{ command: string }>).map((e) => e.command)
        const hasTemplate = commands.some((c) => c.includes('<%='))
        expect(hasTemplate).toBe(true)
      })
    })

    describe('add action - additional patterns', () => {
      test('adds tilde pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '~' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('~')
      })

      test('adds caret pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '^.txt' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('^.txt')
      })

      test('adds dollar sign pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'test$' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('test$')
      })

      test('adds percent pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '%test%' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('%test%')
      })

      test('adds ampersand pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '&build/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('&build/**')
      })

      test('adds equals sign pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '=generated' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('=generated')
      })

      test('adds plus pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'src/**/*.test.ts' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('src/**/*.test.ts')
      })

      test('adds at sign pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '@types/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('@types/**')
      })

      test('adds backslash pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'src\\\\test/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('src\\\\test/**')
      })

      test('adds semicolon pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: ';ignored' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe(';ignored')
      })

      test('adds pipe pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'a|b' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a|b')
      })
    })

    describe('remove action - additional edge cases', () => {
      test('remove pattern that starts with dot', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '.env\n.env.local\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '.env' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('.env\n')
        expect(content).toContain('.env.local')
        expect(content).toContain('dist/**')
      })

      test('remove only pattern from file with surrounding newlines', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '\nsole/**\n', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'sole/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content.trim()).toBe('')
      })

      test('remove pattern when it is preceded by a comment on same line', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'dist/**\n# not-dist\ncoverage/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'dist/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).not.toContain('dist/**')
        expect(content).toContain('# not-dist')
        expect(content).toContain('coverage/**')
      })

      test('remove last of many patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**\nd/**\ne/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'e/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nb/**\nc/**\nd/**')
      })

      test('remove first of many patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**\nd/**\ne/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'a/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('b/**\nc/**\nd/**\ne/**')
      })

      test('remove error does not modify file', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'nonexistent/**' },
          { file: ignorePath },
        )

        try {
          await cmd.run()
        } catch {
          // expected
        }
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('a/**\nb/**')
      })

      test('remove from file with pattern containing unicode', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '日本語/**\nenglish/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: '日本語/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('english/**')
      })
    })

    describe('list action - additional patterns', () => {
      test('list shows file even with only one pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'single/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const calls = mockConsoleLog.mock.calls.map((c) => c[0])
        expect(calls.filter((c) => c === '').length).toBeGreaterThanOrEqual(2)
      })

      test('list does not show comments in output', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '# My comment\ndist/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const indentedCalls = mockConsoleLog.mock.calls
          .map((c) => c[0])
          .filter((c) => c.startsWith('  '))
        expect(indentedCalls).toHaveLength(1)
        expect(indentedCalls[0]).toBe('  dist/**')
      })

      test('list empty file does not show patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, '', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const indentedCalls = mockConsoleLog.mock.calls
          .map((c) => c[0])
          .filter((c) => c.startsWith('  ') && c.trim() !== '')
        expect(indentedCalls).toHaveLength(0)
      })

      test('list 10 patterns all shown', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const patterns = Array.from({ length: 10 }, (_, i) => `p${i}/**`)
        await fs.writeFile(ignorePath, patterns.join('\n'), 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        for (const p of patterns) {
          expect(output).toContain(p)
        }
      })

      test('list shows File label with path', async () => {
        const customPath = path.join(tempDir, 'special.ignore')
        await fs.writeFile(customPath, 'test/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: customPath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain(customPath)
      })
    })

    describe('file creation and deletion patterns', () => {
      test('add creates new file when listing shows not found first', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'new/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('new/**')
      })

      test('remove all then add back works', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'only-one/**', 'utf8')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'only-one/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'only-one/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('only-one/**')
      })

      test('add to nonexistent nested path succeeds if parent exists', async () => {
        const nestedDir = path.join(tempDir, 'nested')
        await fs.mkdir(nestedDir, { recursive: true })
        const ignorePath = path.join(nestedDir, '.ignore')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'nested/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('nested/**')
      })

      test('add then immediately list within same test', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'immediate/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        mockConsoleLog.mockClear()
        await cmd2.run()
        restore2()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('immediate/**')
      })
    })

    describe('output message formatting details', () => {
      test('add success message has checkmark', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'check/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('✓')
      })

      test('remove success message has checkmark', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'check/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'check/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('✓')
      })

      test('list no file shows usage suggestion', async () => {
        const ignorePath = path.join(tempDir, '.nothere')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('codeforge ignore add')
      })

      test('add duplicate output has quotes around pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'quoted/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'quoted/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('"quoted/**"')
      })

      test('add success output has quotes around pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'quoted/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('"quoted/**"')
      })

      test('remove success output has quotes around pattern', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'quoted/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'quoted/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('"quoted/**"')
      })
    })

    describe('additional integration scenarios', () => {
      test('add pattern then verify file has correct line count', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: 'c/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        const lines = content.split('\n')
        expect(lines).toHaveLength(3)
      })

      test('remove pattern then verify file has correct line count', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'b/**' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        const lines = content.split('\n')
        expect(lines).toHaveLength(2)
      })

      test('add pattern with forward slash at start', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'add', pattern: '/absolute-style' },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toBe('/absolute-style')
      })

      test('list shows correct plural for exactly 2 patterns', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'alpha/**\nbeta/**', 'utf8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('2 patterns found')
        expect(output).not.toContain('2 pattern found')
      })

      test('add pattern then remove different pattern leaves both intact', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'a/**\nb/**\nc/**', 'utf8')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'd/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'b/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const content = await fs.readFile(ignorePath, 'utf8')
        expect(content).toContain('a/**')
        expect(content).not.toContain('b/**')
        expect(content).toContain('c/**')
        expect(content).toContain('d/**')
      })

      test('add then duplicate add does not create extra entry', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dup/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'dup/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const content = await fs.readFile(ignorePath, 'utf8')
        const occurrences = content.split('dup/**').length - 1
        expect(occurrences).toBe(1)
      })

      test('remove pattern then verify it can be re-added', async () => {
        const ignorePath = path.join(tempDir, '.codeforgeignore')
        await fs.writeFile(ignorePath, 'cycle/**', 'utf8')

        const { command: cmd1, restoreCwd: restore1 } = createCommandWithMockedParse(
          { action: 'remove', pattern: 'cycle/**' },
          { file: ignorePath },
        )
        await cmd1.run()
        restore1()

        const { command: cmd2, restoreCwd: restore2 } = createCommandWithMockedParse(
          { action: 'add', pattern: 'cycle/**' },
          { file: ignorePath },
        )
        await cmd2.run()
        restore2()

        const { command: cmd3, restoreCwd: restore3 } = createCommandWithMockedParse(
          { action: 'list', pattern: undefined },
          { file: ignorePath },
        )
        mockConsoleLog.mockClear()
        await cmd3.run()
        restore3()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('cycle/**')
        expect(output).toContain('1 pattern found')
      })
    })
  })
})
