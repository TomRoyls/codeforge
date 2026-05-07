import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Danger Command', () => {
  let Danger: typeof import('../../../src/commands/danger.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Danger = (await import('../../../src/commands/danger.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-danger-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Danger.description).toBe('Generate a Dangerfile for Danger.js integration')
    })

    test('has examples defined', () => {
      expect(Danger.examples).toBeDefined()
      expect(Danger.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Danger.flags).toBeDefined()
      expect(Danger.flags.output).toBeDefined()
      expect(Danger.flags.force).toBeDefined()
      expect(Danger.flags['ci-command']).toBeDefined()
    })

    test('output flag has default value dangerfile.js', () => {
      expect(Danger.flags.output.default).toBe('dangerfile.js')
    })

    test('force flag has default false', () => {
      expect(Danger.flags.force.default).toBe(false)
    })

    test('ci-command flag has default value', () => {
      expect(Danger.flags['ci-command'].default).toBe(
        'codeforge analyze --format json --output codeforge-results.json',
      )
    })

    test('description is a non-empty string', () => {
      expect(typeof Danger.description).toBe('string')
      expect(Danger.description.length).toBeGreaterThan(0)
    })

    test('examples contain at least one entry with command and description', () => {
      const example = Danger.examples[0] as { command: string; description: string }
      expect(example.command).toBeDefined()
      expect(example.description).toBeDefined()
    })

    test('examples reference the command id via template', () => {
      for (const example of Danger.examples) {
        const ex = example as { command: string }
        expect(ex.command).toContain('command.id')
      }
    })

    test('flags object has exactly three flags', () => {
      const flagKeys = Object.keys(Danger.flags)
      expect(flagKeys).toHaveLength(3)
      expect(flagKeys).toContain('output')
      expect(flagKeys).toContain('force')
      expect(flagKeys).toContain('ci-command')
    })
  })

  describe('Flag characters', () => {
    test('output flag has char o', () => {
      expect(Danger.flags.output.char).toBe('o')
    })

    test('force flag has char f', () => {
      expect(Danger.flags.force.char).toBe('f')
    })

    test('ci-command flag has char c', () => {
      expect(Danger.flags['ci-command'].char).toBe('c')
    })
  })

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Danger([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    return command
  }

  describe('run', () => {
    test('creates Dangerfile with default settings', async () => {
      const cmd = createCommandWithMockedParse({
        output: path.join(tempDir, 'dangerfile.js'),
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const dangerfilePath = path.join(tempDir, 'dangerfile.js')
      const exists = await fs
        .access(dangerfilePath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(dangerfilePath, 'utf-8')
      expect(content).toContain('CodeForge Dangerfile Integration')
      expect(content).toContain('fail(message)')
    })

    test('creates Dangerfile with custom ci-command', async () => {
      const cmd = createCommandWithMockedParse({
        output: path.join(tempDir, 'dangerfile.js'),
        force: false,
        'ci-command': 'custom-analyze --json',
      })
      await cmd.run()

      const content = await fs.readFile(path.join(tempDir, 'dangerfile.js'), 'utf-8')
      expect(content).toContain('custom-analyze --json')
    })

    test('errors when Dangerfile exists and force is false', async () => {
      const outputPath = path.join(tempDir, 'dangerfile.js')
      await fs.writeFile(outputPath, 'old content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        output: outputPath,
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })

      await expect(cmd.run()).rejects.toThrow('already exists')
    })

    test('overwrites existing Dangerfile when force is true', async () => {
      const outputPath = path.join(tempDir, 'dangerfile.js')
      await fs.writeFile(outputPath, 'old content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        output: outputPath,
        force: true,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const content = await fs.readFile(outputPath, 'utf-8')
      expect(content).not.toContain('old content')
      expect(content).toContain('CodeForge Dangerfile Integration')
    })

    test('errors when output path is empty', async () => {
      const cmd = createCommandWithMockedParse({
        output: '',
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })

      await expect(cmd.run()).rejects.toThrow()
    })

    test('outputs success message', async () => {
      const cmd = createCommandWithMockedParse({
        output: path.join(tempDir, 'dangerfile.js'),
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Created')
    })

    test('outputs next steps', async () => {
      const cmd = createCommandWithMockedParse({
        output: path.join(tempDir, 'dangerfile.js'),
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Next steps')
    })

    test('next steps mention npm install danger', async () => {
      const cmd = createCommandWithMockedParse({
        output: path.join(tempDir, 'dangerfile.js'),
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('npm install danger')
    })

    test('creates nested directories if needed', async () => {
      const outputPath = path.join(tempDir, 'nested', 'dir', 'dangerfile.js')

      const cmd = createCommandWithMockedParse({
        output: outputPath,
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd.run()

      const exists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('preserves existing file when force is false', async () => {
      const outputPath = path.join(tempDir, 'dangerfile.js')
      await fs.writeFile(outputPath, 'existing hook content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        output: outputPath,
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })

      try {
        await cmd.run()
      } catch {
        // expected to throw
      }

      const content = await fs.readFile(outputPath, 'utf-8')
      expect(content).toBe('existing hook content')
    })

    test('can be run twice with force flag', async () => {
      const outputPath = path.join(tempDir, 'dangerfile.js')

      const cmd1 = createCommandWithMockedParse({
        output: outputPath,
        force: false,
        'ci-command': 'codeforge analyze --format json --output codeforge-results.json',
      })
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse({
        output: outputPath,
        force: true,
        'ci-command': 'custom cmd',
      })
      await cmd2.run()

      const content = await fs.readFile(outputPath, 'utf-8')
      expect(content).toContain('custom cmd')
      expect(content).not.toContain('codeforge analyze --format json --output codeforge-results.json')
    })
  })

  describe('Private methods', () => {
    describe('generateDangerfileContent', () => {
      test('generates content with default command', () => {
        const cmd = new Danger([], {} as never)
        const result = (
          cmd as unknown as {
            generateDangerfileContent: (o: import('../../../src/commands/danger-helpers.js').DangerfileOptions) => string
          }
        ).generateDangerfileContent({
          ciCommand: 'codeforge analyze --format json --output codeforge-results.json',
          outputFile: 'dangerfile.js',
          resultsFile: 'codeforge-results.json',
        })

        expect(result).toContain('CodeForge Dangerfile Integration')
        expect(result).toContain('codeforge analyze --format json --output codeforge-results.json')
      })

      test('generates content with custom command', () => {
        const cmd = new Danger([], {} as never)
        const result = (
          cmd as unknown as {
            generateDangerfileContent: (o: import('../../../src/commands/danger-helpers.js').DangerfileOptions) => string
          }
        ).generateDangerfileContent({
          ciCommand: 'my-custom-command',
          outputFile: 'results.json',
          resultsFile: 'codeforge-results.json',
        })

        expect(result).toContain('my-custom-command')
        expect(result).toContain('results.json')
      })

      test('content starts with comment header', () => {
        const cmd = new Danger([], {} as never)
        const result = (
          cmd as unknown as {
            generateDangerfileContent: (o: import('../../../src/commands/danger-helpers.js').DangerfileOptions) => string
          }
        ).generateDangerfileContent({
          ciCommand: 'cmd',
          outputFile: 'out.json',
          resultsFile: 'codeforge-results.json',
        })

        expect(result.startsWith('// CodeForge Dangerfile Integration')).toBe(true)
      })

      test('force option does not affect content', () => {
        const cmd = new Danger([], {} as never)
        const access = cmd as unknown as {
          generateDangerfileContent: (o: import('../../../src/commands/danger-helpers.js').DangerfileOptions) => string
        }
        const options: import('../../../src/commands/danger-helpers.js').DangerfileOptions = { ciCommand: 'cmd', outputFile: 'out.json', resultsFile: 'codeforge-results.json' }
        const content = access.generateDangerfileContent(options)
        expect(content).toContain('cmd')
      })
    })
  })
})

describe('Danger Helpers', () => {
  describe('generateDangerfileContent from helpers', () => {
    test('generates content with fail/warn/message mapping', async () => {
      const { generateDangerfileContent } = await import(
        '../../../src/commands/danger-helpers.js'
      )
      const content = generateDangerfileContent({
        ciCommand: 'cmd',
        outputFile: 'out.json',
        resultsFile: 'codeforge-results.json',
      })

      expect(content).toContain('violation.severity === "error"')
      expect(content).toContain('fail(message)')
      expect(content).toContain('violation.severity === "warning"')
      expect(content).toContain('warn(message)')
      expect(content).toContain('message(message)')
    })
  })

  describe('resolveDangerOptions from helpers', () => {
    test('maps output flag to outputFile', async () => {
      const { resolveDangerOptions } = await import('../../../src/commands/danger-helpers.js')
      const result = resolveDangerOptions({ output: 'my-file.js' })
      expect(result.outputFile).toBe('my-file.js')
    })

    test('maps ci-command flag to ciCommand', async () => {
      const { resolveDangerOptions } = await import('../../../src/commands/danger-helpers.js')
      const result = resolveDangerOptions({ ciCommand: 'my-cmd' })
      expect(result.ciCommand).toBe('my-cmd')
    })
  })
})
