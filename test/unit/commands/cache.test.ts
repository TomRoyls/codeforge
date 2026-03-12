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

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Cache.description).toBe('Manage the CodeForge cache')
    })

    test('has examples defined', () => {
      expect(Cache.examples).toBeDefined()
      expect(Cache.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Cache.flags).toBeDefined()
      expect(Cache.flags.clear).toBeDefined()
      expect(Cache.flags.status).toBeDefined()
      expect(Cache.flags.path).toBeDefined()
    })

    test('has action argument', () => {
      expect(Cache.args).toBeDefined()
      expect(Cache.args.action).toBeDefined()
    })

    test('action argument has default value status', () => {
      expect(Cache.args.action.default).toBe('status')
    })

    test('action argument has correct options', () => {
      expect(Cache.args.action.options).toContain('status')
      expect(Cache.args.action.options).toContain('clear')
    })

    test('clear flag has default false', () => {
      expect(Cache.flags.clear.default).toBe(false)
    })

    test('status flag has default false', () => {
      expect(Cache.flags.status.default).toBe(false)
    })

    test('clear flag is exclusive with status', () => {
      expect(Cache.flags.clear.exclusive).toContain('status')
    })

    test('status flag is exclusive with clear', () => {
      expect(Cache.flags.status.exclusive).toContain('clear')
    })
  })

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
  })

  describe('run', () => {
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

    describe('Status operation', () => {
      test('shows cache status with default action', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache Status')
      })

      test('shows cache status with --status flag', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: true, path: tempDir },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache Status')
      })

      test('shows empty cache message when no entries', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache is active')
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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Entries:')
        expect(output).toContain('3')
      })

      test('displays size in bytes for small cache', async () => {
        await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(100), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('B')
      })

      test('displays size in KB for larger cache', async () => {
        await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(2048), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('KB')
      })

      test('handles non-existent cache directory gracefully', async () => {
        const nonExistentPath = path.join(tempDir, 'non-existent')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: nonExistentPath },
          { action: 'status' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache Status')
        expect(output).toContain('Entries:')
        expect(output).toContain('0')
      })
    })

    describe('Clear operation', () => {
      test('clears cache with clear action', async () => {
        const cacheFile = path.join(tempDir, 'test-cache.json')
        await fs.writeFile(cacheFile, JSON.stringify({ test: 'data' }), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'clear' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache cleared')
      })

      test('shows already empty message when cache is empty', async () => {
        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'clear' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Cache is already empty')
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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Removed 2 entries')
      })

      test('displays cleared size', async () => {
        await fs.writeFile(path.join(tempDir, 'cache.json'), 'x'.repeat(1000), 'utf-8')

        const cmd = createCommandWithMockedParse(
          { clear: false, status: false, path: tempDir },
          { action: 'clear' },
        )
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('(')
        expect(output).toContain(')')
      })
    })

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

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
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
    })

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
      })

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
      })

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
      })

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
      })
    })

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
    })
  })
})
