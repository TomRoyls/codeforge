import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Precommit Command', () => {
  let Precommit: typeof import('../../../src/commands/precommit.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Precommit = (await import('../../../src/commands/precommit.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-precommit-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Precommit.description).toBe('Set up git pre-commit hooks to run CodeForge')
    })

    test('has examples defined', () => {
      expect(Precommit.examples).toBeDefined()
      expect(Precommit.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Precommit.flags).toBeDefined()
      expect(Precommit.flags.command).toBeDefined()
      expect(Precommit.flags.force).toBeDefined()
      expect(Precommit.flags.installer).toBeDefined()
    })

    test('installer flag has correct options', () => {
      expect(Precommit.flags.installer.options).toContain('git')
      expect(Precommit.flags.installer.options).toContain('husky')
    })

    test('installer flag has default value git', () => {
      expect(Precommit.flags.installer.default).toBe('git')
    })

    test('force flag has default false', () => {
      expect(Precommit.flags.force.default).toBe(false)
    })

    test('command flag has default value', () => {
      expect(Precommit.flags.command.default).toBe('codeforge analyze --staged')
    })
  })

  describe('Flag characters', () => {
    test('command flag has char c', () => {
      expect(Precommit.flags.command.char).toBe('c')
    })

    test('force flag has char f', () => {
      expect(Precommit.flags.force.char).toBe('f')
    })

    test('installer flag has char i', () => {
      expect(Precommit.flags.installer.char).toBe('i')
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Precommit([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    async function createGitRepository(dir: string) {
      const gitDir = path.join(dir, '.git')
      const hooksDir = path.join(gitDir, 'hooks')
      await fs.mkdir(hooksDir, { recursive: true })
    }

    test('creates git pre-commit hook by default', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      const exists = await fs
        .access(hookPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).toContain('codeforge analyze --staged')
      expect(content).toContain('#!/usr/bin/env sh')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates husky pre-commit hook when installer is husky', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'husky',
      })
      await cmd.run()

      const hookPath = path.join(tempDir, '.husky', 'pre-commit')
      const exists = await fs
        .access(hookPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).toContain('codeforge analyze --staged')
      expect(content).toContain('. "$(dirname -- "$0")/_/husky.sh"')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates hook with custom command', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'npm test',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).toContain('npm test')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('sets executable permissions on hook file', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      const stats = await fs.stat(hookPath)
      const mode = stats.mode & 0o777
      expect(mode).toBe(0o755)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs success message', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Created pre-commit hook')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs next steps', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Next steps')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs husky-specific next steps when installer is husky', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'husky',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Ensure husky is installed')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('errors when not in a git repository', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('Not a git repository')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('errors when hook exists and force is false', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      await fs.writeFile(hookPath, 'old content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('already exists')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('overwrites existing hook when force is true', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      await fs.writeFile(hookPath, 'old content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: true,
        installer: 'git',
      })
      await cmd.run()

      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).not.toContain('old content')
      expect(content).toContain('codeforge analyze --staged')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates hooks directory if it does not exist', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const hooksDir = path.join(tempDir, '.git', 'hooks')
      await fs.rm(hooksDir, { recursive: true, force: true })

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const hookPath = path.join(hooksDir, 'pre-commit')
      const exists = await fs
        .access(hookPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('creates .husky directory if it does not exist', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'husky',
      })
      await cmd.run()

      const hookPath = path.join(tempDir, '.husky', 'pre-commit')
      const exists = await fs
        .access(hookPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    describe('Private methods', () => {
      describe('generateHookContent', () => {
        test('generates hook content with default command', () => {
          const cmd = new Precommit([], {} as never)
          const options = {
            command: 'codeforge analyze --staged',
            force: false,
            installer: 'git' as const,
          }

          const result = (
            cmd as unknown as { generateHookContent: (o: typeof options) => string }
          ).generateHookContent(options)

          expect(result).toContain('#!/usr/bin/env sh')
          expect(result).toContain('codeforge analyze --staged')
          expect(result).toContain('. "$(dirname -- "$0")/_/husky.sh"')
        })

        test('generates hook content with custom command', () => {
          const cmd = new Precommit([], {} as never)
          const options = {
            command: 'npm run lint',
            force: false,
            installer: 'git' as const,
          }

          const result = (
            cmd as unknown as { generateHookContent: (o: typeof options) => string }
          ).generateHookContent(options)

          expect(result).toContain('npm run lint')
        })

        test('includes husky.sh source with error suppression', () => {
          const cmd = new Precommit([], {} as never)
          const options = {
            command: 'codeforge analyze --staged',
            force: false,
            installer: 'git' as const,
          }

          const result = (
            cmd as unknown as { generateHookContent: (o: typeof options) => string }
          ).generateHookContent(options)

          expect(result).toContain('2>/dev/null || true')
        })
      })

      describe('getGitHookPath', () => {
        test('returns correct git hooks path', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getGitHookPath: () => string }).getGitHookPath()

          expect(result).toBe(path.join(tempDir, '.git', 'hooks', 'pre-commit'))

          vi.spyOn(process, 'cwd').mockRestore()
        })
      })

      describe('getHuskyHookPath', () => {
        test('returns correct husky hooks path', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getHuskyHookPath: () => string }).getHuskyHookPath()

          expect(result).toBe(path.join(tempDir, '.husky', 'pre-commit'))

          vi.spyOn(process, 'cwd').mockRestore()
        })
      })

      describe('isGitRepository', () => {
        test('returns true when .git directory exists', async () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
          await createGitRepository(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { isGitRepository: () => boolean }).isGitRepository()

          expect(result).toBe(true)

          vi.spyOn(process, 'cwd').mockRestore()
        })

        test('returns false when .git directory does not exist', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { isGitRepository: () => boolean }).isGitRepository()

          expect(result).toBe(false)

          vi.spyOn(process, 'cwd').mockRestore()
        })
      })
    })
  })
})
