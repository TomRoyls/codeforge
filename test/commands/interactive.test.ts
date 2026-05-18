import { afterEach, describe, expect, it, vi } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:path', () => ({
  resolve: (p: string) => `/resolved/${p}`,
}))

vi.mock('node:readline', () => ({
  createInterface: vi.fn(),
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: vi.fn(),
}))

vi.mock('../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn(),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: { loadAllRules: vi.fn() },
}))

vi.mock('../../src/rules/categories.js', () => ({
  getRuleCategory: vi.fn(),
}))

vi.mock('../../src/commands/interactive-helpers.js', () => ({
  applyFix: vi.fn(),
  filterBySeverity: vi.fn(),
  formatSeverity: vi.fn((s: string) => `[${s}]`),
  formatSummary: vi.fn((r: { applied: number; skipped: number; total: number }) => [
    `Applied: ${r.applied}`,
    `Skipped: ${r.skipped}`,
    `Total: ${r.total}`,
  ]),
}))

import { existsSync } from 'node:fs'
import { createInterface } from 'node:readline'

import { discoverFiles } from '../../src/core/file-discovery.js'
import { Parser } from '../../src/core/parser.js'
import { RuleRegistry } from '../../src/core/rule-registry.js'
import { lazyRuleLoader } from '../../src/rules/lazy-loader.js'
import { getRuleCategory } from '../../src/rules/categories.js'
import {
  applyFix,
  filterBySeverity,
  formatSummary,
} from '../../src/commands/interactive-helpers.js'

import Interactive from '../../src/commands/interactive.js'

// ─── Helpers ───

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/foo.ts',
    message: 'Unexpected console statement',
    range: { end: { column: 20, line: 5 }, start: { column: 0, line: 5 } },
    ruleId: 'no-console',
    severity: 'warning',
    ...overrides,
  }
}

function mockReadline(answers: string[]) {
  let callIndex = 0
  const closeFn = vi.fn()
  const questionFn = vi.fn((_prompt: string, cb: (answer: string) => void) => {
    const answer = answers[callIndex] ?? 'q'
    callIndex++
    cb(answer)
  })
  vi.mocked(createInterface).mockReturnValue({
    close: closeFn,
    question: questionFn,
  } as unknown as ReturnType<typeof createInterface>)
  return { closeFn, questionFn }
}

function setupMocksForCollection(violations: RuleViolation[] = []) {
  vi.mocked(discoverFiles).mockResolvedValue([
    { absolutePath: '/resolved/./src/foo.ts', path: 'src/foo.ts' },
  ])

  const runRules = vi.fn().mockReturnValue(violations)

  vi.mocked(Parser).mockImplementation(function (this: object) {
    this.dispose = vi.fn()
    this.initialize = vi.fn().mockResolvedValue(undefined)
    this.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })
  } as unknown as typeof Parser)

  vi.mocked(RuleRegistry).mockImplementation(function (this: object) {
    this.register = vi.fn()
    this.runRules = runRules
  } as unknown as typeof RuleRegistry)

  vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
    'no-console': { id: 'no-console' },
  })
  vi.mocked(getRuleCategory).mockReturnValue('patterns')
  vi.mocked(filterBySeverity).mockImplementation((v) => v)

  return { runRules }
}

/** Create Interactive instance with parse/error stubbed for testability. */
function createCommand(
  parseResult: { args?: Record<string, string>; flags?: Record<string, string | boolean> } = {},
): Interactive & { logs: string[] } {
  const logs: string[] = []
  const cmd = new Interactive([], {} as never)
  cmd.log = (msg: string) => { logs.push(msg) }

  const parseStub = vi.fn().mockResolvedValue({
    args: { path: '.', ...parseResult.args },
    flags: { 'auto-safe': false, severity: 'warning', verbose: false, ...parseResult.flags },
  })
  Object.defineProperty(cmd, 'parse', { value: parseStub, writable: true })
  Object.defineProperty(cmd, 'error', {
    value: (msg: string) => {
      throw new Error(msg)
    },
    writable: true,
  })

  return Object.assign(cmd, { logs })
}

