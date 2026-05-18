import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
  unlink: vi.fn(),
}))

vi.mock('../../src/commands/cache-helpers.js', () => ({
  displayCacheStatus: vi.fn(),
  displayClearResult: vi.fn(),
  formatSize: vi.fn((bytes: number) => `${bytes} B`),
  resolveCacheOptions: vi.fn(
    (args: Record<string, unknown>, flags: Record<string, unknown>, defaultPath: string) => ({
      action: (flags.clear ? 'clear' : (args.action as string | undefined) ?? 'status'),
      path: (flags.path as string | undefined) ?? defaultPath,
    }),
  ),
}))

import * as fs from 'node:fs/promises'

import Cache from '../../src/commands/cache.js'

import { displayCacheStatus, displayClearResult, resolveCacheOptions } from '../../src/commands/cache-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createCacheCommand(overrides: Record<string, unknown> = {}): { command: Cache; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Cache.prototype) as Cache
  Object.assign(command, {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: vi.fn(),
    parse: vi.fn(),
    ...overrides,
  })
  return { command, logs }
}

afterEach(() => {
  vi.clearAllMocks()
})

// ─── Static properties ───

describe('Cache command static properties', () => {
  it('has correct description', () => {
    expect(Cache.description).toBe('Manage the CodeForge cache')
  })

  it('defines action arg with default "status"', () => {
    const actionArg = Cache.args!.action as Record<string, unknown>
    expect(actionArg).toBeDefined()
    expect(actionArg.default).toBe('status')
    expect(actionArg.options).toEqual(['status', 'clear'])
  })

  it('has clear flag with char c', () => {
    const clearFlag = Cache.flags!.clear as Record<string, unknown>
    expect(clearFlag).toBeDefined()
    expect(clearFlag.char).toBe('c')
    expect(clearFlag.default).toBe(false)
  })

  it('has status flag with char s', () => {
    const statusFlag = Cache.flags!.status as Record<string, unknown>
    expect(statusFlag).toBeDefined()
    expect(statusFlag.char).toBe('s')
    expect(statusFlag.default).toBe(false)
  })

  it('has path flag with char p', () => {
    const pathFlag = Cache.flags!.path as Record<string, unknown>
    expect(pathFlag).toBeDefined()
    expect(pathFlag.char).toBe('p')
  })

  it('defines at least 3 examples', () => {
    expect(Cache.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description strings', () => {
    for (const example of Cache.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── formatSize delegation ───

describe('Cache.formatSize() delegation', () => {
  it('delegates to helper formatSize', () => {
    const { command } = createCacheCommand()
    const result = command.formatSize(1024)
    expect(result).toBe('1024 B')
  })
})

// ─── getCacheStats ───

describe('Cache.getCacheStats()', () => {
  it('returns entries and total size for files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['a.txt', 'b.txt'] as unknown as string[])
    vi.mocked(fs.stat)
      .mockResolvedValueOnce({ size: 100 } as unknown as Awaited<typeof fs.stat>)
      .mockResolvedValueOnce({ size: 200 } as unknown as Awaited<typeof fs.stat>)

    const { command } = createCacheCommand()
    const stats = await command.getCacheStats('/cache')

    expect(stats).toEqual({ entries: 2, size: 300 })
  })

  it('returns zero stats when directory does not exist', async () => {
    vi.mocked(fs.readdir).mockRejectedValue(new Error('ENOENT'))

    const { command } = createCacheCommand()
    const stats = await command.getCacheStats('/nonexistent')

    expect(stats).toEqual({ entries: 0, size: 0 })
  })

  it('returns zero stats for empty directory', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([] as unknown as string[])

    const { command } = createCacheCommand()
    const stats = await command.getCacheStats('/empty')

    expect(stats).toEqual({ entries: 0, size: 0 })
  })
})

// ─── run() - status action ───

describe('Cache run() - status action', () => {
  it('calls resolveCacheOptions with parsed args and flags', async () => {
    const { command, logs } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'status' },
      flags: {},
    })

    await command.run()

    expect(resolveCacheOptions).toHaveBeenCalledWith(
      { action: 'status' },
      {},
      expect.any(String),
    )
  })

  it('calls displayCacheStatus for status action', async () => {
    const { command, logs } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'status' },
      flags: {},
    })
    resolveCacheOptions.mockReturnValue({ action: 'status', path: '/cache' })
    vi.mocked(fs.readdir).mockResolvedValue(['f1'] as unknown as string[])
    vi.mocked(fs.stat).mockResolvedValue({ size: 512 } as unknown as Awaited<typeof fs.stat>)

    await command.run()

    expect(displayCacheStatus).toHaveBeenCalledWith(
      { entries: 1, size: 512 },
      '/cache',
      expect.any(Function),
    )
  })

  it('passes default cache path when no custom path provided', async () => {
    const { command } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'status' },
      flags: {},
    })
    resolveCacheOptions.mockImplementation((_args, _flags, defaultPath) => ({
      action: 'status',
      path: defaultPath,
    }))

    await command.run()

    const usedPath = resolveCacheOptions.mock.results[0]!.value.path
    expect(usedPath).toContain('.codeforge')
    expect(usedPath).toContain('cache')
  })
})

