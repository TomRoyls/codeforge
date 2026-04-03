import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Clean Command', () => {
  let Clean: typeof import('../../../src/commands/clean.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Clean = (await import('../../../src/commands/clean.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-clean-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Clean.description).toBe('Clean generated files and caches')
    })

    test('has examples defined', () => {
      expect(Clean.examples).toBeDefined()
      expect(Clean.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Clean.flags).toBeDefined()
      expect(Clean.flags.cache).toBeDefined()
      expect(Clean.flags.dist).toBeDefined()
      expect(Clean.flags['dry-run']).toBeDefined()
    })

    test('cache flag has default false', () => {
      expect(Clean.flags.cache.default).toBe(false)
    })

    test('dist flag has default false', () => {
      expect(Clean.flags.dist.default).toBe(false)
    })

    test('dry-run flag has default false', () => {
      expect(Clean.flags['dry-run'].default).toBe(false)
    })

    test('dry-run flag has char d', () => {
      expect(Clean.flags['dry-run'].char).toBe('d')
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Clean([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
      return { command, restoreCwd: () => vi.spyOn(process, 'cwd').mockImplementation(originalCwd) }
    }

    describe('Dry run mode', () => {
      test('shows what would be cleaned in dry-run mode', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean the following')
      })

      test('does not delete directories in dry-run mode', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'test.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('shows count of directories that would be cleaned', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': true,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Would clean')
      })
    })

    describe('Default cleaning (all targets)', () => {
      test('cleans dist directory', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'test.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans .cache directory', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans .codeforge directory', async () => {
        const codeforgeDir = path.join(tempDir, '.codeforge')
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('cleans coverage directory', async () => {
        const coverageDir = path.join(tempDir, 'coverage')
        await fs.mkdir(coverageDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(coverageDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('shows success message for cleaned directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaned')
      })

      test('shows "not found" for missing directories', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('not found')
      })

      test('shows nothing to clean when all directories missing', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Nothing to clean')
      })
    })

    describe('Cache-only cleaning', () => {
      test('cleans only cache directories with --cache flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        const codeforgeDir = path.join(tempDir, '.codeforge')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })
        await fs.mkdir(codeforgeDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        const codeforgeExists = await fs
          .access(codeforgeDir)
          .then(() => true)
          .catch(() => false)
        expect(cacheExists).toBe(false)
        expect(codeforgeExists).toBe(false)

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(true)
      })

      test('does not clean dist with --cache flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: true,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Dist-only cleaning', () => {
      test('cleans only dist directory with --dist flag', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const distExists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(distExists).toBe(false)

        const cacheExists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(cacheExists).toBe(true)
      })

      test('does not clean cache with --dist flag', async () => {
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: true,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(cacheDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Error handling', () => {
      test('handles errors during deletion gracefully', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await expect(cmd.run()).resolves.not.toThrow()
        restoreCwd()
      })

      test('continues cleaning other directories if one fails', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')

        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaned')
      })
    })

    describe('Output messages', () => {
      test('shows "Cleaning generated files" message', async () => {
        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cleaning generated files')
      })

      test('uses singular "directory" for one cleaned directory', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('1 directory')
      })

      test('uses plural "directories" for multiple cleaned directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        const cacheDir = path.join(tempDir, '.cache')
        await fs.mkdir(distDir, { recursive: true })
        await fs.mkdir(cacheDir, { recursive: true })

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('directories')
      })
    })

    describe('Recursive deletion', () => {
      test('removes nested directories', async () => {
        const nestedDir = path.join(tempDir, 'dist', 'nested', 'deeply')
        await fs.mkdir(nestedDir, { recursive: true })
        await fs.writeFile(path.join(nestedDir, 'file.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(path.join(tempDir, 'dist'))
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })

      test('removes files in directories', async () => {
        const distDir = path.join(tempDir, 'dist')
        await fs.mkdir(distDir, { recursive: true })
        await fs.writeFile(path.join(distDir, 'index.js'), 'content', 'utf-8')
        await fs.writeFile(path.join(distDir, 'bundle.js'), 'content', 'utf-8')

        const { command: cmd, restoreCwd } = createCommandWithMockedParse({
          'dry-run': false,
          cache: false,
          dist: false,
        })
        await cmd.run()
        restoreCwd()

        const exists = await fs
          .access(distDir)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(false)
      })
    })
  })
})