const strip = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '')
const plainLogs = (logs: string[]) => logs.map(strip).join('\n')

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── path validation ───

describe('path validation', () => {
  it('errors when target path does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const cmd = createCommand()
    await expect(cmd.run()).rejects.toThrow('Path not found')
  })
})

// ─── no violations ───

describe('no violations found', () => {
  it('logs success message when filtered list is empty', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    setupMocksForCollection([])
    vi.mocked(filterBySeverity).mockReturnValue([])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('No violations found!')
  })
})

// ─── violation header display ───

describe('violation header display', () => {
  it('shows count and instructions before reviewing', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y', 'y'])

    const cmd = createCommand()
    await cmd.run()

    const plain = plainLogs(cmd.logs)
    expect(plain).toContain('2 violations to review')
    expect(plain).toContain('Press Enter')
    expect(plain).toContain('q to quit')
  })
})

// ─── user choice: quit ───

describe('user choice: quit', () => {
  it('skips all remaining violations on q', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation(), makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline(['q'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 0, skipped: 3 }),
    )
  })

  it('skips remaining violations on quit keyword', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline(['quit'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 2 }),
    )
  })
})

// ─── user choice: skip ───

describe('user choice: skip', () => {
  it('skips single violation and continues to next', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['s', 'y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Skipped')
    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1, skipped: 1 }),
    )
  })

  it('recognizes skip keyword', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline(['skip'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })
})

// ─── user choice: yes ───

describe('user choice: yes', () => {
  it('applies fix on y', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fixed line' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Fix applied')
    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1 }),
    )
  })

  it('applies fix on yes keyword', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['yes'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1 }),
    )
  })

  it('applies fix on empty Enter when suggestion exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline([''])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1 }),
    )
  })

  it('logs failure when fix cannot be applied', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(false)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Could not apply fix')
    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })
})

// ─── no fix available ───

describe('no fix available', () => {
  it('skips on Enter when no suggestion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: undefined })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline([''])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })

  it('skips on unknown input when no suggestion', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: undefined })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline(['xyz'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })

  it('skips on unknown input even when fix exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    mockReadline(['zzz'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })
})

// ─── auto-safe mode ───

describe('auto-safe mode', () => {
  it('auto-applies fixable violations without prompting', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [
      makeViolation({ suggestion: 'fix1' }),
      makeViolation({ suggestion: 'fix2' }),
    ]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline([])

    const cmd = createCommand({ flags: { 'auto-safe': true } })
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Fix applied automatically')
    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 2, skipped: 0 }),
    )
  })

  it('skips when auto-safe fix fails', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(false)
    mockReadline([])

    const cmd = createCommand({ flags: { 'auto-safe': true } })
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Could not apply fix')
    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
    )
  })

  it('prompts for non-fixable violations even in auto-safe mode', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [
      makeViolation({ suggestion: undefined }),
      makeViolation({ suggestion: 'fix' }),
    ]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['s'])

    const cmd = createCommand({ flags: { 'auto-safe': true } })
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1, skipped: 1 }),
    )
  })
})

// ─── display formatting ───

describe('display formatting', () => {
  it('renders file path with line number', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ filePath: 'src/bar.ts' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('src/bar.ts:5')
  })

  it('shows Violation N/M counter', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y', 'y'])

    const cmd = createCommand()
    await cmd.run()

    const plain = plainLogs(cmd.logs)
    expect(plain).toContain('1/2')
    expect(plain).toContain('2/2')
  })

  it('shows rule ID and severity label', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ ruleId: 'prefer-const', severity: 'error' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    const plain = plainLogs(cmd.logs)
    expect(plain).toContain('prefer-const')
    expect(plain).toContain('[error]')
  })

  it('shows violation message text', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ message: 'Use const instead of let' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Use const instead of let')
  })
})

// ─── verbose mode ───

describe('verbose mode', () => {
  it('shows suggestion in verbose mode', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'Replace with const x = 1' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand({ flags: { verbose: true } })
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('Replace with const x = 1')
  })

  it('omits suggestion line when not verbose', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'secret suggestion' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).not.toContain('Suggestion:')
  })
})

