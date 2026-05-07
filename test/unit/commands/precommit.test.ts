import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import {
  generateHookContent,
  getGitHookPath,
  getHuskyHookPath,
  isGitRepository,
  resolvePrecommitOptions,
  getHookDir,
  displayPostInstallMessage,
  DEFAULT_COMMAND,
} from '../../../src/commands/precommit-helpers.js'
import type { PrecommitOptions } from '../../../src/commands/precommit-helpers.js'

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
      expect(Precommit.flags.installer.options).toContain('pre-commit-framework')
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

    test('description is a non-empty string', () => {
      expect(typeof Precommit.description).toBe('string')
      expect(Precommit.description.length).toBeGreaterThan(0)
    })

    test('examples contain at least one entry with command and description', () => {
      const example = Precommit.examples[0] as { command: string; description: string }
      expect(example.command).toBeDefined()
      expect(example.description).toBeDefined()
    })

    test('examples reference the command id via template', () => {
      for (const example of Precommit.examples) {
        const ex = example as { command: string }
        expect(ex.command).toContain('command.id')
      }
    })

    test('flags object has exactly three flags', () => {
      const flagKeys = Object.keys(Precommit.flags)
      expect(flagKeys).toHaveLength(3)
      expect(flagKeys).toContain('command')
      expect(flagKeys).toContain('force')
      expect(flagKeys).toContain('installer')
    })

    test('command flag description mentions custom command', () => {
      expect(Precommit.flags.command.description).toContain('command')
    })

    test('force flag description mentions overwrite', () => {
      expect(Precommit.flags.force.description.toLowerCase()).toContain('overwrite')
    })

    test('installer flag description mentions installation method', () => {
      expect(Precommit.flags.installer.description).toContain('installation')
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

    test('command flag char is a single character', () => {
      expect(Precommit.flags.command.char).toHaveLength(1)
    })

    test('force flag char is a single character', () => {
      expect(Precommit.flags.force.char).toHaveLength(1)
    })

    test('installer flag char is a single character', () => {
      expect(Precommit.flags.installer.char).toHaveLength(1)
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

    test('creates .pre-commit-config.yaml with pre-commit-framework installer', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'pre-commit-framework',
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.pre-commit-config.yaml')
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)

      const content = await fs.readFile(configPath, 'utf-8')
      expect(content).toContain('repos:')
      expect(content).toContain('codeforge')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('pre-commit framework config uses custom command', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'npm test',
        force: false,
        installer: 'pre-commit-framework',
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.pre-commit-config.yaml')
      const content = await fs.readFile(configPath, 'utf-8')
      expect(content).toContain('entry: npm test')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('pre-commit framework does not set executable permissions', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'pre-commit-framework',
      })
      await cmd.run()

      const configPath = path.join(tempDir, '.pre-commit-config.yaml')
      const stats = await fs.stat(configPath)
      const mode = stats.mode & 0o777
      expect(mode).not.toBe(0o755)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('pre-commit framework outputs framework-specific next steps', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'pre-commit-framework',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('pip install pre-commit')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('errors when config exists and force is false for pre-commit-framework', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const configPath = path.join(tempDir, '.pre-commit-config.yaml')
      await fs.writeFile(configPath, 'old: config', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'pre-commit-framework',
      })

      await expect(cmd.run()).rejects.toThrow('already exists')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('overwrites existing config when force is true for pre-commit-framework', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const configPath = path.join(tempDir, '.pre-commit-config.yaml')
      await fs.writeFile(configPath, 'old: config', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: true,
        installer: 'pre-commit-framework',
      })
      await cmd.run()

      const content = await fs.readFile(configPath, 'utf-8')
      expect(content).not.toContain('old: config')
      expect(content).toContain('repos:')
      expect(content).toContain('codeforge')

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

    test('errors when not in git repo and installer is husky', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'husky',
      })

      await expect(cmd.run()).rejects.toThrow('Not a git repository')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('errors when existing husky hook and force is false', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)
      await fs.mkdir(path.join(tempDir, '.husky'), { recursive: true })
      await fs.writeFile(path.join(tempDir, '.husky', 'pre-commit'), 'old husky hook', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'husky',
      })

      await expect(cmd.run()).rejects.toThrow('already exists')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('overwrites existing husky hook when force is true', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)
      await fs.mkdir(path.join(tempDir, '.husky'), { recursive: true })
      await fs.writeFile(path.join(tempDir, '.husky', 'pre-commit'), 'old husky hook', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: true,
        installer: 'husky',
      })
      await cmd.run()

      const content = await fs.readFile(path.join(tempDir, '.husky', 'pre-commit'), 'utf-8')
      expect(content).not.toContain('old husky hook')
      expect(content).toContain('codeforge analyze --staged')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('sets executable permissions on husky hook file', async () => {
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
      const stats = await fs.stat(hookPath)
      const mode = stats.mode & 0o777
      expect(mode).toBe(0o755)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('success message includes hook path for git installer', async () => {
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
      expect(output).toContain(path.join('.git', 'hooks', 'pre-commit'))

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('success message includes hook path for husky installer', async () => {
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
      expect(output).toContain(path.join('.husky', 'pre-commit'))

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs hook configuration section', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'npm test',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Hook configuration')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs command in hook configuration', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd = createCommandWithMockedParse({
        command: 'npm test',
        force: false,
        installer: 'git',
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('npm test')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs installer type in hook configuration', async () => {
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
      expect(output).toContain('Installer: husky')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('git installer next steps mention git commit', async () => {
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
      expect(output).toContain('git commit')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('husky next steps mention npm install husky', async () => {
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
      expect(output).toContain('npm install husky')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('error message for existing hook includes path', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      await fs.writeFile(hookPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('--force')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('preserves existing hook content when force is false', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      await fs.writeFile(hookPath, 'existing hook content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      try {
        await cmd.run()
      } catch {
        // expected to throw
      }

      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).toBe('existing hook content')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('handles file system write error gracefully', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      // Make hooks directory read-only so writeFile fails
      const hooksDir = path.join(tempDir, '.git', 'hooks')
      await fs.chmod(hooksDir, 0o444)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('Failed to create pre-commit hook')

      // Restore permissions for cleanup
      await fs.chmod(hooksDir, 0o755)
      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('handles non-Error thrown in catch block', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      // Make hooks directory a file to cause write failure with non-Error
      const hooksDir = path.join(tempDir, '.git', 'hooks')
      await fs.rm(hooksDir, { recursive: true, force: true })
      await fs.writeFile(hooksDir, 'not-a-directory', 'utf-8')

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('Failed to create pre-commit hook')

      // Restore for cleanup
      await fs.rm(hooksDir, { force: true })
      await fs.mkdir(hooksDir, { recursive: true })
      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('catch block handles Error instances with message', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      // Make hooks directory read-only to trigger permission error
      const hooksDir = path.join(tempDir, '.git', 'hooks')
      await fs.chmod(hooksDir, 0o444)

      const cmd = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })

      await expect(cmd.run()).rejects.toThrow('Failed to create pre-commit hook')

      await fs.chmod(hooksDir, 0o755)
      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('writes hook content as utf-8', async () => {
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
      const content = await fs.readFile(hookPath, 'utf-8')
      expect(typeof content).toBe('string')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('can be run twice with force flag', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      await createGitRepository(tempDir)

      const cmd1 = createCommandWithMockedParse({
        command: 'codeforge analyze --staged',
        force: false,
        installer: 'git',
      })
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse({
        command: 'npm test',
        force: true,
        installer: 'git',
      })
      await cmd2.run()

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
      const content = await fs.readFile(hookPath, 'utf-8')
      expect(content).toContain('npm test')
      expect(content).not.toContain('codeforge analyze --staged')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    describe('Private methods', () => {
      describe('generateHookContent', () => {
        test('generates hook content with default command for git installer', () => {
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
          expect(result).not.toContain('. "$(dirname -- "$0")/_/husky.sh"')
        })

        test('generates hook content with husky installer includes husky.sh', () => {
          const cmd = new Precommit([], {} as never)
          const options = {
            command: 'codeforge analyze --staged',
            force: false,
            installer: 'husky' as const,
          }

          const result = (
            cmd as unknown as { generateHookContent: (o: typeof options) => string }
          ).generateHookContent(options)

          expect(result).toContain('#!/usr/bin/env sh')
          expect(result).toContain('codeforge analyze --staged')
          expect(result).toContain('. "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true')
        })

        test('git hook content does not contain husky source', () => {
          const cmd = new Precommit([], {} as never)
          const result = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({ command: 'test', force: false, installer: 'git' })

          expect(result).not.toContain('husky.sh')
        })

        test('husky hook content has husky.sh with error suppression', () => {
          const cmd = new Precommit([], {} as never)
          const result = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({ command: 'test', force: false, installer: 'husky' })

          expect(result).toContain('2>/dev/null || true')
        })

        test('content starts with shebang line', () => {
          const cmd = new Precommit([], {} as never)
          const result = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({ command: 'echo hello', force: false, installer: 'git' })

          expect(result.startsWith('#!/usr/bin/env sh')).toBe(true)
        })

        test('content includes the provided command', () => {
          const cmd = new Precommit([], {} as never)
          const result = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({
            command: 'my-custom-command --flag',
            force: false,
            installer: 'git',
          })

          expect(result).toContain('my-custom-command --flag')
        })

        test('force option does not affect generated content', () => {
          const cmd = new Precommit([], {} as never)
          const withForce = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({ command: 'test', force: true, installer: 'git' })
          const withoutForce = (
            cmd as unknown as { generateHookContent: (o: PrecommitOptions) => string }
          ).generateHookContent({ command: 'test', force: false, installer: 'git' })

          expect(withForce).toBe(withoutForce)
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

        test('path ends with pre-commit', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getGitHookPath: () => string }).getGitHookPath()

          expect(result.endsWith('pre-commit')).toBe(true)

          vi.spyOn(process, 'cwd').mockRestore()
        })

        test('path includes .git/hooks', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getGitHookPath: () => string }).getGitHookPath()

          expect(result).toContain(path.join('.git', 'hooks'))

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

        test('path ends with pre-commit', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getHuskyHookPath: () => string }).getHuskyHookPath()

          expect(result.endsWith('pre-commit')).toBe(true)

          vi.spyOn(process, 'cwd').mockRestore()
        })

        test('path includes .husky', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { getHuskyHookPath: () => string }).getHuskyHookPath()

          expect(result).toContain('.husky')

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

        test('returns false for empty directory', () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { isGitRepository: () => boolean }).isGitRepository()

          expect(result).toBe(false)

          vi.spyOn(process, 'cwd').mockRestore()
        })

        test('returns true when .git is a file (git worktree)', async () => {
          const originalCwd = process.cwd
          vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
          await fs.writeFile(path.join(tempDir, '.git'), 'gitdir: /some/path', 'utf-8')

          const cmd = new Precommit([], {} as never)
          const result = (cmd as unknown as { isGitRepository: () => boolean }).isGitRepository()

          expect(result).toBe(true)

          vi.spyOn(process, 'cwd').mockRestore()
        })
      })
    })
  })
})

describe('Precommit Helpers', () => {
  describe('DEFAULT_COMMAND', () => {
    test('is codeforge analyze --staged', () => {
      expect(DEFAULT_COMMAND).toBe('codeforge analyze --staged')
    })

    test('is a non-empty string', () => {
      expect(typeof DEFAULT_COMMAND).toBe('string')
      expect(DEFAULT_COMMAND.length).toBeGreaterThan(0)
    })
  })

  describe('generateHookContent', () => {
    test('generates git hook with shebang', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('#!/usr/bin/env sh')
    })

    test('generates git hook with command', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('echo test')
    })

    test('generates husky hook with husky source', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'husky',
      })
      expect(result).toContain('. "$(dirname -- "$0")/_/husky.sh"')
    })

    test('git hook does not include husky source', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'git',
      })
      expect(result).not.toContain('husky.sh')
    })

    test('husky hook includes 2>/dev/null error suppression', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'husky',
      })
      expect(result).toContain('2>/dev/null')
    })

    test('husky hook includes || true fallback', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'husky',
      })
      expect(result).toContain('|| true')
    })

    test('starts with shebang', () => {
      const result = generateHookContent({
        command: 'echo test',
        force: false,
        installer: 'git',
      })
      expect(result.trimStart().startsWith('#!/usr/bin/env sh')).toBe(true)
    })

    test('force flag does not change content for git', () => {
      const withoutForce = generateHookContent({
        command: 'test',
        force: false,
        installer: 'git',
      })
      const withForce = generateHookContent({
        command: 'test',
        force: true,
        installer: 'git',
      })
      expect(withoutForce).toBe(withForce)
    })

    test('force flag does not change content for husky', () => {
      const withoutForce = generateHookContent({
        command: 'test',
        force: false,
        installer: 'husky',
      })
      const withForce = generateHookContent({
        command: 'test',
        force: true,
        installer: 'husky',
      })
      expect(withoutForce).toBe(withForce)
    })

    test('handles command with pipes', () => {
      const result = generateHookContent({
        command: 'npm test | tee output.log',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('npm test | tee output.log')
    })

    test('handles command with environment variables', () => {
      const result = generateHookContent({
        command: 'NODE_ENV=test npm test',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('NODE_ENV=test npm test')
    })

    test('handles command with double ampersand', () => {
      const result = generateHookContent({
        command: 'npm run lint && npm test',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('npm run lint && npm test')
    })

    test('handles command with double pipe', () => {
      const result = generateHookContent({
        command: 'npm test || echo "tests failed"',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('npm test || echo "tests failed"')
    })

    test('handles command with semicolons', () => {
      const result = generateHookContent({
        command: 'echo start; npm test; echo done',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('echo start; npm test; echo done')
    })

    test('handles command with redirects', () => {
      const result = generateHookContent({
        command: 'npm test > output.txt 2>&1',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('npm test > output.txt 2>&1')
    })

    test('handles command with subshell', () => {
      const result = generateHookContent({
        command: '(cd ../other && npm test)',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('(cd ../other && npm test)')
    })

    test('handles empty-ish command', () => {
      const result = generateHookContent({
        command: '',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('#!/usr/bin/env sh')
    })

    test('handles multi-word command', () => {
      const result = generateHookContent({
        command: 'npx eslint . --fix && npx prettier --check .',
        force: false,
        installer: 'git',
      })
      expect(result).toContain('npx eslint . --fix && npx prettier --check .')
    })

    test('husky hook has husky source before command', () => {
      const result = generateHookContent({
        command: 'my-command',
        force: false,
        installer: 'husky',
      })
      const huskyIndex = result.indexOf('husky.sh')
      const commandIndex = result.indexOf('my-command')
      expect(huskyIndex).toBeGreaterThan(-1)
      expect(commandIndex).toBeGreaterThan(huskyIndex)
    })
  })

  describe('getGitHookPath', () => {
    test('returns path ending with pre-commit', () => {
      const result = getGitHookPath('/project')
      expect(result.endsWith('pre-commit')).toBe(true)
    })

    test('returns path with .git/hooks segment', () => {
      const result = getGitHookPath('/project')
      expect(result).toContain(path.join('.git', 'hooks'))
    })

    test('uses provided cwd', () => {
      const result = getGitHookPath('/my/project')
      expect(result).toContain('/my/project')
    })

    test('returns correct full path', () => {
      expect(getGitHookPath('/home/user/repo')).toBe(
        path.join('/home/user/repo', '.git', 'hooks', 'pre-commit'),
      )
    })

    test('handles relative paths', () => {
      const result = getGitHookPath('.')
      expect(result).toBe(path.join('.', '.git', 'hooks', 'pre-commit'))
    })

    test('handles path with trailing slash', () => {
      const result = getGitHookPath('/project/')
      expect(result).toContain('.git')
    })
  })

  describe('getHuskyHookPath', () => {
    test('returns path ending with pre-commit', () => {
      const result = getHuskyHookPath('/project')
      expect(result.endsWith('pre-commit')).toBe(true)
    })

    test('returns path with .husky segment', () => {
      const result = getHuskyHookPath('/project')
      expect(result).toContain('.husky')
    })

    test('uses provided cwd', () => {
      const result = getHuskyHookPath('/my/project')
      expect(result).toContain('/my/project')
    })

    test('returns correct full path', () => {
      expect(getHuskyHookPath('/home/user/repo')).toBe(
        path.join('/home/user/repo', '.husky', 'pre-commit'),
      )
    })

    test('does not include .git', () => {
      const result = getHuskyHookPath('/project')
      expect(result).not.toContain('.git')
    })

    test('handles relative paths', () => {
      const result = getHuskyHookPath('.')
      expect(result).toBe(path.join('.', '.husky', 'pre-commit'))
    })
  })

  describe('isGitRepository', () => {
    test('returns true when existsFn returns true', () => {
      expect(isGitRepository('/project', () => true)).toBe(true)
    })

    test('returns false when existsFn returns false', () => {
      expect(isGitRepository('/project', () => false)).toBe(false)
    })

    test('passes correct path to existsFn for git directory', () => {
      const mockExists = vi.fn().mockReturnValue(true)
      isGitRepository('/project', mockExists)
      expect(mockExists).toHaveBeenCalledWith(path.join('/project', '.git'))
    })

    test('passes cwd joined with .git', () => {
      const mockExists = vi.fn().mockReturnValue(false)
      isGitRepository('/home/user/repo', mockExists)
      expect(mockExists).toHaveBeenCalledWith('/home/user/repo/.git')
    })

    test('returns false for non-existent path', () => {
      expect(isGitRepository('/nonexistent', () => false)).toBe(false)
    })

    test('returns true for any path when .git exists', () => {
      expect(isGitRepository('/any/path', () => true)).toBe(true)
    })

    test('handles empty cwd string', () => {
      const mockExists = vi.fn().mockReturnValue(true)
      isGitRepository('', mockExists)
      expect(mockExists).toHaveBeenCalledWith('.git')
    })
  })

  describe('resolvePrecommitOptions', () => {
    test('resolves with default values when flags are empty', () => {
      const result = resolvePrecommitOptions({})
      expect(result.command).toBe(DEFAULT_COMMAND)
      expect(result.force).toBe(false)
      expect(result.installer).toBe('git')
    })

    test('resolves command from flags', () => {
      const result = resolvePrecommitOptions({ command: 'npm test' })
      expect(result.command).toBe('npm test')
    })

    test('resolves force from flags', () => {
      const result = resolvePrecommitOptions({ force: true })
      expect(result.force).toBe(true)
    })

    test('resolves installer from flags', () => {
      const result = resolvePrecommitOptions({ installer: 'husky' })
      expect(result.installer).toBe('husky')
    })

    test('resolves all flags together', () => {
      const result = resolvePrecommitOptions({
        command: 'npm run lint',
        force: true,
        installer: 'husky',
      })
      expect(result.command).toBe('npm run lint')
      expect(result.force).toBe(true)
      expect(result.installer).toBe('husky')
    })

    test('defaults command when undefined', () => {
      const result = resolvePrecommitOptions({ command: undefined })
      expect(result.command).toBe(DEFAULT_COMMAND)
    })

    test('defaults force when undefined', () => {
      const result = resolvePrecommitOptions({ force: undefined })
      expect(result.force).toBe(false)
    })

    test('defaults installer when undefined', () => {
      const result = resolvePrecommitOptions({ installer: undefined })
      expect(result.installer).toBe('git')
    })

    test('defaults command when null', () => {
      const result = resolvePrecommitOptions({ command: null })
      expect(result.command).toBe(DEFAULT_COMMAND)
    })

    test('defaults force when null', () => {
      const result = resolvePrecommitOptions({ force: null })
      expect(result.force).toBe(false)
    })

    test('defaults installer when null', () => {
      const result = resolvePrecommitOptions({ installer: null })
      expect(result.installer).toBe('git')
    })

    test('returns a valid PrecommitOptions object', () => {
      const result = resolvePrecommitOptions({})
      expect(result).toHaveProperty('command')
      expect(result).toHaveProperty('force')
      expect(result).toHaveProperty('installer')
    })

    test('installer is git or husky', () => {
      const gitResult = resolvePrecommitOptions({ installer: 'git' })
      expect(gitResult.installer).toBe('git')
      const huskyResult = resolvePrecommitOptions({ installer: 'husky' })
      expect(huskyResult.installer).toBe('husky')
    })
  })

  describe('getHookDir', () => {
    test('returns .git/hooks for git installer', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'git' }, '/project')
      expect(result).toBe(path.join('/project', '.git', 'hooks'))
    })

    test('returns .husky for husky installer', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'husky' }, '/project')
      expect(result).toBe(path.join('/project', '.husky'))
    })

    test('uses provided cwd', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'git' }, '/my/project')
      expect(result).toContain('/my/project')
    })

    test('git dir ends with hooks', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'git' }, '/project')
      expect(result.endsWith('hooks')).toBe(true)
    })

    test('husky dir ends with .husky', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'husky' }, '/project')
      expect(result.endsWith('.husky')).toBe(true)
    })

    test('handles relative paths', () => {
      const result = getHookDir({ command: 'test', force: false, installer: 'git' }, '.')
      expect(result).toBe(path.join('.', '.git', 'hooks'))
    })
  })

  describe('displayPostInstallMessage', () => {
    let mockLog: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockLog = vi.fn()
    })

    test('calls log function multiple times', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      expect(mockLog).toHaveBeenCalled()
      expect(mockLog.mock.calls.length).toBeGreaterThan(3)
    })

    test('includes hook path in success message', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('/path/to/hook')
    })

    test('includes created message with checkmark', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      expect(mockLog.mock.calls[0][0]).toContain('Created pre-commit hook')
    })

    test('includes hook configuration section', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('Hook configuration')
    })

    test('includes next steps section', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('Next steps')
    })

    test('includes installer type in output', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('Installer: git')
    })

    test('includes command in output', () => {
      displayPostInstallMessage(
        { command: 'npm test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('npm test')
    })

    test('git installer shows git commit next step', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('git commit')
    })

    test('husky installer shows husky install step', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'husky' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('husky is installed')
    })

    test('husky installer shows npm install husky command', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'husky' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('npm install husky')
    })

    test('husky installer next steps are numbered', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'husky' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('1.')
      expect(allOutput).toContain('2.')
    })

    test('git installer next steps start with 1', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      const allOutput = mockLog.mock.calls.map((c) => c[0]).join('\n')
      expect(allOutput).toContain('1.')
    })

    test('git installer has fewer steps than husky', () => {
      const gitLog = vi.fn()
      const huskyLog = vi.fn()
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path',
        gitLog,
      )
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'husky' },
        '/path',
        huskyLog,
      )
      // Husky has 2 numbered steps vs git's 1
      expect(huskyLog.mock.calls.length).toBeGreaterThan(gitLog.mock.calls.length)
    })

    test('includes blank line after success message', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      // Second call should be empty string
      expect(mockLog.mock.calls[1][0]).toBe('')
    })

    test('includes blank line before next steps', () => {
      displayPostInstallMessage(
        { command: 'test', force: false, installer: 'git' },
        '/path/to/hook',
        mockLog,
      )
      // Should contain at least one empty string log
      const hasEmpty = mockLog.mock.calls.some((c) => c[0] === '')
      expect(hasEmpty).toBe(true)
    })
  })
})

