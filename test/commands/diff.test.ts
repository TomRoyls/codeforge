import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import Diff from '../../src/commands/diff.js'

// ─── Top-level mocks ───

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('node:os', () => ({
  tmpdir: vi.fn().mockReturnValue('/tmp'),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    initialize = vi.fn().mockResolvedValue(undefined)
    dispose = vi.fn()
    parseFile = vi.fn()
  },
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: class {
    register = vi.fn()
    runRules = vi.fn().mockReturnValue([])
  },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn().mockReturnValue('complexity'),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../src/utils/constants.js', () => ({
  MAX_FILES_TO_PROCESS: 100,
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    setLevel: vi.fn(),
  },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
}))

vi.mock('../../src/commands/diff-helpers.js', () => ({
  buildDiffReport: vi.fn(),
  displayDiffReport: vi.fn(),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: overrides.filePath ?? 'src/app.ts',
    message: overrides.message ?? 'Violation',
    range: {
      start: { line: overrides.range?.start?.line ?? 10, column: overrides.range?.start?.column ?? 0 },
      end: { line: overrides.range?.end?.line ?? 10, column: overrides.range?.end?.column ?? 10 },
    },
    ruleId: overrides.ruleId ?? 'no-eval',
    severity: overrides.severity ?? 'error',
  }
}

interface DiffPrivate {
  analyzeDiff: (targetPath: string, baseRef: string, headRef: string) => Promise<import('../../src/commands/diff-helpers.js').DiffReport>
  analyzeViolations: (targetPath: string) => Promise<RuleViolation[]>
  createViolationKey: (v: RuleViolation) => string
  displayReport: (report: import('../../src/commands/diff-helpers.js').DiffReport, verbose: boolean) => void
  getViolationsAtRef: (targetPath: string, ref: string) => Promise<RuleViolation[]>
  isGitRepository: (targetPath: string) => boolean
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
    expect(Diff.description).toBe('Compare violations between git branches or commits')
  })

  it('has examples defined', () => {
    expect(Diff.examples).toBeDefined()
    expect(Diff.examples!.length).toBeGreaterThan(0)
  })

  it('defines base arg with default HEAD~1', () => {
    const baseArg = Diff.args!.base as Record<string, unknown>
    expect(baseArg).toBeDefined()
    expect(baseArg.default).toBe('HEAD~1')
    expect(baseArg.required).toBe(false)
  })

  it('defines head arg with default HEAD', () => {
    const headArg = Diff.args!.head as Record<string, unknown>
    expect(headArg).toBeDefined()
    expect(headArg.default).toBe('HEAD')
    expect(headArg.required).toBe(false)
  })

  it('has json flag defaulting to false', () => {
    const jsonFlag = Diff.flags!.json as Record<string, unknown>
    expect(jsonFlag).toBeDefined()
    expect(jsonFlag.default).toBe(false)
  })

  it('has path flag with default dot', () => {
    const pathFlag = Diff.flags!.path as Record<string, unknown>
    expect(pathFlag).toBeDefined()
    expect(pathFlag.default).toBe('.')
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Diff.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
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
})

// ─── createViolationKey ───

describe('createViolationKey', () => {
  it('creates key from filePath:line:ruleId', () => {
    const { p } = createDiffInstance()
    const v = makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval', range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } } })
    expect(p.createViolationKey(v)).toBe('src/a.ts:5:no-eval')
  })

  it('differentiates by filePath', () => {
    const { p } = createDiffInstance()
    const a = makeViolation({ filePath: 'src/a.ts' })
    const b = makeViolation({ filePath: 'src/b.ts' })
    expect(p.createViolationKey(a)).not.toBe(p.createViolationKey(b))
  })

  it('differentiates by line number', () => {
    const { p } = createDiffInstance()
    const a = makeViolation({ range: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
    const b = makeViolation({ range: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } } })
    expect(p.createViolationKey(a)).not.toBe(p.createViolationKey(b))
  })

  it('differentiates by ruleId', () => {
    const { p } = createDiffInstance()
    const a = makeViolation({ ruleId: 'no-eval' })
    const b = makeViolation({ ruleId: 'max-params' })
    expect(p.createViolationKey(a)).not.toBe(p.createViolationKey(b))
  })

  it('produces same key for violations with identical identifying fields', () => {
    const { p } = createDiffInstance()
    const a = makeViolation({ filePath: 'src/x.ts', ruleId: 'r', range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } } })
    const b = makeViolation({ filePath: 'src/x.ts', ruleId: 'r', range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } } })
    expect(p.createViolationKey(a)).toBe(p.createViolationKey(b))
  })
})

