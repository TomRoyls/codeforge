import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DiffResult } from '../../src/commands/diff-helpers.js'

import Diff from '../../src/commands/diff.js'

// ─── Top-level mocks ───

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    fail: vi.fn().mockReturnThis(),
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  })),
}))

vi.mock('../../src/commands/diff-helpers.js', () => ({
  buildDiffResult: vi.fn(),
}))

vi.mock('../../src/commands/diff-format-helpers.js', () => ({
  formatDiffJson: vi.fn(),
  formatDiffTable: vi.fn(),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function makeDiffResult(overrides: Partial<DiffResult> = {}): DiffResult {
  return {
    baseCommit: overrides.baseCommit ?? 'abc123',
    files: overrides.files ?? [],
    headCommit: overrides.headCommit ?? 'def456',
    summary: overrides.summary ?? {
      byExtension: [],
      byStatus: [],
      highRiskFiles: [],
      netLines: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      totalFiles: 0,
    },
  }
}

function makeDiffResultWithCounts(
  totalFiles: number,
  totalAdditions: number,
  totalDeletions: number,
): DiffResult {
  return makeDiffResult({
    summary: {
      byExtension: [],
      byStatus: [],
      highRiskFiles: [],
      netLines: totalAdditions - totalDeletions,
      totalAdditions,
      totalDeletions,
      totalFiles,
    },
  })
}

interface DiffPrivate {
  log: (...args: unknown[]) => void
  run: () => Promise<void>
}

function createDiffInstance(): { command: Diff; p: DiffPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Diff([], {} as never)
  const p = command as unknown as DiffPrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

// ─── Static properties ───

describe('Diff command static properties', () => {
  it('has correct description', () => {
    expect(Diff.description).toBe('Analyze git diffs with risk assessment and statistics')
  })

  it('has empty args object (no positional args)', () => {
    expect(Diff.args).toEqual({})
  })

  it('has examples defined', () => {
    expect(Diff.examples).toBeDefined()
    expect(Diff.examples!.length).toBeGreaterThan(0)
  })

  it('defines at least 3 examples', () => {
    expect(Diff.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description', () => {
    for (const example of Diff.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })

  it('has 6 examples covering all flag combinations', () => {
    expect(Diff.examples).toHaveLength(6)
  })

  it('has commit flag with char c', () => {
    const commitFlag = Diff.flags!.commit as Record<string, unknown>
    expect(commitFlag).toBeDefined()
    expect(commitFlag.char).toBe('c')
    expect(typeof commitFlag.description).toBe('string')
    expect((commitFlag.description as string).toLowerCase()).toContain('commit')
  })

  it('has format flag with char f and default table', () => {
    const formatFlag = Diff.flags!.format as Record<string, unknown>
    expect(formatFlag).toBeDefined()
    expect(formatFlag.char).toBe('f')
    expect(formatFlag.default).toBe('table')
    expect(formatFlag.options).toEqual(['json', 'table'])
  })

  it('has output flag with char o', () => {
    const outputFlag = Diff.flags!.output as Record<string, unknown>
    expect(outputFlag).toBeDefined()
    expect(outputFlag.char).toBe('o')
  })

  it('has staged flag defaulting to false', () => {
    const stagedFlag = Diff.flags!.staged as Record<string, unknown>
    expect(stagedFlag).toBeDefined()
    expect(stagedFlag.default).toBe(false)
  })

  it('has stat flag defaulting to false', () => {
    const statFlag = Diff.flags!.stat as Record<string, unknown>
    expect(statFlag).toBeDefined()
    expect(statFlag.default).toBe(false)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Diff.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })
})

// ─── Diff flags ───

describe('Diff flags', () => {
  it('has 6 flags defined', () => {
    expect(Object.keys(Diff.flags!)).toHaveLength(6)
  })

  it('flags include commit, format, output, staged, stat, verbose', () => {
    const flagKeys = Object.keys(Diff.flags!)
    expect(flagKeys).toContain('commit')
    expect(flagKeys).toContain('format')
    expect(flagKeys).toContain('output')
    expect(flagKeys).toContain('staged')
    expect(flagKeys).toContain('stat')
    expect(flagKeys).toContain('verbose')
  })

  it('flags have correct char aliases', () => {
    expect((Diff.flags!.commit as Record<string, unknown>).char).toBe('c')
    expect((Diff.flags!.format as Record<string, unknown>).char).toBe('f')
    expect((Diff.flags!.output as Record<string, unknown>).char).toBe('o')
    expect((Diff.flags!.verbose as Record<string, unknown>).char).toBe('v')
  })
})

// ─── Diff examples structure ───

describe('Diff examples structure', () => {
  it('each example has non-empty command and description strings', () => {
    for (const example of Diff.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })

  it('includes example with default usage (working tree)', () => {
    const hasDefault = Diff.examples!.some(
      (e) => e.description.toLowerCase().includes('working tree'),
    )
    expect(hasDefault).toBe(true)
  })

  it('includes example with staged changes', () => {
    const hasStaged = Diff.examples!.some(
      (e) => e.command.includes('--staged'),
    )
    expect(hasStaged).toBe(true)
  })

  it('includes example with commit flag', () => {
    const hasCommit = Diff.examples!.some(
      (e) => e.command.includes('--commit'),
    )
    expect(hasCommit).toBe(true)
  })

  it('includes JSON output example via --format json', () => {
    const hasJson = Diff.examples!.some(
      (e) => e.command.includes('--format json'),
    )
    expect(hasJson).toBe(true)
  })

  it('includes stat example', () => {
    const hasStat = Diff.examples!.some(
      (e) => e.command.includes('--stat'),
    )
    expect(hasStat).toBe(true)
  })

  it('includes verbose example', () => {
    const hasVerbose = Diff.examples!.some(
      (e) => e.command.includes('--verbose'),
    )
    expect(hasVerbose).toBe(true)
  })
})

// ─── run (integration-style with mocked internals) ───

describe('run', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    // Stub parse so oclif doesn't try to read argv — match actual flag shape
    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('Path not found')
  })

  it('calls buildDiffResult with cwd and default options', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    await instance.p.run()

    expect(buildDiffResult).toHaveBeenCalledWith(
      expect.any(String),
      { commit: undefined, staged: false },
    )
  })

  it('passes staged flag to buildDiffResult', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: true,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(buildDiffResult).toHaveBeenCalledWith(
      expect.any(String),
      { commit: undefined, staged: true },
    )
  })

  it('passes commit flag to buildDiffResult', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: 'abc123',
        format: 'table',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(buildDiffResult).toHaveBeenCalledWith(
      expect.any(String),
      { commit: 'abc123', staged: false },
    )
  })

  it('passes both commit and staged flags together', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: 'def456',
        format: 'table',
        output: undefined,
        staged: true,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(buildDiffResult).toHaveBeenCalledWith(
      expect.any(String),
      { commit: 'def456', staged: true },
    )
  })

  it('uses formatDiffTable when format is table (default)', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable, formatDiffJson } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')
    vi.mocked(formatDiffJson).mockReturnValue('json output')

    await instance.p.run()

    expect(formatDiffTable).toHaveBeenCalledWith(mockResult, false, false)
    expect(formatDiffJson).not.toHaveBeenCalled()
  })

  it('uses formatDiffJson when format is json', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable, formatDiffJson } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')
    vi.mocked(formatDiffJson).mockReturnValue('json output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'json',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(formatDiffJson).toHaveBeenCalledWith(mockResult)
    expect(formatDiffTable).not.toHaveBeenCalled()
  })

  it('passes stat and verbose flags to formatDiffTable', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: false,
        stat: true,
        verbose: true,
      },
    })

    await instance.p.run()

    expect(formatDiffTable).toHaveBeenCalledWith(mockResult, true, true)
  })

  it('passes only stat flag to formatDiffTable when stat is true and verbose is false', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: false,
        stat: true,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(formatDiffTable).toHaveBeenCalledWith(mockResult, true, false)
  })

  it('logs formatted output to console when no output flag', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('formatted table output')

    await instance.p.run()

    expect(instance.logs).toContain('formatted table output')
  })

  it('logs json output to console when format is json and no output flag', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffJson } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffJson).mockReturnValue('{"files":[]}')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'json',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(instance.logs).toContain('{"files":[]}')
  })

  it('writes to file when output flag is set (table format)', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const fsPromises = await import('node:fs/promises')
    vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: '/tmp/diff.txt',
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(fsPromises.writeFile).toHaveBeenCalledWith('/tmp/diff.txt', 'table output', 'utf8')
    expect(instance.logs).toContain('Results written to /tmp/diff.txt')
  })

  it('writes to file when output flag is set (json format)', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const fsPromises = await import('node:fs/promises')
    vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffJson } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffJson).mockReturnValue('{"files":[]}')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'json',
        output: '/tmp/diff.json',
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(fsPromises.writeFile).toHaveBeenCalledWith('/tmp/diff.json', '{"files":[]}', 'utf8')
    expect(instance.logs).toContain('Results written to /tmp/diff.json')
  })

  it('errors when buildDiffResult throws', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    vi.mocked(buildDiffResult).mockImplementation(() => {
      throw new Error('git failed')
    })

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('git failed')
  })

  it('errors with stringified non-Error when buildDiffResult throws non-Error', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    vi.mocked(buildDiffResult).mockImplementation(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'string error'
    })

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('string error')
  })

  it('errors when writeFile throws on output', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const fsPromises = await import('node:fs/promises')
    vi.mocked(fsPromises.writeFile).mockRejectedValue(new Error('disk full'))

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: '/tmp/diff.txt',
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('Failed to write output')
  })

  it('handles non-Error rejection from writeFile', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const fsPromises = await import('node:fs/promises')
    vi.mocked(fsPromises.writeFile).mockRejectedValue('weird failure')

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult()
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: '/tmp/diff.txt',
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('Failed to write output')
  })
})