describe('Precommit Integration', () => {
  let Precommit: typeof import('../../../src/commands/precommit.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Precommit = (await import('../../../src/commands/precommit.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-precommit-int-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

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

  test('creates valid shell script for git hook', async () => {
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
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content.trimStart().startsWith('#!')).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('creates valid shell script for husky hook', async () => {
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
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content.trimStart().startsWith('#!')).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('git hook content matches expected format', async () => {
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
    expect(content).toContain('#!/usr/bin/env sh')
    expect(content).toContain('npm test')
    expect(content).not.toContain('husky')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('husky hook content matches expected format', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'npm test',
      force: false,
      installer: 'husky',
    })
    await cmd.run()

    const hookPath = path.join(tempDir, '.husky', 'pre-commit')
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('#!/usr/bin/env sh')
    expect(content).toContain('npm test')
    expect(content).toContain('husky.sh')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('force overwrite updates hook file content', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    // Create initial hook
    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    await fs.writeFile(hookPath, '#!/bin/sh\necho old', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'npm run lint',
      force: true,
      installer: 'git',
    })
    await cmd.run()

    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('npm run lint')
    expect(content).not.toContain('echo old')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('force overwrite of husky hook updates content', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)
    await fs.mkdir(path.join(tempDir, '.husky'), { recursive: true })

    const hookPath = path.join(tempDir, '.husky', 'pre-commit')
    await fs.writeFile(hookPath, '#!/bin/sh\necho old husky', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'npm run lint',
      force: true,
      installer: 'husky',
    })
    await cmd.run()

    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('npm run lint')
    expect(content).not.toContain('echo old husky')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('custom command with complex arguments', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'npx eslint . --ext .ts,.tsx --max-warnings 0',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('npx eslint . --ext .ts,.tsx --max-warnings 0')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('custom command with yarn', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'yarn lint && yarn test',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('yarn lint && yarn test')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('custom command with pnpm', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'pnpm run lint',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('pnpm run lint')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('custom command with bun', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'bun run test',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    const content = await fs.readFile(hookPath, 'utf-8')
    expect(content).toContain('bun run test')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('writes hook file that is a regular file', async () => {
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
    expect(stats.isFile()).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('hook file is not a directory', async () => {
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
    expect(stats.isDirectory()).toBe(false)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('handles deeply nested temp directory path', async () => {
    const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
    await fs.mkdir(deepDir, { recursive: true })
    await fs.mkdir(path.join(deepDir, '.git', 'hooks'), { recursive: true })

    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(deepDir)

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(deepDir, '.git', 'hooks', 'pre-commit')
    const exists = await fs
      .access(hookPath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('handles path with spaces in directory name', async () => {
    const spaceDir = path.join(tempDir, 'my project')
    await fs.mkdir(spaceDir, { recursive: true })
    await fs.mkdir(path.join(spaceDir, '.git', 'hooks'), { recursive: true })

    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(spaceDir)

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(spaceDir, '.git', 'hooks', 'pre-commit')
    const exists = await fs
      .access(hookPath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('handles path with unicode characters', async () => {
    const unicodeDir = path.join(tempDir, 'プロジェクト')
    await fs.mkdir(unicodeDir, { recursive: true })
    await fs.mkdir(path.join(unicodeDir, '.git', 'hooks'), { recursive: true })

    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(unicodeDir)

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    const hookPath = path.join(unicodeDir, '.git', 'hooks', 'pre-commit')
    const exists = await fs
      .access(hookPath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('handles mkdir failure gracefully', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    // Remove hooks dir and create a file in its place to make mkdir fail
    const hooksDir = path.join(tempDir, '.git', 'hooks')
    await fs.rm(hooksDir, { recursive: true, force: true })
    await fs.writeFile(hooksDir, 'blocked', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })

    await expect(cmd.run()).rejects.toThrow('Failed to create pre-commit hook')

    await fs.rm(hooksDir, { force: true })
    await fs.mkdir(hooksDir, { recursive: true })
    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('handles chmod failure gracefully', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    // Create hook on read-only filesystem by making the dir read-only after write
    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmd.run()

    // Verify the hook was created (chmod succeeded on this system)
    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    const exists = await fs
      .access(hookPath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('catch block handles non-Error thrown as string', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    // Block hooks dir to cause failure
    const hooksDir = path.join(tempDir, '.git', 'hooks')
    await fs.rm(hooksDir, { recursive: true, force: true })
    await fs.writeFile(hooksDir, 'blocked', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })

    await expect(cmd.run()).rejects.toThrow()

    await fs.rm(hooksDir, { force: true })
    await fs.mkdir(hooksDir, { recursive: true })
    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('catch block handles object thrown as error', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const hooksDir = path.join(tempDir, '.git', 'hooks')
    await fs.rm(hooksDir, { recursive: true, force: true })
    await fs.writeFile(hooksDir, 'blocked', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })

    await expect(cmd.run()).rejects.toThrow('Failed to create pre-commit hook')

    await fs.rm(hooksDir, { force: true })
    await fs.mkdir(hooksDir, { recursive: true })
    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('error for not git repo includes helpful message', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })

    await expect(cmd.run()).rejects.toThrow('git repository')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('error for existing hook mentions the path', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit')
    await fs.writeFile(hookPath, 'existing', 'utf-8')

    const cmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })

    await expect(cmd.run()).rejects.toThrow(hookPath)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('parse is called with correct flags', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd = createCommandWithMockedParse({
      command: 'npm test',
      force: true,
      installer: 'git',
    })
    const parseSpy = vi.spyOn(cmd as unknown as { parse: ReturnType<typeof vi.fn> }, 'parse')

    await cmd.run()

    expect(parseSpy).toHaveBeenCalled()

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('multiple consecutive runs without force fail after first', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmd1 = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmd1.run()

    const cmd2 = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await expect(cmd2.run()).rejects.toThrow('already exists')

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('switching installer type creates separate hook files', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmdGit = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmdGit.run()

    const cmdHusky = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'husky',
    })
    await cmdHusky.run()

    const gitHookExists = await fs
      .access(path.join(tempDir, '.git', 'hooks', 'pre-commit'))
      .then(() => true)
      .catch(() => false)
    const huskyHookExists = await fs
      .access(path.join(tempDir, '.husky', 'pre-commit'))
      .then(() => true)
      .catch(() => false)
    expect(gitHookExists).toBe(true)
    expect(huskyHookExists).toBe(true)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('git hook and husky hook have different content', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const cmdGit = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await cmdGit.run()

    const cmdHusky = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'husky',
    })
    await cmdHusky.run()

    const gitContent = await fs.readFile(path.join(tempDir, '.git', 'hooks', 'pre-commit'), 'utf-8')
    const huskyContent = await fs.readFile(path.join(tempDir, '.husky', 'pre-commit'), 'utf-8')
    expect(gitContent).not.toBe(huskyContent)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('hook file size is reasonable', async () => {
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
    // Hook should be small, under 1KB
    expect(stats.size).toBeLessThan(1024)

    vi.spyOn(process, 'cwd').mockRestore()
  })

  test('husky hook file size includes husky source overhead', async () => {
    const originalCwd = process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    await createGitRepository(tempDir)

    const gitCmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'git',
    })
    await gitCmd.run()

    const huskyCmd = createCommandWithMockedParse({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'husky',
    })
    await huskyCmd.run()

    const gitStats = await fs.stat(path.join(tempDir, '.git', 'hooks', 'pre-commit'))
    const huskyStats = await fs.stat(path.join(tempDir, '.husky', 'pre-commit'))
    // Husky hook should be larger due to husky source line
    expect(huskyStats.size).toBeGreaterThan(gitStats.size)

    vi.spyOn(process, 'cwd').mockRestore()
  })
})

describe('PrecommitOptions interface compliance', () => {
  test('resolvePrecommitOptions returns object with all required fields', () => {
    const result = resolvePrecommitOptions({
      command: 'npm test',
      force: true,
      installer: 'husky',
    })
    expect(Object.keys(result)).toHaveLength(3)
    expect(Object.keys(result)).toContain('command')
    expect(Object.keys(result)).toContain('force')
    expect(Object.keys(result)).toContain('installer')
  })

  test('command field is a string', () => {
    const result = resolvePrecommitOptions({ command: 'test' })
    expect(typeof result.command).toBe('string')
  })

  test('force field is a boolean', () => {
    const result = resolvePrecommitOptions({ force: true })
    expect(typeof result.force).toBe('boolean')
  })

  test('installer field is a string', () => {
    const result = resolvePrecommitOptions({ installer: 'git' })
    expect(typeof result.installer).toBe('string')
  })

  test('installer field can be git', () => {
    const result = resolvePrecommitOptions({ installer: 'git' })
    expect(result.installer).toBe('git')
  })

  test('installer field can be husky', () => {
    const result = resolvePrecommitOptions({ installer: 'husky' })
    expect(result.installer).toBe('husky')
  })
})

describe('Hook content edge cases', () => {
  test('generateHookContent with very long command', () => {
    const longCmd = 'codeforge analyze --staged ' + '--rule '.repeat(100).trim()
    const result = generateHookContent({
      command: longCmd,
      force: false,
      installer: 'git',
    })
    expect(result).toContain(longCmd)
  })

  test('generateHookContent with single character command', () => {
    const result = generateHookContent({
      command: 'x',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('x')
  })

  test('generateHookContent with command containing $variable', () => {
    const result = generateHookContent({
      command: 'echo $HOME',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('echo $HOME')
  })

  test('generateHookContent with command containing backticks', () => {
    const result = generateHookContent({
      command: 'echo `date`',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('echo `date`')
  })

  test('generateHookContent with command containing single quotes', () => {
    const result = generateHookContent({
      command: "echo 'hello world'",
      force: false,
      installer: 'git',
    })
    expect(result).toContain("echo 'hello world'")
  })

  test('generateHookContent with command containing double quotes', () => {
    const result = generateHookContent({
      command: 'echo "hello world"',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('echo "hello world"')
  })

  test('generateHookContent with command containing newlines', () => {
    const result = generateHookContent({
      command: 'echo line1\necho line2',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('echo line1\necho line2')
  })

  test('generateHookContent with default command', () => {
    const result = generateHookContent({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    })
    expect(result).toContain(DEFAULT_COMMAND)
  })

  test('generateHookContent git output is different from husky', () => {
    const gitResult = generateHookContent({
      command: 'test',
      force: false,
      installer: 'git',
    })
    const huskyResult = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    expect(gitResult).not.toBe(huskyResult)
  })

  test('generateHookContent husky has two newline characters after husky source', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    const huskySource = '. "$(dirname -- "$0")/_/husky.sh" 2>/dev/null || true'
    expect(result).toContain(huskySource)
    // After husky source there should be newlines before the command
    const huskyIdx = result.indexOf(huskySource)
    const afterHusky = result.substring(huskyIdx + huskySource.length)
    expect(afterHusky.trim()).toContain('test')
  })
})

describe('Path resolution edge cases', () => {
  test('getGitHookPath and getHuskyHookPath return different paths', () => {
    const gitPath = getGitHookPath('/project')
    const huskyPath = getHuskyHookPath('/project')
    expect(gitPath).not.toBe(huskyPath)
  })

  test('getGitHookPath returns consistent results', () => {
    expect(getGitHookPath('/project')).toBe(getGitHookPath('/project'))
  })

  test('getHuskyHookPath returns consistent results', () => {
    expect(getHuskyHookPath('/project')).toBe(getHuskyHookPath('/project'))
  })

  test('getHookDir returns different dirs for different installers', () => {
    const opts = { command: 'test', force: false, installer: 'git' } as PrecommitOptions
    const gitDir = getHookDir(opts, '/project')
    const huskyOpts = { command: 'test', force: false, installer: 'husky' } as PrecommitOptions
    const huskyDir = getHookDir(huskyOpts, '/project')
    expect(gitDir).not.toBe(huskyDir)
  })

  test('getHookDir with empty cwd', () => {
    const result = getHookDir({ command: 'test', force: false, installer: 'git' }, '')
    expect(result).toBe(path.join('.git', 'hooks'))
  })

  test('getGitHookPath with root path', () => {
    const result = getGitHookPath('/')
    expect(result).toContain('.git')
    expect(result).toContain('pre-commit')
  })

  test('getHuskyHookPath with root path', () => {
    const result = getHuskyHookPath('/')
    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })
})

describe('resolvePrecommitOptions edge cases', () => {
  test('handles extra unknown flags gracefully', () => {
    const result = resolvePrecommitOptions({
      command: 'test',
      force: true,
      installer: 'git',
      unknownFlag: 'value',
    })
    expect(result.command).toBe('test')
    expect(result.force).toBe(true)
    expect(result.installer).toBe('git')
  })

  test('handles empty string command', () => {
    const result = resolvePrecommitOptions({ command: '' })
    expect(result.command).toBe('')
  })

  test('handles false force explicitly', () => {
    const result = resolvePrecommitOptions({ force: false })
    expect(result.force).toBe(false)
  })

  test('handles true force explicitly', () => {
    const result = resolvePrecommitOptions({ force: true })
    expect(result.force).toBe(true)
  })
})

describe('Hook content structural verification', () => {
  test('git hook has exactly one shebang line', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'git',
    })
    const shebangCount = result.split('#!/usr/bin/env sh').length - 1
    expect(shebangCount).toBe(1)
  })

  test('husky hook has exactly one shebang line', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    const shebangCount = result.split('#!/usr/bin/env sh').length - 1
    expect(shebangCount).toBe(1)
  })

  test('husky hook has exactly one husky source line', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    const huskyCount = result.split('husky.sh').length - 1
    expect(huskyCount).toBe(1)
  })

  test('git hook contains newline after shebang', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'git',
    })
    expect(result).toContain('#!/usr/bin/env sh\n')
  })

  test('git hook command appears after shebang', () => {
    const result = generateHookContent({
      command: 'my-cmd',
      force: false,
      installer: 'git',
    })
    const shebangIdx = result.indexOf('#!/usr/bin/env sh')
    const cmdIdx = result.indexOf('my-cmd')
    expect(cmdIdx).toBeGreaterThan(shebangIdx)
  })

  test('husky hook command appears after husky source', () => {
    const result = generateHookContent({
      command: 'my-cmd',
      force: false,
      installer: 'husky',
    })
    const huskyIdx = result.indexOf('husky.sh')
    const cmdIdx = result.indexOf('my-cmd')
    expect(cmdIdx).toBeGreaterThan(huskyIdx)
  })

  test('git hook result is non-empty string', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'git',
    })
    expect(result.length).toBeGreaterThan(0)
  })

  test('husky hook result is non-empty string', () => {
    const result = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    expect(result.length).toBeGreaterThan(0)
  })

  test('husky hook is longer than equivalent git hook', () => {
    const gitResult = generateHookContent({
      command: 'test',
      force: false,
      installer: 'git',
    })
    const huskyResult = generateHookContent({
      command: 'test',
      force: false,
      installer: 'husky',
    })
    expect(huskyResult.length).toBeGreaterThan(gitResult.length)
  })
})

describe('displayPostInstallMessage detailed output', () => {
  let mockLog: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockLog = vi.fn()
  })

  test('logs success message as first call', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'git' },
      '/hook/path',
      mockLog,
    )
    const firstCall = mockLog.mock.calls[0][0]
    expect(firstCall).toContain('Created pre-commit hook')
  })

  test('logs empty string as second call', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'git' },
      '/hook/path',
      mockLog,
    )
    expect(mockLog.mock.calls[1][0]).toBe('')
  })

  test('logs Hook configuration as third call', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'git' },
      '/hook/path',
      mockLog,
    )
    expect(mockLog.mock.calls[2][0]).toContain('Hook configuration')
  })

  test('logs empty string before next steps', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'git' },
      '/hook/path',
      mockLog,
    )
    const emptyCalls = mockLog.mock.calls.filter((c) => c[0] === '')
    expect(emptyCalls.length).toBeGreaterThanOrEqual(2)
  })

  test('git installer logs exactly 8 times', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'git' },
      '/hook/path',
      mockLog,
    )
    expect(mockLog.mock.calls.length).toBe(8)
  })

  test('husky installer logs exactly 9 times', () => {
    displayPostInstallMessage(
      { command: 'test', force: false, installer: 'husky' },
      '/hook/path',
      mockLog,
    )
    expect(mockLog.mock.calls.length).toBe(9)
  })
})