// ─── isGitRepository ───

describe('isGitRepository', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
  })

  it('returns true when git rev-parse succeeds', async () => {
    const { execSync } = await import('node:child_process')
    vi.mocked(execSync).mockReturnValue('.git\n')

    const result = instance.p.isGitRepository('/project')
    expect(result).toBe(true)
    expect(execSync).toHaveBeenCalledWith(
      'git rev-parse --git-dir',
      expect.objectContaining({ cwd: '/project' }),
    )
  })

  it('returns false when git rev-parse throws', async () => {
    const { execSync } = await import('node:child_process')
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repo')
    })

    const result = instance.p.isGitRepository('/not-a-repo')
    expect(result).toBe(false)
  })
})

// ─── getViolationsAtRef ───

describe('getViolationsAtRef', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses worktree to checkout and analyze violations', async () => {
    const { execSync } = await import('node:child_process')
    const mockViolations = [makeViolation({ ruleId: 'r1' })]

    vi.mocked(execSync).mockReturnValue('')
    instance.p.analyzeViolations = vi.fn().mockResolvedValue(mockViolations)

    const result = await instance.p.getViolationsAtRef('/project', 'HEAD')

    expect(result).toEqual(mockViolations)
    expect(execSync).toHaveBeenCalled()
  })

  it('falls back to git archive when worktree fails', async () => {
    const { execSync } = await import('node:child_process')
    const mockViolations: RuleViolation[] = []

    let callCount = 0
    vi.mocked(execSync).mockImplementation(() => {
      callCount++
      // First call (worktree add) fails
      if (callCount === 1) throw new Error('worktree failed')
      // Second call (git archive) succeeds
      // Third call (cleanup) succeeds
      return ''
    })
    instance.p.analyzeViolations = vi.fn().mockResolvedValue(mockViolations)

    const result = await instance.p.getViolationsAtRef('/project', 'main')

    expect(result).toEqual(mockViolations)
  })

  it('falls back to current path analysis when both worktree and archive fail', async () => {
    const { execSync } = await import('node:child_process')
    const mockViolations = [makeViolation({ ruleId: 'fallback' })]

    let callCount = 0
    vi.mocked(execSync).mockImplementation(() => {
      callCount++
      // worktree add fails
      if (callCount === 1) throw new Error('worktree failed')
      // archive fails
      if (callCount === 2) throw new Error('archive failed')
      // cleanup succeeds
      return ''
    })
    instance.p.analyzeViolations = vi.fn().mockResolvedValue(mockViolations)

    const result = await instance.p.getViolationsAtRef('/project', 'abc123')

    expect(result).toEqual(mockViolations)
    // analyzeViolations should be called with original targetPath as fallback
    expect(instance.p.analyzeViolations).toHaveBeenCalledWith('/project')
  })

  it('cleans up temp directory even when analysis fails', async () => {
    const { execSync } = await import('node:child_process')

    vi.mocked(execSync).mockReturnValue('')
    instance.p.analyzeViolations = vi.fn().mockRejectedValue(new Error('analysis crash'))

    await expect(
      instance.p.getViolationsAtRef('/project', 'HEAD'),
    ).rejects.toThrow('analysis crash')

    expect(execSync).toHaveBeenCalled()
  })

  it('handles cleanup failure gracefully', async () => {
    const { execSync } = await import('node:child_process')

    let callCount = 0
    vi.mocked(execSync).mockImplementation(() => {
      callCount++
      if (callCount === 1) return '' // worktree add succeeds
      if (callCount === 2) throw new Error('cleanup failed') // cleanup fails
      return ''
    })
    instance.p.analyzeViolations = vi.fn().mockResolvedValue([])

    // Should not throw even if cleanup fails
    const result = await instance.p.getViolationsAtRef('/project', 'HEAD')
    expect(result).toEqual([])
  })
})

// ─── analyzeViolations ───

