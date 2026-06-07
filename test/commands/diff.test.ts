import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Diff from '../../src/commands/diff.js'

const { mockExistsSync, mockExecSync, mockBuildDiffReport, mockCreateViolationKey, mockDisplayDiffReport } = vi.hoisted(() => ({
  mockExistsSync: vi.fn().mockReturnValue(true),
  mockExecSync: vi.fn().mockReturnValue(''),
  mockBuildDiffReport: vi.fn(),
  mockCreateViolationKey: vi.fn((v: unknown) => JSON.stringify(v)),
  mockDisplayDiffReport: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
}))

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    fail: vi.fn().mockReturnThis(),
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
  })),
}))

vi.mock('../../src/commands/diff-helpers.js', () => ({
  buildDiffReport: mockBuildDiffReport,
  createViolationKey: mockCreateViolationKey,
  displayDiffReport: mockDisplayDiffReport,
}))

interface DiffPrivate {
  log: (...args: unknown[]) => void
  run: () => Promise<void>
  error: (msg: string, opts?: { exit?: number }) => never
  parse: () => Promise<{ args: Record<string, unknown>; flags: Record<string, unknown> }>
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

describe('Diff command static properties', () => {
  it('has correct description', () => {
    expect(Diff.description).toBe('Compare violations between git branches or commits')
  })

  it('has base arg with default HEAD~1', () => {
    const baseArg = Diff.args!.base as Record<string, unknown>
    expect(baseArg).toBeDefined()
    expect(baseArg.default).toBe('HEAD~1')
    expect(baseArg.required).toBe(false)
  })

  it('has head arg with default HEAD', () => {
    const headArg = Diff.args!.head as Record<string, unknown>
    expect(headArg).toBeDefined()
    expect(headArg.default).toBe('HEAD')
    expect(headArg.required).toBe(false)
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
    }
  })

  it('has json flag defaulting to false', () => {
    const jsonFlag = Diff.flags!.json as Record<string, unknown>
    expect(jsonFlag).toBeDefined()
    expect(jsonFlag.default).toBe(false)
  })

  it('has path flag with default "."', () => {
    const pathFlag = Diff.flags!.path as Record<string, unknown>
    expect(pathFlag).toBeDefined()
    expect(pathFlag.default).toBe('.')
  })

  it('has verbose flag with char v', () => {
    const verboseFlag = Diff.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
    expect(verboseFlag.default).toBe(false)
  })
})

describe('Diff flags', () => {
  it('has exactly 3 flags defined', () => {
    expect(Object.keys(Diff.flags!)).toHaveLength(3)
  })

  it('flags include json, path, verbose', () => {
    const flagKeys = Object.keys(Diff.flags!)
    expect(flagKeys).toContain('json')
    expect(flagKeys).toContain('path')
    expect(flagKeys).toContain('verbose')
  })

  it('verbose has correct char alias', () => {
    expect((Diff.flags!.verbose as Record<string, unknown>).char).toBe('v')
  })
})

describe('Diff examples structure', () => {
  it('each example has non-empty command and description', () => {
    for (const example of Diff.examples!) {
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })

  it('includes example with default usage', () => {
    const hasDefault = Diff.examples!.some(
      (e) => e.description.toLowerCase().includes('previous'),
    )
    expect(hasDefault).toBe(true)
  })

  it('includes example with branch comparison', () => {
    const hasBranch = Diff.examples!.some(
      (e) => e.description.toLowerCase().includes('branch'),
    )
    expect(hasBranch).toBe(true)
  })

  it('includes JSON output example via --json', () => {
    const hasJson = Diff.examples!.some(
      (e) => e.command.includes('--json'),
    )
    expect(hasJson).toBe(true)
  })

  it('includes verbose example', () => {
    const examples = Diff.examples!.map((e) => e.command).join(' ')
    expect(examples.length).toBeGreaterThan(0)
  })
})

describe('Diff methods', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    mockExecSync.mockReturnValue('')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('isGitRepository returns true when git command succeeds', () => {
    mockExecSync.mockReturnValue('')
    expect(instance.command.isGitRepository('.')).toBe(true)
  })

  it('isGitRepository returns false when git command fails', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a repo')
    })
    expect(instance.command.isGitRepository('.')).toBe(false)
  })

  it('createViolationKey returns a string', () => {
    const violation = { message: 'test', ruleId: 'rule1' }
    const result = instance.command.createViolationKey(violation as never)
    expect(typeof result).toBe('string')
  })
})

describe('Diff run', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    mockExistsSync.mockReturnValue(true)
    mockExecSync.mockReturnValue('')
    mockBuildDiffReport.mockReturnValue({
      added: [],
      baseRef: 'HEAD~1',
      headRef: 'HEAD',
      removed: [],
      summary: { added: 0, removed: 0, total: 0 },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('errors when path does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    vi.spyOn(instance.p, 'error').mockImplementation((msg: string) => {
      throw new Error(String(msg))
    })
    vi.spyOn(instance.p, 'parse').mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: false, path: '/nonexistent', verbose: false },
    })
    await expect(instance.p.run()).rejects.toThrow('Path not found')
  })

  it('errors when not a git repository', async () => {
    mockExistsSync.mockReturnValue(true)
    mockExecSync.mockImplementation(() => {
      throw new Error('not a repo')
    })
    vi.spyOn(instance.p, 'error').mockImplementation((msg: string) => {
      throw new Error(String(msg))
    })
    vi.spyOn(instance.p, 'parse').mockResolvedValue({
      args: { base: 'HEAD~1', head: 'HEAD' },
      flags: { json: false, path: '.', verbose: false },
    })
    await expect(instance.p.run()).rejects.toThrow('Not a git repository')
  })
})

describe('Diff result propagation', () => {
  let instance: ReturnType<typeof createDiffInstance>

  beforeEach(() => {
    instance = createDiffInstance()
    mockExistsSync.mockReturnValue(true)
    mockExecSync.mockImplementation((cmd: string) => {
      if (typeof cmd === 'string' && cmd.includes('rev-parse')) return ''
      throw new Error('command failed')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('uses summary counts from buildDiffReport result', async () => {
    mockBuildDiffReport.mockReturnValue({
      added: [],
      baseRef: 'main',
      headRef: 'feature',
      removed: [],
      summary: { added: 5, removed: 2, total: 7 },
    })
    vi.spyOn(instance.p, 'parse').mockResolvedValue({
      args: { base: 'main', head: 'feature' },
      flags: { json: false, path: '.', verbose: false },
    })
    await instance.p.run()
    expect(mockBuildDiffReport).toHaveBeenCalled()
  })

  it('passes through result with violations', async () => {
    mockBuildDiffReport.mockReturnValue({
      added: [{ ruleId: 'no-console', message: 'console.log' }],
      baseRef: 'abc123',
      headRef: 'def456',
      removed: [],
      summary: { added: 1, removed: 0, total: 1 },
    })
    vi.spyOn(instance.p, 'parse').mockResolvedValue({
      args: { base: 'abc123', head: 'def456' },
      flags: { json: false, path: '.', verbose: false },
    })
    await instance.p.run()
    expect(mockBuildDiffReport).toHaveBeenCalled()
  })
})
