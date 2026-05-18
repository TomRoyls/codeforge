import { afterEach, describe, expect, it, vi } from 'vitest'

const mockExistsSync = vi.fn().mockReturnValue(false)

vi.mock('node:fs', () => ({
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}))

vi.mock('node:fs/promises', () => ({
  rm: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/commands/clean-helpers.js', () => ({
  displayCleanResult: vi.fn(),
  formatCleanHeader: vi.fn(() => 'Cleaning generated files...\n'),
  formatTargetStatus: vi.fn(
    (_target: unknown, exists: boolean, success: boolean, error?: string, dryRun?: boolean) => {
      if (!exists) return 'not found'
      if (dryRun) return 'would clean'
      if (success) return 'cleaned'
      return error ?? 'failed'
    },
  ),
  getCleanTargets: vi.fn(
    (flags: Record<string, boolean>, cwd: string) => {
      if (flags.cache) {
        return [
          { name: 'Cache directory', path: `${cwd}/.cache` },
          { name: 'CodeForge cache', path: `${cwd}/.codeforge` },
        ]
      }
      if (flags.dist) {
        return [{ name: 'Dist directory', path: `${cwd}/dist` }]
      }
      return [
        { name: 'Dist directory', path: `${cwd}/dist` },
        { name: 'Cache directory', path: `${cwd}/.cache` },
        { name: 'CodeForge cache', path: `${cwd}/.codeforge` },
        { name: 'Coverage directory', path: `${cwd}/coverage` },
      ]
    },
  ),
}))

import * as fs from 'node:fs/promises'

import Clean from '../../src/commands/clean.js'

import {
  displayCleanResult,
  formatCleanHeader,
  formatTargetStatus,
  getCleanTargets,
} from '../../src/commands/clean-helpers.js'

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function createCleanCommand(overrides: Record<string, unknown> = {}): { command: Clean; logs: string[] } {
  const logs: string[] = []
  const command = Object.create(Clean.prototype) as Clean
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
  mockExistsSync.mockReturnValue(false)
})

// ─── Static properties ───

describe('Clean command static properties', () => {
  it('has correct description', () => {
    expect(Clean.description).toBe('Clean generated files and caches')
  })

  it('has cache flag defaulting to false', () => {
    const cacheFlag = Clean.flags!.cache as Record<string, unknown>
    expect(cacheFlag).toBeDefined()
    expect(cacheFlag.default).toBe(false)
  })

  it('has dist flag defaulting to false', () => {
    const distFlag = Clean.flags!.dist as Record<string, unknown>
    expect(distFlag).toBeDefined()
    expect(distFlag.default).toBe(false)
  })

  it('has dry-run flag with char d', () => {
    const dryRunFlag = Clean.flags!['dry-run'] as Record<string, unknown>
    expect(dryRunFlag).toBeDefined()
    expect(dryRunFlag.char).toBe('d')
    expect(dryRunFlag.default).toBe(false)
  })

  it('defines at least 2 examples', () => {
    expect(Clean.examples!.length).toBeGreaterThanOrEqual(2)
  })

  it('each example has command and description strings', () => {
    for (const example of Clean.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── run() - clean all targets ───

describe('Clean run() - clean all', () => {
  it('calls getCleanTargets with default flags', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(false)

    await command.run()

    expect(getCleanTargets).toHaveBeenCalledWith({ cache: false, dist: false }, expect.any(String))
  })

  it('logs clean header', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })

    await command.run()

    expect(formatCleanHeader).toHaveBeenCalledWith(false)
  })

  it('removes existing targets', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(fs.rm).toHaveBeenCalled()
    const targets = getCleanTargets({ cache: false, dist: false }, '/cwd')
    expect(fs.rm).toHaveBeenCalledTimes(targets.length)
  })

  it('calls displayCleanResult with cleaned count', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(displayCleanResult).toHaveBeenCalledWith(expect.any(Number), false, expect.any(Function))
  })
})

// ─── run() - dry-run mode ───

describe('Clean run() - dry-run', () => {
  it('does not remove targets in dry-run mode', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': true } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(fs.rm).not.toHaveBeenCalled()
  })

  it('passes dryRun=true to formatCleanHeader', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': true } })

    await command.run()

    expect(formatCleanHeader).toHaveBeenCalledWith(true)
  })

  it('passes dryRun=true to displayCleanResult', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': true } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(displayCleanResult).toHaveBeenCalledWith(expect.any(Number), true, expect.any(Function))
  })

  it('counts targets that would be cleaned', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': true } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    const cleanedCount = (displayCleanResult as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(cleanedCount).toBeGreaterThan(0)
  })
})

// ─── run() - cache only ───

describe('Clean run() - cache flag', () => {
  it('calls getCleanTargets with cache=true', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: true, dist: false, 'dry-run': false } })

    await command.run()

    expect(getCleanTargets).toHaveBeenCalledWith({ cache: true, dist: false }, expect.any(String))
  })

  it('only processes cache-related targets', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: true, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    const targets = getCleanTargets({ cache: true }, '/cwd')
    expect(fs.rm).toHaveBeenCalledTimes(targets.length)
    expect(targets.every((t) => t.name.toLowerCase().includes('cache'))).toBe(true)
  })
})

// ─── run() - dist only ───

describe('Clean run() - dist flag', () => {
  it('calls getCleanTargets with dist=true', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: true, 'dry-run': false } })

    await command.run()

    expect(getCleanTargets).toHaveBeenCalledWith({ cache: false, dist: true }, expect.any(String))
  })

  it('only processes dist target', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: true, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)

    await command.run()

    expect(fs.rm).toHaveBeenCalledTimes(1)
  })
})

// ─── run() - targets not found ───

describe('Clean run() - no targets found', () => {
  it('skips targets that do not exist', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(false)

    await command.run()

    expect(fs.rm).not.toHaveBeenCalled()
    expect(displayCleanResult).toHaveBeenCalledWith(0, false, expect.any(Function))
  })

  it('logs "not found" status for missing targets', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(false)

    await command.run()

    const targets = getCleanTargets({ cache: false, dist: false }, '/cwd')
    expect(formatTargetStatus).toHaveBeenCalledTimes(targets.length)
    for (let i = 0; i < targets.length; i++) {
      expect(formatTargetStatus).toHaveBeenNthCalledWith(i + 1, expect.anything(), false, false)
    }
  })
})

// ─── run() - rm failure ───

describe('Clean run() - rm failure', () => {
  it('logs error when rm fails', async () => {
    const { command, logs } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)
    vi.mocked(fs.rm).mockRejectedValue(new Error('permission denied'))

    await command.run()

    expect(formatTargetStatus).toHaveBeenCalledWith(expect.anything(), true, false, 'permission denied')
  })

  it('does not count failed targets as cleaned', async () => {
    const { command } = createCleanCommand()
    vi.mocked(command.parse).mockResolvedValue({ flags: { cache: false, dist: false, 'dry-run': false } })
    mockExistsSync.mockReturnValue(true)
    vi.mocked(fs.rm).mockRejectedValue(new Error('fail'))

    await command.run()

    expect(displayCleanResult).toHaveBeenCalledWith(0, false, expect.any(Function))
  })
})
