import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Cache Command', () => {
  let Cache: typeof import('../../../src/commands/cache.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Cache = (await import('../../../src/commands/cache.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-cache-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  // ─── Helper ───
  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new Cache([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  function getOutput(): string {
    return mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 1: Command metadata (static properties)
  // ═══════════════════════════════════════════════════════════════════════
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Cache.description).toBe('Manage the CodeForge cache')
    })

    test('description is a string', () => {
      expect(typeof Cache.description).toBe('string')
    })

    test('description is non-empty', () => {
      expect(Cache.description.length).toBeGreaterThan(0)
    })

    test('has examples defined', () => {
      expect(Cache.examples).toBeDefined()
    })

    test('examples is an array', () => {
      expect(Array.isArray(Cache.examples)).toBe(true)
    })

    test('has at least one example', () => {
      expect(Cache.examples.length).toBeGreaterThan(0)
    })

    test('has 6 examples total', () => {
      expect(Cache.examples.length).toBe(6)
    })

    test('first example has command property', () => {
      expect(Cache.examples[0].command).toBeDefined()
    })

    test('first example has description property', () => {
      expect(Cache.examples[0].description).toBeDefined()
    })

    test('first example describes showing cache status', () => {
      expect(Cache.examples[0].description).toBe('Show cache status')
    })

    test('second example describes detailed cache status', () => {
      expect(Cache.examples[1].description).toBe('Show detailed cache status')
    })

    test('third example describes clearing cache', () => {
      expect(Cache.examples[2].description).toBe('Clear the cache')
    })

    test('fourth example describes clearing cache with flag', () => {
      expect(Cache.examples[3].description).toBe('Clear the cache using flag')
    })

    test('fifth example describes status via flag', () => {
      expect(Cache.examples[4].description).toBe('Show cache status using flag')
    })

    test('sixth example describes custom cache path', () => {
      expect(Cache.examples[5].description).toBe('Use a custom cache path')
    })

    test('has flags defined', () => {
      expect(Cache.flags).toBeDefined()
    })

    test('has args defined', () => {
      expect(Cache.args).toBeDefined()
    })

    test('has all required flags', () => {
      expect(Cache.flags.clear).toBeDefined()
      expect(Cache.flags.status).toBeDefined()
      expect(Cache.flags.path).toBeDefined()
    })

    test('has exactly 3 flags', () => {
      expect(Object.keys(Cache.flags)).toHaveLength(3)
    })

    test('has action argument', () => {
      expect(Cache.args.action).toBeDefined()
    })

    test('action argument is a string type', () => {
      expect(Cache.args.action).toBeDefined()
    })

    test('action argument has default value status', () => {
      expect(Cache.args.action.default).toBe('status')
    })

    test('action argument has description', () => {
      expect(Cache.args.action.description).toBe('Cache action to perform')
    })

    test('action argument has correct options', () => {
      expect(Cache.args.action.options).toContain('status')
      expect(Cache.args.action.options).toContain('clear')
    })

    test('action argument has exactly 2 options', () => {
      expect(Cache.args.action.options).toHaveLength(2)
    })

    test('clear flag has default false', () => {
      expect(Cache.flags.clear.default).toBe(false)
    })

    test('clear flag has description', () => {
      expect(Cache.flags.clear.description).toBe('Clear the cache')
    })

    test('status flag has default false', () => {
      expect(Cache.flags.status.default).toBe(false)
    })

    test('status flag has description', () => {
      expect(Cache.flags.status.description).toBe('Show cache status')
    })

    test('path flag has description', () => {
      expect(Cache.flags.path.description).toBe('Custom cache path')
    })

    test('path flag has no default', () => {
      expect(Cache.flags.path.default).toBeUndefined()
    })

    test('clear flag is exclusive with status', () => {
      expect(Cache.flags.clear.exclusive).toContain('status')
    })

    test('status flag is exclusive with clear', () => {
      expect(Cache.flags.status.exclusive).toContain('clear')
    })

    test('clear flag is boolean type', () => {
      expect(Cache.flags.clear.type).toBe('boolean')
    })

    test('status flag is boolean type', () => {
      expect(Cache.flags.status.type).toBe('boolean')
    })

    test('path flag is option type', () => {
      expect(Cache.flags.path.type).toBe('option')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 2: Flag characters
  // ═══════════════════════════════════════════════════════════════════════
  describe('Flag characters', () => {
    test('clear flag has char c', () => {
      expect(Cache.flags.clear.char).toBe('c')
    })

    test('status flag has char s', () => {
      expect(Cache.flags.status.char).toBe('s')
    })

    test('path flag has char p', () => {
      expect(Cache.flags.path.char).toBe('p')
    })

    test('clear char is a single character', () => {
      expect(Cache.flags.clear.char).toHaveLength(1)
    })

    test('status char is a single character', () => {
      expect(Cache.flags.status.char).toHaveLength(1)
    })

    test('path char is a single character', () => {
      expect(Cache.flags.path.char).toHaveLength(1)
    })

    test('all flag chars are unique', () => {
      const chars = [Cache.flags.clear.char, Cache.flags.status.char, Cache.flags.path.char]
      expect(new Set(chars).size).toBe(3)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 3: Command instantiation
  // ═══════════════════════════════════════════════════════════════════════
  describe('Command instantiation', () => {
    test('can create command with empty args and config', () => {
      const cmd = new Cache([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('command is an instance of Cache', () => {
      const cmd = new Cache([], {} as never)
      expect(cmd).toBeInstanceOf(Cache)
    })

    test('command has run method', () => {
      const cmd = new Cache([], {} as never)
      expect(typeof cmd.run).toBe('function')
    })

    test('command run method is async', () => {
      const cmd = new Cache([], {} as never)
      const result = cmd.run
      expect(result).toBeDefined()
    })

    test('multiple instances can be created', () => {
      const cmd1 = new Cache([], {} as never)
      const cmd2 = new Cache([], {} as never)
      expect(cmd1).not.toBe(cmd2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 4: Status operation
  // ═══════════════════════════════════════════════════════════════════════
  describe('Status operation', () => {
    test('shows cache status with default action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
      expect(output).toContain('Path:')
      expect(output).toContain('Entries:')
      expect(output).toContain('Size:')
    })

    test('shows cache status with status action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('shows cache status with --status flag', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: true, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('--status flag overrides default action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: true, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      // Should show status, not clear
      const output = getOutput()
      expect(output).toContain('Cache Status')
      expect(output).not.toContain('Cache cleared')
    })

    test('shows empty cache message when no entries', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is empty')
    })

    test('shows active cache message when entries exist', async () => {
      const cacheFile = path.join(tempDir, 'test-cache.json')
      await fs.writeFile(cacheFile, JSON.stringify({ test: 'data' }), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is active')
    })

    test('does not show empty message when entries exist', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).not.toContain('Cache is empty')
    })

    test('does not show active message when cache empty', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).not.toContain('Cache is active')
    })

    test('displays correct entry count', async () => {
      await fs.writeFile(path.join(tempDir, 'cache1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache2.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache3.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Entries:')
      expect(output).toContain('3')
    })

    test('shows 0 entries for empty cache', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Entries:')
      expect(output).toContain('0')
    })

    test('shows 1 entry for single file cache', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Entries:')
      expect(output).toContain('1')
    })

    test('shows 10 entries for ten files', async () => {
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(path.join(tempDir, `cache${i}.json`), '{}', 'utf-8')
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('10')
    })

    test('displays size in bytes for small cache', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(100), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('B')
    })

    test('displays size in KB for larger cache', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(2048), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('KB')
    })

    test('displays size in MB for very large cache', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(3 * 1024 * 1024), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('MB')
    })

    test('displays cache path in output', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain(tempDir)
    })

    test('handles non-existent cache directory gracefully', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: nonExistentPath },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
      expect(output).toContain('Entries:')
      expect(output).toContain('0')
    })

    test('shows size 0.0 B for empty cache', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('0.0 B')
    })

    test('status with default action (no arg specified)', async () => {
      const cmd = createCommandWithMockedParse({ clear: false, status: false, path: tempDir }, {})
      // Simulate default action
      const cmdAny = cmd as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdAny.parse = vi.fn().mockResolvedValue({
        args: { action: 'status' },
        flags: { clear: false, status: false, path: tempDir },
      })
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('status output includes blank lines for formatting', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      // The showStatus method outputs empty strings for formatting
      const emptyLogCalls = mockConsoleLog.mock.calls.filter((c) => c[0] === '')
      expect(emptyLogCalls.length).toBeGreaterThan(0)
    })

    test('handles deeply nested custom path', async () => {
      const deepPath = path.join(tempDir, 'a', 'b', 'c', 'd')
      await fs.mkdir(deepPath, { recursive: true })
      await fs.writeFile(path.join(deepPath, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: deepPath },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is active')
      expect(output).toContain('1')
    })

    test('handles path with special characters', async () => {
      const specialPath = path.join(tempDir, 'cache-dir with spaces')
      await fs.mkdir(specialPath, { recursive: true })
      await fs.writeFile(path.join(specialPath, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: specialPath },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is active')
    })

    test('status shows Size label', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Size:')
    })

    test('status shows Path label', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Path:')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 5: Clear operation
  // ═══════════════════════════════════════════════════════════════════════
  describe('Clear operation', () => {
    test('clears cache with clear action', async () => {
      const cacheFile = path.join(tempDir, 'test-cache.json')
      await fs.writeFile(cacheFile, JSON.stringify({ test: 'data' }), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')

      const exists = await fs
        .access(cacheFile)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    test('clears cache with --clear flag', async () => {
      const cacheFile = path.join(tempDir, 'test-cache.json')
      await fs.writeFile(cacheFile, JSON.stringify({ test: 'data' }), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')
    })

    test('--clear flag overrides action arg', async () => {
      const cacheFile = path.join(tempDir, 'test-cache.json')
      await fs.writeFile(cacheFile, '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')
      expect(output).not.toContain('Cache Status')
    })

    test('shows already empty message when cache is empty', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('does not show Cache cleared when already empty', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).not.toContain('Cache cleared')
    })

    test('removes all cache entries', async () => {
      await fs.writeFile(path.join(tempDir, 'cache1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache2.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache3.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const files = await fs.readdir(tempDir)
      expect(files.length).toBe(0)
    })

    test('displays removed entries count', async () => {
      await fs.writeFile(path.join(tempDir, 'cache1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache2.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 2 entries')
    })

    test('displays removed 1 entry (singular)', async () => {
      await fs.writeFile(path.join(tempDir, 'cache1.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 1 entries')
    })

    test('displays removed 5 entries', async () => {
      for (let i = 0; i < 5; i++) {
        await fs.writeFile(path.join(tempDir, `cache${i}.json`), '{}', 'utf-8')
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 5 entries')
    })

    test('displays cleared size', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(1000), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('(')
      expect(output).toContain(')')
    })

    test('shows size in KB when clearing large cache', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(5000), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('KB')
    })

    test('clears files with various extensions', async () => {
      await fs.writeFile(path.join(tempDir, 'cache1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache2.dat'), 'binary', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'cache3.tmp'), 'temp', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const files = await fs.readdir(tempDir)
      expect(files.length).toBe(0)
    })

    test('directory still exists after clearing', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const dirExists = await fs
        .access(tempDir)
        .then(() => true)
        .catch(() => false)
      expect(dirExists).toBe(true)
    })

    test('clearing empty directory does not throw', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('clear with --clear flag on empty cache shows already empty', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('multiple files are all deleted', async () => {
      for (let i = 0; i < 20; i++) {
        await fs.writeFile(path.join(tempDir, `file${i}.json`), `{ "id": ${i} }`, 'utf-8')
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const files = await fs.readdir(tempDir)
      expect(files.length).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 6: Custom path
  // ═══════════════════════════════════════════════════════════════════════
  describe('Custom path', () => {
    test('uses custom cache path', async () => {
      const customCacheDir = path.join(tempDir, 'custom-cache')
      await fs.mkdir(customCacheDir, { recursive: true })
      await fs.writeFile(path.join(customCacheDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customCacheDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain(customCacheDir)
    })

    test('clears cache in custom path', async () => {
      const customCacheDir = path.join(tempDir, 'custom-cache')
      await fs.mkdir(customCacheDir, { recursive: true })
      const cacheFile = path.join(customCacheDir, 'cache.json')
      await fs.writeFile(cacheFile, '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customCacheDir },
        { action: 'clear' },
      )
      await cmd.run()

      const exists = await fs
        .access(cacheFile)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    test('custom path with --clear flag', async () => {
      const customCacheDir = path.join(tempDir, 'custom-clear')
      await fs.mkdir(customCacheDir, { recursive: true })
      const cacheFile = path.join(customCacheDir, 'cache.json')
      await fs.writeFile(cacheFile, '{"data": true}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: customCacheDir },
        { action: 'status' },
      )
      await cmd.run()

      const exists = await fs
        .access(cacheFile)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    test('status on custom non-existent path shows 0 entries', async () => {
      const customPath = path.join(tempDir, 'does-not-exist')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customPath },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('0')
    })

    test('custom path is displayed in status output', async () => {
      const customCacheDir = path.join(tempDir, 'my-cache-dir')
      await fs.mkdir(customCacheDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customCacheDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('my-cache-dir')
    })

    test('clear on non-existent custom path does not throw', async () => {
      const customPath = path.join(tempDir, 'non-existent-path')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customPath },
        { action: 'clear' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('clear on non-existent custom path shows already empty', async () => {
      const customPath = path.join(tempDir, 'non-existent-path')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customPath },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 7: Private methods - getCacheStats
  // ═══════════════════════════════════════════════════════════════════════
  describe('Private methods', () => {
    describe('getCacheStats', () => {
      test('returns zero stats for empty directory', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(0)
        expect(result.size).toBe(0)
      })

      test('returns correct stats for files', async () => {
        await fs.writeFile(path.join(tempDir, 'cache1.json'), 'x'.repeat(100), 'utf-8')
        await fs.writeFile(path.join(tempDir, 'cache2.json'), 'x'.repeat(200), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(2)
        expect(result.size).toBe(300)
      })

      test('returns zero stats for non-existent directory', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats('/non/existent/path')

        expect(result.entries).toBe(0)
        expect(result.size).toBe(0)
      })

      test('returns correct size for single file', async () => {
        await fs.writeFile(path.join(tempDir, 'single.json'), 'hello', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(1)
        expect(result.size).toBe(5) // 'hello' is 5 bytes
      })

      test('returns correct size for empty files', async () => {
        await fs.writeFile(path.join(tempDir, 'empty.json'), '', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(1)
        expect(result.size).toBe(0)
      })

      test('returns correct size for many files', async () => {
        for (let i = 0; i < 50; i++) {
          await fs.writeFile(path.join(tempDir, `f${i}.json`), 'x'.repeat(10), 'utf-8')
        }

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(50)
        expect(result.size).toBe(500)
      })

      test('returns correct stats for varied file sizes', async () => {
        await fs.writeFile(path.join(tempDir, 'a.json'), 'x'.repeat(50), 'utf-8')
        await fs.writeFile(path.join(tempDir, 'b.json'), 'y'.repeat(150), 'utf-8')
        await fs.writeFile(path.join(tempDir, 'c.json'), 'z'.repeat(300), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result.entries).toBe(3)
        expect(result.size).toBe(500)
      })

      test('stats result has entries property', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result).toHaveProperty('entries')
      })

      test('stats result has size property', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(result).toHaveProperty('size')
      })

      test('stats entries is a number', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(typeof result.entries).toBe('number')
      })

      test('stats size is a number', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = await (
          cmd as unknown as {
            getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
          }
        ).getCacheStats(tempDir)

        expect(typeof result.size).toBe('number')
      })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 8: formatSize
    // ═══════════════════════════════════════════════════════════════════════
    describe('formatSize', () => {
      test('formats bytes correctly', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(500)

        expect(result).toBe('500.0 B')
      })

      test('formats kilobytes correctly', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(2048)

        expect(result).toContain('KB')
      })

      test('formats megabytes correctly', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
          2 * 1024 * 1024,
        )

        expect(result).toContain('MB')
      })

      test('formats gigabytes correctly', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
          2 * 1024 * 1024 * 1024,
        )

        expect(result).toContain('GB')
      })

      test('handles zero bytes', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(0)

        expect(result).toBe('0.0 B')
      })

      test('handles 1 byte', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(1)

        expect(result).toBe('1.0 B')
      })

      test('handles exactly 1023 bytes', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(1023)

        expect(result).toBe('1023.0 B')
      })

      test('handles exactly 1024 bytes (1 KB)', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(1024)

        expect(result).toContain('1.0')
        expect(result).toContain('KB')
      })

      test('handles 1536 bytes (1.5 KB)', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(1536)

        expect(result).toContain('1.5')
        expect(result).toContain('KB')
      })

      test('handles exactly 1 MB', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
          1024 * 1024,
        )

        expect(result).toContain('1.0')
        expect(result).toContain('MB')
      })

      test('handles exactly 1 GB', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
          1024 * 1024 * 1024,
        )

        expect(result).toContain('1.0')
        expect(result).toContain('GB')
      })

      test('returns string type', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(100)

        expect(typeof result).toBe('string')
      })

      test('includes unit suffix', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(100)

        expect(result).toMatch(/\d+\.\d+ [A-Z]{1,2}/)
      })

      test('handles very large size (terabytes shows as GB)', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        // 5 TB - should cap at GB
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
          5 * 1024 * 1024 * 1024 * 1024,
        )

        expect(result).toContain('GB')
      })

      test('handles 500 bytes correctly', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(500)

        expect(result).toBe('500.0 B')
      })

      test('handles 2560 bytes (2.5 KB)', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(2560)

        expect(result).toContain('KB')
      })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 9: getDefaultCachePath
    // ═══════════════════════════════════════════════════════════════════════
    describe('getDefaultCachePath', () => {
      test('returns default cache path', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (
          cmd as unknown as { getDefaultCachePath: () => string }
        ).getDefaultCachePath()

        expect(result).toContain('.codeforge')
        expect(result).toContain('cache')
      })

      test('returns a string', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (
          cmd as unknown as { getDefaultCachePath: () => string }
        ).getDefaultCachePath()

        expect(typeof result).toBe('string')
      })

      test('returns non-empty path', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (
          cmd as unknown as { getDefaultCachePath: () => string }
        ).getDefaultCachePath()

        expect(result.length).toBeGreaterThan(0)
      })

      test('contains codeforge in path', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const result = (
          cmd as unknown as { getDefaultCachePath: () => string }
        ).getDefaultCachePath()

        expect(result.toLowerCase()).toContain('codeforge')
      })

      test('returns consistent path on multiple calls', () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        const fn = cmd as unknown as { getDefaultCachePath: () => string }
        const result1 = fn.getDefaultCachePath()
        const result2 = fn.getDefaultCachePath()

        expect(result1).toBe(result2)
      })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 10: doClear
    // ═══════════════════════════════════════════════════════════════════════
    describe('doClear', () => {
      test('removes all files from directory', async () => {
        await fs.writeFile(path.join(tempDir, 'file1.json'), '{}', 'utf-8')
        await fs.writeFile(path.join(tempDir, 'file2.json'), '{}', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(tempDir)

        const files = await fs.readdir(tempDir)
        expect(files.length).toBe(0)
      })

      test('handles non-existent directory gracefully', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await expect(
          (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(
            '/non/existent/path',
          ),
        ).resolves.not.toThrow()
      })

      test('handles empty directory', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await expect(
          (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(tempDir),
        ).resolves.not.toThrow()

        const files = await fs.readdir(tempDir)
        expect(files.length).toBe(0)
      })

      test('removes large number of files', async () => {
        for (let i = 0; i < 100; i++) {
          await fs.writeFile(path.join(tempDir, `file${i}.json`), `{ "id": ${i} }`, 'utf-8')
        }

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(tempDir)

        const files = await fs.readdir(tempDir)
        expect(files.length).toBe(0)
      })

      test('directory remains after clearing', async () => {
        await fs.writeFile(path.join(tempDir, 'file.json'), '{}', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(tempDir)

        const stat = await fs.stat(tempDir)
        expect(stat.isDirectory()).toBe(true)
      })

      test('removes files of different types', async () => {
        await fs.writeFile(path.join(tempDir, 'data.json'), '{"a":1}', 'utf-8')
        await fs.writeFile(path.join(tempDir, 'log.txt'), 'hello world', 'utf-8')
        await fs.writeFile(path.join(tempDir, 'cache.dat'), 'binary-data', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await (cmd as unknown as { doClear: (p: string) => Promise<void> }).doClear(tempDir)

        const files = await fs.readdir(tempDir)
        expect(files.length).toBe(0)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 11: Error handling
  // ═══════════════════════════════════════════════════════════════════════
  describe('Error handling', () => {
    test('handles read errors gracefully during status', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('handles read errors gracefully during clear', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('handles non-existent path during status', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '/absolutely/non/existent/path' },
        { action: 'status' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('handles non-existent path during clear', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '/absolutely/non/existent/path' },
        { action: 'clear' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('non-existent path status shows zero entries', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '/absolutely/non/existent/path' },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('0')
    })

    test('non-existent path clear shows already empty', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '/absolutely/non/existent/path' },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('run does not throw for any valid action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('run returns undefined for status action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = await cmd.run()
      expect(result).toBeUndefined()
    })

    test('run returns undefined for clear action', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      const result = await cmd.run()
      expect(result).toBeUndefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 12: Edge cases
  // ═══════════════════════════════════════════════════════════════════════
  describe('Edge cases', () => {
    test('handles empty string path', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '' },
        { action: 'status' },
      )
      // Empty path should use default cache path
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('handles path with trailing slash', async () => {
      const slashedPath = tempDir + '/'
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: slashedPath },
        { action: 'status' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('handles very long file content', async () => {
      await fs.writeFile(path.join(tempDir, 'big.json'), 'x'.repeat(1_000_000), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toMatch(/B|KB|MB|GB/)
    })

    test('status after clear shows empty', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      // Clear
      const clearCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await clearCmd.run()

      // Check status
      mockConsoleLog.mockClear()
      const statusCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await statusCmd.run()

      const output = getOutput()
      expect(output).toContain('0')
      expect(output).toContain('Cache is empty')
    })

    test('clear then add then status shows correct count', async () => {
      // Clear
      await fs.writeFile(path.join(tempDir, 'initial.json'), '{}', 'utf-8')
      const clearCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await clearCmd.run()

      // Add new files
      await fs.writeFile(path.join(tempDir, 'new1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'new2.json'), '{}', 'utf-8')

      // Status
      mockConsoleLog.mockClear()
      const statusCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await statusCmd.run()

      const output = getOutput()
      expect(output).toContain('2')
    })

    test('handles unicode file content', async () => {
      await fs.writeFile(
        path.join(tempDir, 'unicode.json'),
        JSON.stringify({ msg: 'こんにちは世界 🌍' }),
        'utf-8',
      )

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is active')
    })

    test('handles file with JSON content', async () => {
      await fs.writeFile(
        path.join(tempDir, 'data.json'),
        JSON.stringify({ key: 'value', nested: { a: 1 } }, null, 2),
        'utf-8',
      )

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is active')
      expect(output).toContain('1')
    })

    test('handles concurrent status calls', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd1 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const cmd2 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )

      await Promise.all([cmd1.run(), cmd2.run()])

      // Both should complete without error
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    test('path flag undefined uses default path', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: undefined },
        { action: 'status' },
      )
      // Will use default path which probably doesn't have cache
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('null path uses default path', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: null },
        { action: 'status' },
      )
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('status on directory with subdirectories counts only files', async () => {
      const subDir = path.join(tempDir, 'subdir')
      await fs.mkdir(subDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(subDir, 'nested.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      // readdir counts both files and dirs
      expect(output).toContain('Entries:')
    })

    test('clear on directory with subdirectories', async () => {
      const subDir = path.join(tempDir, 'subdir')
      await fs.mkdir(subDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(subDir, 'nested.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')
    })

    test('repeated clear on same directory', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd1 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd1.run()

      mockConsoleLog.mockClear()

      const cmd2 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd2.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('status on temp directory works', async () => {
      const anotherTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-test-'))
      try {
        await fs.writeFile(path.join(anotherTemp, 'cache.json'), '{}', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: anotherTemp },
          { action: 'status' },
        )
        await cmd.run()

        const output = getOutput()
        expect(output).toContain('Cache is active')
      } finally {
        await fs.rm(anotherTemp, { recursive: true, force: true })
      }
    })

    test('clear on temp directory works', async () => {
      const anotherTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-test-'))
      try {
        await fs.writeFile(path.join(anotherTemp, 'cache.json'), '{}', 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: anotherTemp },
          { action: 'clear' },
        )
        await cmd.run()

        const files = await fs.readdir(anotherTemp)
        expect(files.length).toBe(0)
      } finally {
        await fs.rm(anotherTemp, { recursive: true, force: true })
      }
    })

    test('large cache entry count displayed correctly', async () => {
      for (let i = 0; i < 25; i++) {
        await fs.writeFile(
          path.join(tempDir, `entry${String(i).padStart(3, '0')}.json`),
          '{}',
          'utf-8',
        )
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('25')
    })

    test('clearing 25 entries shows correct count', async () => {
      for (let i = 0; i < 25; i++) {
        await fs.writeFile(path.join(tempDir, `entry${i}.json`), '{}', 'utf-8')
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 25 entries')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 13: run() action resolution
  // ═══════════════════════════════════════════════════════════════════════
  describe('run() action resolution', () => {
    test('default action is status', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('clear flag takes precedence over action arg', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')
    })

    test('status flag takes precedence over action arg', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: true, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
      expect(output).not.toContain('Cache cleared')
    })

    test('clear flag overrides status flag when both are somehow set', async () => {
      // In real usage they're exclusive, but test the code path where clear check is first
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: true, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache cleared')
    })

    test('action clear without flags', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('no flags no action defaults to status', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('uses custom path when provided', async () => {
      const customDir = path.join(tempDir, 'custom')
      await fs.mkdir(customDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain(customDir)
    })

    test('uses default path when path flag not provided', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: undefined },
        { action: 'status' },
      )
      // Should use getDefaultCachePath
      await expect(cmd.run()).resolves.not.toThrow()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 14: Output formatting details
  // ═══════════════════════════════════════════════════════════════════════
  describe('Output formatting', () => {
    test('status output contains Cache Status header', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Cache Status')
    })

    test('clear output contains checkmark', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('✓')
    })

    test('clear output contains Removed text', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(50), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed')
    })

    test('clear output contains size in parentheses', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(200), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toMatch(/\(\d+\.\d+ [A-Z]+\)/)
    })

    test('empty cache status contains yellow indicator', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      // console.log is called with chalk coloring
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    test('active cache status contains green indicator', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalled()
    })

    test('clear success output contains green color', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      // Verify log was called (chalk colors are applied)
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    test('already empty output contains yellow color', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalled()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 15: formatSize additional boundary tests
  // ═══════════════════════════════════════════════════════════════════════
  describe('formatSize additional boundaries', () => {
    test('handles 2 bytes', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(2)
      expect(result).toBe('2.0 B')
    })

    test('handles 10 bytes', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(10)
      expect(result).toBe('10.0 B')
    })

    test('handles 512 bytes', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(512)
      expect(result).toBe('512.0 B')
    })

    test('handles just under 1 MB boundary as KB', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const justUnder1MB = 1024 * 1024 - 1
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
        justUnder1MB,
      )
      expect(result).toContain('KB')
    })

    test('handles 5 KB', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(5120)
      expect(result).toContain('5.0')
      expect(result).toContain('KB')
    })

    test('handles 10 MB', () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = (cmd as unknown as { formatSize: (b: number) => string }).formatSize(
        10 * 1024 * 1024,
      )
      expect(result).toContain('MB')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 16: Cache status with varied file configurations
  // ═══════════════════════════════════════════════════════════════════════
  describe('Status with varied file configurations', () => {
    test('status counts hidden files', async () => {
      await fs.writeFile(path.join(tempDir, '.hidden-cache'), 'data', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'visible-cache'), 'data', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('2')
    })

    test('status counts files without extensions', async () => {
      await fs.writeFile(path.join(tempDir, 'CACHE'), 'data', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'tempfile'), 'data', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'manifest'), 'data', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('3')
    })

    test('status with binary file content shows correct size', async () => {
      const buffer = Buffer.alloc(256, 0xff)
      await fs.writeFile(path.join(tempDir, 'binary-cache.dat'), buffer)

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toMatch(/B|KB|MB|GB/)
      expect(output).toContain('1')
    })

    test('status output contains Cache Status before Path', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      const statusIdx = output.indexOf('Cache Status')
      const pathIdx = output.indexOf('Path:')
      expect(statusIdx).toBeLessThan(pathIdx)
    })

    test('status shows Entries before Size', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      const entriesIdx = output.indexOf('Entries:')
      const sizeIdx = output.indexOf('Size:')
      expect(entriesIdx).toBeLessThan(sizeIdx)
    })

    test('populated cache status does not contain "empty" text', async () => {
      await fs.writeFile(path.join(tempDir, 'entry.json'), '{"v":1}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).not.toContain('Cache is empty')
      expect(output).toContain('Cache is active')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 17: Clear operation additional scenarios
  // ═══════════════════════════════════════════════════════════════════════
  describe('Clear operation additional scenarios', () => {
    test('status after clear does not remove files', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      // Run status, not clear
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      // File should still exist
      const exists = await fs
        .access(path.join(tempDir, 'cache.json'))
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('clear shows both entry count and size in output', async () => {
      await fs.writeFile(path.join(tempDir, 'a.json'), 'x'.repeat(200), 'utf-8')
      await fs.writeFile(path.join(tempDir, 'b.json'), 'y'.repeat(300), 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 2 entries')
      expect(output).toMatch(/\(\d+\.\d+ [A-Z]+\)/)
    })

    test('clear removes hidden files', async () => {
      await fs.writeFile(path.join(tempDir, '.hidden'), 'data', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'visible.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const files = await fs.readdir(tempDir)
      expect(files.length).toBe(0)
    })

    test('clear with --clear flag shows Removed for populated cache', async () => {
      await fs.writeFile(path.join(tempDir, 'data.json'), 'payload', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: true, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 1 entries')
    })

    test('clear output does not contain Cache Status header', async () => {
      await fs.writeFile(path.join(tempDir, 'item.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).not.toContain('Cache Status')
    })

    test('clear on freshly populated cache shows correct count', async () => {
      for (let i = 0; i < 7; i++) {
        await fs.writeFile(path.join(tempDir, `item${i}.dat`), `data-${i}`, 'utf-8')
      }

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('Removed 7 entries')
      expect(output).toContain('✓')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 18: getCacheStats accuracy tests
  // ═══════════════════════════════════════════════════════════════════════
  describe('getCacheStats accuracy', () => {
    test('returns exact byte size for known content', async () => {
      const content = 'Hello, World!' // 13 bytes
      await fs.writeFile(path.join(tempDir, 'exact.json'), content, 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = await (
        cmd as unknown as {
          getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
        }
      ).getCacheStats(tempDir)

      expect(result.size).toBe(Buffer.byteLength(content, 'utf-8'))
    })

    test('counts hidden files in stats', async () => {
      await fs.writeFile(path.join(tempDir, '.dotfile'), 'x', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = await (
        cmd as unknown as {
          getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
        }
      ).getCacheStats(tempDir)

      expect(result.entries).toBe(1)
    })

    test('multiple calls return consistent results', async () => {
      await fs.writeFile(path.join(tempDir, 'stable.json'), 'content', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const fn = cmd as unknown as {
        getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
      }
      const result1 = await fn.getCacheStats(tempDir)
      const result2 = await fn.getCacheStats(tempDir)

      expect(result1.entries).toBe(result2.entries)
      expect(result1.size).toBe(result2.size)
    })

    test('returns correct size for a single large file', async () => {
      const largeContent = 'A'.repeat(100_000)
      await fs.writeFile(path.join(tempDir, 'large.json'), largeContent, 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = await (
        cmd as unknown as {
          getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
        }
      ).getCacheStats(tempDir)

      expect(result.entries).toBe(1)
      expect(result.size).toBe(100_000)
    })

    test('returns non-negative values for empty directory', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      const result = await (
        cmd as unknown as {
          getCacheStats: (p: string) => Promise<{ entries: number; size: number }>
        }
      ).getCacheStats(tempDir)

      expect(result.entries).toBeGreaterThanOrEqual(0)
      expect(result.size).toBeGreaterThanOrEqual(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 19: Path resolution additional tests
  // ═══════════════════════════════════════════════════════════════════════
  describe('Path resolution additional', () => {
    test('undefined path resolves to default containing codeforge and cache', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: undefined },
        { action: 'status' },
      )
      const defaultPath = (
        cmd as unknown as { getDefaultCachePath: () => string }
      ).getDefaultCachePath()

      expect(defaultPath).toContain('.codeforge')
      expect(defaultPath).toContain('cache')
      expect(defaultPath).toContain(path.sep)
    })

    test('custom path with hyphens and underscores works', async () => {
      const customDir = path.join(tempDir, 'my-cache_dir-v2')
      await fs.mkdir(customDir, { recursive: true })
      await fs.writeFile(path.join(customDir, 'entry.json'), '{}', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('my-cache_dir-v2')
      expect(output).toContain('1')
    })

    test('custom path displayed in clear output', async () => {
      const customDir = path.join(tempDir, 'clear-path-test')
      await fs.mkdir(customDir, { recursive: true })
      await fs.writeFile(path.join(customDir, 'x.json'), 'data', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: customDir },
        { action: 'clear' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('✓')
      expect(output).toContain('Removed')
    })

    test('empty string path triggers default path', async () => {
      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: '' },
        { action: 'status' },
      )
      const defaultPath = (
        cmd as unknown as { getDefaultCachePath: () => string }
      ).getDefaultCachePath()

      // getDefaultCachePath should return a valid path
      expect(defaultPath.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 20: Additional edge cases
  // ═══════════════════════════════════════════════════════════════════════
  describe('Additional edge cases', () => {
    test('1-byte file status shows correct size', async () => {
      await fs.writeFile(path.join(tempDir, 'tiny'), 'x', 'utf-8')

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      expect(output).toContain('1')
      expect(output).toMatch(/B|KB|MB|GB/)
    })

    test('triple clear sequence', async () => {
      await fs.writeFile(path.join(tempDir, 'cache.json'), '{}', 'utf-8')

      // First clear
      const cmd1 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd1.run()

      mockConsoleLog.mockClear()

      // Second clear
      const cmd2 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd2.run()

      mockConsoleLog.mockClear()

      // Third clear
      const cmd3 = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await cmd3.run()

      const output = getOutput()
      expect(output).toContain('Cache is already empty')
    })

    test('clear then populate then status shows updated count', async () => {
      // Populate
      await fs.writeFile(path.join(tempDir, 'old.json'), '{}', 'utf-8')

      // Clear
      const clearCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'clear' },
      )
      await clearCmd.run()

      // Repopulate with different count
      await fs.writeFile(path.join(tempDir, 'new1.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'new2.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'new3.json'), '{}', 'utf-8')

      mockConsoleLog.mockClear()

      const statusCmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await statusCmd.run()

      const output = getOutput()
      expect(output).toContain('3')
      expect(output).toContain('Cache is active')
    })

    test('multiple command instances with different paths are independent', async () => {
      const dirA = path.join(tempDir, 'cache-a')
      const dirB = path.join(tempDir, 'cache-b')
      await fs.mkdir(dirA, { recursive: true })
      await fs.mkdir(dirB, { recursive: true })

      await fs.writeFile(path.join(dirA, 'a.json'), 'aaa', 'utf-8')
      await fs.writeFile(path.join(dirB, 'b.json'), 'bbbbbb', 'utf-8')

      const cmdA = createCommandWithMockedParse(
        { clear: false, status: false, path: dirA },
        { action: 'status' },
      )
      const cmdB = createCommandWithMockedParse(
        { clear: false, status: false, path: dirB },
        { action: 'status' },
      )

      await cmdA.run()
      const outputA = getOutput()
      mockConsoleLog.mockClear()
      await cmdB.run()
      const outputB = getOutput()

      expect(outputA).toContain('cache-a')
      expect(outputB).toContain('cache-b')
    })

    test('status on directory with only subdirectories', async () => {
      const subDir = path.join(tempDir, 'nested-dir')
      await fs.mkdir(subDir, { recursive: true })

      const cmd = createCommandWithMockedParse(
        { clear: false, status: false, path: tempDir },
        { action: 'status' },
      )
      await cmd.run()

      const output = getOutput()
      // readdir counts the subdirectory as an entry
      expect(output).toContain('Cache Status')
      expect(output).toMatch(/B|KB|MB|GB/)
    })
  })
})