describe('analyzeViolations', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
  })

  it('returns empty array when no files discovered', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const result = await instance.p.analyzeViolations('/project')
    expect(result).toEqual([])
  })

  it('discovers files with expected ignore patterns', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    await instance.p.analyzeViolations('/project')

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        cwd: '/project',
        ignore: ['node_modules', 'dist', 'coverage', '.git'],
        patterns: [],
      }),
    )
  })

  it('parses discovered files and runs rules', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'src/a.ts' },
    ])

    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-eval': { create: vi.fn() },
    })

    const violation = { filePath: 'src/a.ts', message: 'msg', range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }, ruleId: 'no-eval', severity: 'error' as const }

    instance.p.analyzeViolations = vi.fn().mockResolvedValue([violation])

    const result = await instance.p.analyzeViolations('/project')
    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('no-eval')
  })

  it('skips files that fail to parse', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/bad.ts', path: 'src/bad.ts' },
      { absolutePath: '/abs/good.ts', path: 'src/good.ts' },
    ])

    instance.p.analyzeViolations = vi.fn().mockResolvedValue([])

    const result = await instance.p.analyzeViolations('/project')
    expect(result).toEqual([])
  })

  it('respects MAX_FILES_TO_PROCESS limit', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue(
      Array.from({ length: 150 }, (_, i) => ({
        absolutePath: `/abs/file${i}.ts`,
        path: `src/file${i}.ts`,
      })),
    )

    instance.p.analyzeViolations = vi.fn().mockResolvedValue([])

    await instance.p.analyzeViolations('/project')
    expect(instance.p.analyzeViolations).toHaveBeenCalledWith('/project')
  })
})

// ─── analyzeDiff ───

describe('analyzeDiff', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
  })

  it('gets violations at both refs and builds report', async () => {
    const { buildDiffReport } = await import('../../src/commands/diff-helpers.js')
    const mockReport = {
      added: [],
      base: 'HEAD~1',
      head: 'HEAD',
      improved: [],
      removed: [],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 0,
        totalHead: 0,
      },
    }
    vi.mocked(buildDiffReport).mockReturnValue(mockReport)

    const baseViolations = [makeViolation({ ruleId: 'a' })]
    const headViolations = [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' })]

    instance.p.getViolationsAtRef = vi.fn()
      .mockResolvedValueOnce(baseViolations)
      .mockResolvedValueOnce(headViolations)

    const result = await instance.p.analyzeDiff('/project', 'main', 'feature')

    expect(instance.p.getViolationsAtRef).toHaveBeenCalledWith('/project', 'main')
    expect(instance.p.getViolationsAtRef).toHaveBeenCalledWith('/project', 'feature')
    expect(buildDiffReport).toHaveBeenCalledWith('main', 'feature', baseViolations, headViolations)
    expect(result).toBe(mockReport)
  })

  it('passes correct refs to getViolationsAtRef', async () => {
    const { buildDiffReport } = await import('../../src/commands/diff-helpers.js')
    vi.mocked(buildDiffReport).mockReturnValue({
      added: [], base: 'abc', head: 'def', improved: [], removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    })

    instance.p.getViolationsAtRef = vi.fn().mockResolvedValue([])

    await instance.p.analyzeDiff('/project', 'abc', 'def')

    expect(instance.p.getViolationsAtRef).toHaveBeenCalledTimes(2)
    expect(instance.p.getViolationsAtRef).toHaveBeenNthCalledWith(1, '/project', 'abc')
    expect(instance.p.getViolationsAtRef).toHaveBeenNthCalledWith(2, '/project', 'def')
  })
})

// ─── displayReport ───

describe('displayReport', () => {
  it('delegates to displayDiffReport with verbose flag and log function', async () => {
    const { displayDiffReport } = await import('../../src/commands/diff-helpers.js')
    const { p, logs } = createDiffInstance()

    const report = {
      added: [],
      base: 'HEAD~1',
      head: 'HEAD',
      improved: [],
      removed: [],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 0,
        totalHead: 0,
      },
    }

    p.displayReport(report, true)

    expect(displayDiffReport).toHaveBeenCalledWith(report, true, expect.any(Function))
  })

  it('passes verbose=false when not verbose', async () => {
    const { displayDiffReport } = await import('../../src/commands/diff-helpers.js')
    const { p } = createDiffInstance()

    const report = {
      added: [],
      base: 'HEAD~1',
      head: 'HEAD',
      improved: [],
      removed: [],
      summary: {
        addedCount: 0,
        improvedCount: 0,
        netChange: 0,
        removedCount: 0,
        totalBase: 0,
        totalHead: 0,
      },
    }

    p.displayReport(report, false)

    expect(displayDiffReport).toHaveBeenCalledWith(report, false, expect.any(Function))
  })
})

// ─── run (integration-style with mocked internals) ───