// ─── Diff result summary propagation ───

describe('Diff result propagation', () => {
  it('uses summary counts from buildDiffResult result', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    // The spinner.succeed line uses these counts; we ensure no exception is thrown
    // when the result has realistic counts.
    const mockResult = makeDiffResultWithCounts(5, 100, 25)
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    const instance = createDiffInstance()
    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(formatDiffTable).toHaveBeenCalledWith(mockResult, false, false)
  })

  it('passes through result with files and risk info', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    const { buildDiffResult } = await import('../../src/commands/diff-helpers.js')
    const { formatDiffTable } = await import('../../src/commands/diff-format-helpers.js')

    const mockResult = makeDiffResult({
      baseCommit: 'main',
      files: [
        {
          additions: 10,
          deletions: 2,
          filePath: 'src/app.ts',
          lines: [],
          riskLevel: 'medium',
          riskReasons: ['Moderate additions'],
          status: 'modified',
        },
      ],
      headCommit: 'feature',
      summary: {
        byExtension: [{ additions: 10, deletions: 2, ext: '.ts', files: 1 }],
        byStatus: [{ count: 1, status: 'modified' }],
        highRiskFiles: [],
        netLines: 8,
        totalAdditions: 10,
        totalDeletions: 2,
        totalFiles: 1,
      },
    })
    vi.mocked(buildDiffResult).mockReturnValue(mockResult)
    vi.mocked(formatDiffTable).mockReturnValue('table output')

    const instance = createDiffInstance()
    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: {},
      flags: {
        commit: undefined,
        format: 'table',
        output: undefined,
        staged: false,
        stat: false,
        verbose: false,
      },
    })

    await instance.p.run()

    expect(formatDiffTable).toHaveBeenCalledWith(mockResult, false, false)
    expect(instance.logs).toContain('table output')
  })
})