// ─── summary output ───

describe('summary output', () => {
  it('logs each line from formatSummary', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation()]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    vi.mocked(formatSummary).mockReturnValue(['Line A', 'Line B', 'Line C'])
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(cmd.logs).toContain('Line A')
    expect(cmd.logs).toContain('Line B')
    expect(cmd.logs).toContain('Line C')
  })
})

// ─── violation collection ───

describe('violation collection', () => {
  it('passes discovered files through parser and registry', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation()]
    const { runRules } = setupMocksForCollection(violations)
    runRules.mockReturnValue(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand()
    await cmd.run()

    expect(discoverFiles).toHaveBeenCalled()
    expect(runRules).toHaveBeenCalled()
  })

  it('gracefully handles parse errors', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/bad.ts', path: 'bad.ts' },
    ])

    vi.mocked(Parser).mockImplementation(function (this: object) {
      this.dispose = vi.fn()
      this.initialize = vi.fn().mockResolvedValue(undefined)
      this.parseFile = vi.fn().mockRejectedValue(new Error('parse failure'))
    } as unknown as typeof Parser)

    const runRules = vi.fn()
    vi.mocked(RuleRegistry).mockImplementation(function (this: object) {
      this.register = vi.fn()
      this.runRules = runRules
    } as unknown as typeof RuleRegistry)

    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})
    vi.mocked(filterBySeverity).mockReturnValue([])
    vi.mocked(formatSummary).mockReturnValue(['summary'])

    const cmd = createCommand()
    await cmd.run()

    expect(runRules).not.toHaveBeenCalled()
  })
})

// ─── edge cases ───

describe('edge cases', () => {
  it('handles empty violations list', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    setupMocksForCollection([])
    vi.mocked(filterBySeverity).mockReturnValue([])
    vi.mocked(formatSummary).mockReturnValue(['done'])

    const cmd = createCommand()
    await cmd.run()

    expect(plainLogs(cmd.logs)).toContain('No violations found!')
  })

  it('handles mixed yes/skip/quit across multiple violations', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [
      makeViolation({ suggestion: 'fix1' }),
      makeViolation({ suggestion: 'fix2' }),
      makeViolation({ suggestion: 'fix3' }),
      makeViolation(),
    ]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y', 's', 'n', 's'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1, skipped: 3, total: 4 }),
    )
  })

  it('counts remaining as skipped on mid-session quit', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [
      makeViolation({ suggestion: 'fix1' }),
      makeViolation({ suggestion: 'fix2' }),
      makeViolation({ suggestion: 'fix3' }),
    ]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y', 'q'])

    const cmd = createCommand()
    await cmd.run()

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1, skipped: 2 }),
    )
  })

  it('trims and lowercases user input', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation({ suggestion: 'fix' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue(violations)
    vi.mocked(applyFix).mockResolvedValue(true)

    let questionCb: (answer: string) => void = () => {}
    vi.mocked(createInterface).mockReturnValue({
      close: vi.fn(),
      question: vi.fn((_prompt: string, cb: (answer: string) => void) => {
        questionCb = cb
      }),
    } as unknown as ReturnType<typeof createInterface>)

    const cmd = createCommand()
    const runPromise = cmd.run()

    await new Promise((r) => setTimeout(r, 0))
    questionCb('  Y  ')

    await runPromise

    expect(formatSummary).toHaveBeenCalledWith(
      expect.objectContaining({ applied: 1 }),
    )
  })

  it('delegates filterBySeverity to helper with correct severity', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const violations = [makeViolation(), makeViolation({ severity: 'error' })]
    setupMocksForCollection(violations)
    vi.mocked(filterBySeverity).mockReturnValue([violations[1]!])
    vi.mocked(applyFix).mockResolvedValue(true)
    mockReadline(['y'])

    const cmd = createCommand({ flags: { severity: 'error' } })
    await cmd.run()

    expect(filterBySeverity).toHaveBeenCalledWith(violations, 'error')
  })
})