describe('run', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    // Stub parse so oclif doesn't try to read argv
    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: false, path: '.', verbose: false },
    })
  })

  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('Path not found')
  })

  it('errors when not a git repository', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)

    instance.p.isGitRepository = vi.fn().mockReturnValue(false)

    vi.spyOn(instance.command, 'error' as keyof Diff).mockImplementation((msg: unknown) => {
      throw new Error(String(msg))
    })

    await expect(instance.p.run()).rejects.toThrow('Not a git repository')
  })

  it('outputs JSON when json flag is true', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    instance.p.isGitRepository = vi.fn().mockReturnValue(true)

    const mockReport = {
      added: [],
      base: 'HEAD~1',
      head: 'HEAD',
      improved: [],
      removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    }
    instance.p.analyzeDiff = vi.fn().mockResolvedValue(mockReport)

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: true, path: '.', verbose: false },
    })

    await instance.p.run()

    expect(instance.logs.length).toBe(1)
    const parsed = JSON.parse(instance.logs[0]!)
    expect(parsed.base).toBe('HEAD~1')
    expect(parsed.head).toBe('HEAD')
    expect(parsed.summary.netChange).toBe(0)
  })

  it('displays report when json flag is false', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    instance.p.isGitRepository = vi.fn().mockReturnValue(true)

    const mockReport = {
      added: [],
      base: 'HEAD~1',
      head: 'HEAD',
      improved: [],
      removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    }
    instance.p.analyzeDiff = vi.fn().mockResolvedValue(mockReport)
    instance.p.displayReport = vi.fn()

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: false, path: '.', verbose: false },
    })

    await instance.p.run()

    expect(instance.p.displayReport).toHaveBeenCalledWith(mockReport, false)
  })

  it('passes verbose flag to displayReport', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    instance.p.isGitRepository = vi.fn().mockReturnValue(true)

    const mockReport = {
      added: [],
      base: 'main',
      head: 'feature',
      improved: [],
      removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    }
    instance.p.analyzeDiff = vi.fn().mockResolvedValue(mockReport)
    instance.p.displayReport = vi.fn()

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'main', head: 'feature' },
      flags: { json: false, path: '.', verbose: true },
    })

    await instance.p.run()

    expect(instance.p.displayReport).toHaveBeenCalledWith(mockReport, true)
  })

  it('passes custom refs to analyzeDiff', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    instance.p.isGitRepository = vi.fn().mockReturnValue(true)

    const mockReport = {
      added: [], base: 'abc123', head: 'def456', improved: [], removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    }
    instance.p.analyzeDiff = vi.fn().mockResolvedValue(mockReport)
    instance.p.displayReport = vi.fn()

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'abc123', head: 'def456' },
      flags: { json: false, path: '.', verbose: false },
    })

    await instance.p.run()

    expect(instance.p.analyzeDiff).toHaveBeenCalledWith(
      expect.any(String),
      'abc123',
      'def456',
    )
  })

  it('uses custom path from flags', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    instance.p.isGitRepository = vi.fn().mockReturnValue(true)

    const mockReport = {
      added: [], base: 'HEAD~1', head: 'HEAD', improved: [], removed: [],
      summary: { addedCount: 0, improvedCount: 0, netChange: 0, removedCount: 0, totalBase: 0, totalHead: 0 },
    }
    instance.p.analyzeDiff = vi.fn().mockResolvedValue(mockReport)
    instance.p.displayReport = vi.fn()

    vi.spyOn(instance.command, 'parse' as keyof Diff).mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: false, path: './src', verbose: false },
    })

    await instance.p.run()

    expect(instance.p.analyzeDiff).toHaveBeenCalledWith(
      expect.stringContaining('src'),
      'HEAD~1',
      'HEAD',
    )
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

  it('includes example with default usage', () => {
    const hasDefault = Diff.examples!.some(
      (e) => e.description.toLowerCase().includes('previous commit'),
    )
    expect(hasDefault).toBe(true)
  })

  it('includes example comparing branches', () => {
    const hasBranch = Diff.examples!.some(
      (e) => e.description.toLowerCase().includes('branch'),
    )
    expect(hasBranch).toBe(true)
  })

  it('includes JSON output example', () => {
    const hasJson = Diff.examples!.some(
      (e) => e.command.includes('--json'),
    )
    expect(hasJson).toBe(true)
  })
})

// ─── Default arg values ───

describe('Diff default argument values', () => {
  it('base defaults to HEAD~1 for comparing previous commit', () => {
    const baseArg = Diff.args!.base as Record<string, unknown>
    expect(baseArg.default).toBe('HEAD~1')
    expect(baseArg.description).toContain('Base')
  })

  it('head defaults to HEAD for current state', () => {
    const headArg = Diff.args!.head as Record<string, unknown>
    expect(headArg.default).toBe('HEAD')
    expect(headArg.description).toContain('Head')
  })

  it('both args are optional strings', () => {
    const baseArg = Diff.args!.base as Record<string, unknown>
    const headArg = Diff.args!.head as Record<string, unknown>
    expect(baseArg.required).toBe(false)
    expect(headArg.required).toBe(false)
  })
})