// ─── run() - clear action ───

describe('Cache run() - clear action', () => {
  it('clears files when cache has entries', async () => {
    const { command, logs } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'clear' },
      flags: {},
    })
    resolveCacheOptions.mockReturnValue({ action: 'clear', path: '/cache' })
    vi.mocked(fs.readdir).mockResolvedValue(['a.txt', 'b.txt'] as unknown as string[])
    vi.mocked(fs.stat)
      .mockResolvedValueOnce({ size: 100 } as unknown as Awaited<typeof fs.stat>)
      .mockResolvedValueOnce({ size: 200 } as unknown as Awaited<typeof fs.stat>)
    vi.mocked(fs.unlink).mockResolvedValue(undefined)

    await command.run()

    expect(fs.unlink).toHaveBeenCalledTimes(2)
    expect(displayClearResult).toHaveBeenCalledWith(
      { entries: 2, size: 300 },
      expect.any(Function),
    )
  })

  it('logs "already empty" when cache has no entries', async () => {
    const { command, logs } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'clear' },
      flags: {},
    })
    resolveCacheOptions.mockReturnValue({ action: 'clear', path: '/cache' })
    vi.mocked(fs.readdir).mockResolvedValue([] as unknown as string[])

    await command.run()

    expect(fs.unlink).not.toHaveBeenCalled()
    const plain = logs.map(stripAnsi).join(' ')
    expect(plain).toContain('already empty')
  })

  it('uses clear flag as alternative to arg', async () => {
    const { command } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: {},
      flags: { clear: true },
    })
    resolveCacheOptions.mockReturnValue({ action: 'clear', path: '/cache' })
    vi.mocked(fs.readdir).mockResolvedValue([] as unknown as string[])

    await command.run()

    expect(resolveCacheOptions).toHaveBeenCalledWith({}, { clear: true }, expect.any(String))
  })
})

// ─── run() - custom path ───

describe('Cache run() - custom path', () => {
  it('uses custom path from --path flag', async () => {
    const { command } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'status' },
      flags: { path: '/custom/cache' },
    })
    resolveCacheOptions.mockReturnValue({ action: 'status', path: '/custom/cache' })
    vi.mocked(fs.readdir).mockRejectedValue(new Error('ENOENT'))

    await command.run()

    expect(displayCacheStatus).toHaveBeenCalledWith(
      { entries: 0, size: 0 },
      '/custom/cache',
      expect.any(Function),
    )
  })
})

// ─── doClear error handling ───

describe('Cache doClear - error handling', () => {
  it('silently handles readdir failure during clear', async () => {
    const { command, logs } = createCacheCommand()
    vi.mocked(command.parse).mockResolvedValue({
      args: { action: 'clear' },
      flags: {},
    })
    resolveCacheOptions.mockReturnValue({ action: 'clear', path: '/cache' })

    // First call (getCacheStats) succeeds with entries, second (doClear) fails
    vi.mocked(fs.readdir)
      .mockResolvedValueOnce(['a.txt'] as unknown as string[])
      .mockRejectedValueOnce(new Error('ENOENT'))
    vi.mocked(fs.stat).mockResolvedValue({ size: 100 } as unknown as Awaited<typeof fs.stat>)

    await command.run()

    // displayClearResult still called (stats were retrieved before doClear)
    expect(displayClearResult).toHaveBeenCalled()
  })
})
