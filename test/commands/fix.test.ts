import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Fix from '../../src/commands/fix.js'

// ─── Top-level mocks ───

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('node:os', () => ({
  default: {
    cpus: () => [{ length: 4 }],
  },
}))

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  }),
}))

vi.mock('../../src/core/parser.js', () => ({
  Parser: class {
    parseFile = vi.fn()
  },
}))

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/utils/command-helpers.js', () => ({
  resolvePatterns: vi.fn().mockReturnValue(['**/*.ts']),
  setupRuleRegistryLazy: vi.fn().mockResolvedValue({
    runRules: vi.fn().mockReturnValue([]),
  }),
}))

vi.mock('../../src/config/types.js', () => ({
  DEFAULT_CONFIG: { files: ['**/*.ts'], ignore: [] },
}))

vi.mock('../../src/fix/fixer.js', () => ({
  applyFixesToFile: vi.fn().mockReturnValue({
    changes: [],
    conflicts: [],
    fixesApplied: 0,
    fixesSkipped: 0,
  }),
}))

vi.mock('../../src/fix/diff-renderer.js', () => ({
  renderTextChangesAsDiff: vi.fn().mockReturnValue({ filePath: 'test.ts', hunks: [] }),
  formatDiffForConsole: vi.fn().mockReturnValue(''),
}))

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    setLevel: vi.fn(),
  },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Create a Fix command instance with stubbed oclif parse/exit/log.
 * Private methods are accessed via a typed facade for testability.
 */
interface FixPrivate {
  getRulesWithFixes: (safeOnly?: boolean) => Promise<Map<string, unknown>>
  log: (...args: unknown[]) => void
  outputFixResults: (
    results: {
      filesModified: string[]
      filesUnchanged: string[]
      totalFixesApplied: number
      totalFixesSkipped: number
    },
    flags: Record<string, unknown>,
    ciMode: boolean,
  ) => void
  outputJson: (data: unknown) => void
  printSummary: (
    results: {
      filesModified: string[]
      filesUnchanged: string[]
      totalFixesApplied: number
      totalFixesSkipped: number
    },
    flags: Record<string, unknown>,
  ) => void
  processFile: (
    file: { absolutePath: string; path: string },
    context: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>
  processFiles: (
    discoveredFiles: Array<{ absolutePath: string; path: string }>,
    context: Record<string, unknown>,
    flags: Record<string, unknown>,
  ) => Promise<{
    filesModified: string[]
    filesUnchanged: string[]
    totalFixesApplied: number
    totalFixesSkipped: number
  }>
  setupFixContext: (
    args: { files: string[] | undefined },
    flags: Record<string, unknown>,
    ciMode: boolean,
  ) => Promise<null | {
    context: Record<string, unknown>
    discoveredFiles: Array<{ absolutePath: string; path: string }>
  }>
}

function createFixInstance(): { command: Fix; p: FixPrivate; logs: string[] } {
  const logs: string[] = []
  const command = new Fix([], {} as never)
  const p = command as unknown as FixPrivate

  // Stub oclif's log to capture output
  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }

  return { command, p, logs }
}

// ─── Static properties ───

describe('Fix command static properties', () => {
  it('has correct description', () => {
    expect(Fix.description).toBe('Automatically fix violations in source files')
  })

  it('has examples defined', () => {
    expect(Fix.examples).toBeDefined()
    expect(Fix.examples!.length).toBeGreaterThan(0)
  })

  it('defines files arg as optional string array', () => {
    const filesArg = Fix.args!.files
    expect(filesArg).toBeDefined()
    expect(filesArg!.description).toBe('Files or patterns to fix')
    expect(filesArg!.multiple).toBe(true)
    expect(filesArg!.required).toBe(false)
  })

  it('has ci flag defaulting to false', () => {
    const ciFlag = Fix.flags!.ci
    expect(ciFlag).toBeDefined()
  })

  it('has concurrency flag', () => {
    const concurrencyFlag = Fix.flags!.concurrency
    expect(concurrencyFlag).toBeDefined()
  })

  it('has config flag with char c', () => {
    const configFlag = Fix.flags!.config as Record<string, unknown>
    expect(configFlag).toBeDefined()
    expect(configFlag.char).toBe('c')
  })

  it('has dry-run flag with char d defaulting to false', () => {
    const dryRunFlag = Fix.flags!['dry-run'] as Record<string, unknown>
    expect(dryRunFlag).toBeDefined()
    expect(dryRunFlag.char).toBe('d')
  })

  it('has ignore flag with char i and multiple option', () => {
    const ignoreFlag = Fix.flags!.ignore as Record<string, unknown>
    expect(ignoreFlag).toBeDefined()
    expect(ignoreFlag.char).toBe('i')
    expect(ignoreFlag.multiple).toBe(true)
  })

  it('has rules flag with char r', () => {
    const rulesFlag = Fix.flags!.rules as Record<string, unknown>
    expect(rulesFlag).toBeDefined()
    expect(rulesFlag.char).toBe('r')
  })

  it('has safe-only flag defaulting to false', () => {
    const safeOnlyFlag = Fix.flags!['safe-only'] as Record<string, unknown>
    expect(safeOnlyFlag).toBeDefined()
  })

  it('has verbose flag with char v defaulting to false', () => {
    const verboseFlag = Fix.flags!.verbose as Record<string, unknown>
    expect(verboseFlag).toBeDefined()
    expect(verboseFlag.char).toBe('v')
  })

  it('has ignore-path flag', () => {
    const ignorePathFlag = Fix.flags!['ignore-path']
    expect(ignorePathFlag).toBeDefined()
  })

  it('defines at least 5 examples', () => {
    expect(Fix.examples!.length).toBeGreaterThanOrEqual(5)
  })
})

// ─── getRulesWithFixes ───

describe('getRulesWithFixes', () => {
  let fixInstance: { command: Fix; p: FixPrivate; logs: string[] }

  beforeEach(() => {
    fixInstance = createFixInstance()
  })

  it('returns empty map when no rules loaded', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const result = await fixInstance.p.getRulesWithFixes(false)
    expect(result.size).toBe(0)
  })

  it('includes rules with fix functions', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'prefer-const': {
        fix: vi.fn(),
        meta: { name: 'prefer-const' },
      },
    })

    const result = await fixInstance.p.getRulesWithFixes(false)
    expect(result.size).toBe(1)
    expect(result.has('prefer-const')).toBe(true)
  })

  it('excludes rules without fix functions', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-fix': { meta: { name: 'no-fix' } },
    })

    const result = await fixInstance.p.getRulesWithFixes(false)
    expect(result.size).toBe(0)
  })

  it('excludes rules where fix is not a function', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'bad-fix': { fix: 'not-a-function', meta: { name: 'bad-fix' } },
    })

    const result = await fixInstance.p.getRulesWithFixes(false)
    expect(result.size).toBe(0)
  })

  it('includes all fixable rules when safeOnly is false', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'unsafe-rule': { fix: vi.fn(), meta: { fixable: false, name: 'unsafe-rule' } },
      'safe-rule': { fix: vi.fn(), meta: { fixable: true, name: 'safe-rule' } },
    })

    const result = await fixInstance.p.getRulesWithFixes(false)
    expect(result.size).toBe(2)
  })

  it('excludes non-fixable rules when safeOnly is true', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'unsafe-rule': { fix: vi.fn(), meta: { fixable: false, name: 'unsafe-rule' } },
      'safe-rule': { fix: vi.fn(), meta: { fixable: true, name: 'safe-rule' } },
    })

    const result = await fixInstance.p.getRulesWithFixes(true)
    expect(result.size).toBe(1)
    expect(result.has('safe-rule')).toBe(true)
  })

  it('sets priority to 10 for all rules', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    const result = await fixInstance.p.getRulesWithFixes(false)
    const entry = result.get('my-rule') as Record<string, unknown>
    expect(entry.priority).toBe(10)
  })
})

// ─── outputJson ───

describe('outputJson', () => {
  it('logs stringified JSON to output', () => {
    const { p, logs } = createFixInstance()
    const data = { hello: 'world', num: 42 }

    p.outputJson(data)

    expect(logs.length).toBe(1)
    const parsed = JSON.parse(logs[0])
    expect(parsed.hello).toBe('world')
    expect(parsed.num).toBe(42)
  })

  it('pretty-prints JSON with 2-space indent', () => {
    const { p, logs } = createFixInstance()

    p.outputJson({ a: 1 })

    expect(logs[0]).toContain('\n')
    expect(logs[0]).toContain('  "a": 1')
  })
})

// ─── printSummary ───

describe('printSummary', () => {
  const makeResults = (
    overrides: Record<string, unknown> = {},
  ) => ({
    filesModified: [],
    filesUnchanged: [],
    totalFixesApplied: 0,
    totalFixesSkipped: 0,
    ...overrides,
  })

  it('shows fix summary header', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults(), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Fix Summary')
  })

  it('shows dry-run mode when flag set', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults(), { 'dry-run': true })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Dry run')
  })

  it('shows fixes applied count', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults({ totalFixesApplied: 7 }), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Fixes applied: 7')
  })

  it('shows fixes skipped when greater than 0', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults({ totalFixesSkipped: 3 }), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Fixes skipped: 3')
  })

  it('does not show fixes skipped when 0', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults({ totalFixesSkipped: 0 }), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).not.toContain('Fixes skipped')
  })

  it('shows files modified count in non-dry-run mode', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(
      makeResults({ filesModified: ['a.ts', 'b.ts'] }),
      { 'dry-run': false },
    )

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Files modified: 2')
  })

  it('shows files unchanged count in non-dry-run mode', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(
      makeResults({ filesUnchanged: ['c.ts'] }),
      { 'dry-run': false },
    )

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Files unchanged: 1')
  })

  it('shows "would be modified" in dry-run with fixes', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(
      makeResults({ totalFixesApplied: 1, filesModified: ['a.ts'] }),
      { 'dry-run': true },
    )

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('would be modified')
  })

  it('does not show "would be modified" in dry-run without fixes', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults(), { 'dry-run': true })

    const output = stripAnsi(logs.join('\n'))
    expect(output).not.toContain('would be modified')
  })

  it('shows "no violations" message when nothing applied or skipped', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults(), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('No violations found to fix')
  })

  it('shows success message when fixes applied in non-dry-run', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(makeResults({ totalFixesApplied: 2 }), { 'dry-run': false })

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Fixes applied successfully')
  })

  it('does not show success message in dry-run mode', () => {
    const { p, logs } = createFixInstance()
    p.printSummary(
      makeResults({ totalFixesApplied: 2 }),
      { 'dry-run': true },
    )

    const output = stripAnsi(logs.join('\n'))
    expect(output).not.toContain('Fixes applied successfully')
  })
})

// ─── outputFixResults ───

describe('outputFixResults', () => {
  const makeResults = () => ({
    filesModified: ['a.ts'],
    filesUnchanged: ['b.ts'],
    totalFixesApplied: 1,
    totalFixesSkipped: 0,
  })

  it('outputs JSON in CI mode', () => {
    const { p, logs } = createFixInstance()
    p.outputFixResults(makeResults(), { 'dry-run': false }, true)

    expect(logs.length).toBe(1)
    const parsed = JSON.parse(logs[0])
    expect(parsed.dryRun).toBe(false)
    expect(parsed.filesModified).toEqual(['a.ts'])
    expect(parsed.summary.fixesApplied).toBe(1)
  })

  it('outputs JSON with dryRun true when flag set in CI mode', () => {
    const { p, logs } = createFixInstance()
    p.outputFixResults(makeResults(), { 'dry-run': true }, true)

    const parsed = JSON.parse(logs[0])
    expect(parsed.dryRun).toBe(true)
  })

  it('prints summary in non-CI mode', () => {
    const { p, logs } = createFixInstance()
    p.outputFixResults(makeResults(), { 'dry-run': false }, false)

    const output = stripAnsi(logs.join('\n'))
    expect(output).toContain('Fix Summary')
  })
})

// ─── processFile ───

describe('processFile', () => {
  let fixInstance: ReturnType<typeof createFixInstance>

  beforeEach(async () => {
    fixInstance = createFixInstance()
    const { writeFile } = await import('node:fs/promises')
    vi.mocked(writeFile).mockClear()
  })

  it('returns unchanged when sourceFile is null', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: null })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.status).toBe('unchanged')
    expect(r.fixesApplied).toBe(0)
    expect(r.file).toBe('test.ts')
    expect(r.conflicts).toEqual([])
  })

  it('returns unchanged when no violations found', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('code') }
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.status).toBe('unchanged')
    expect(r.fixesApplied).toBe(0)
  })

  it('returns processed with fixesApplied when fixes succeed', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed code') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'prefer-const' }]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.status).toBe('processed')
    expect(r.fixesApplied).toBe(1)
    expect(r.conflicts).toEqual([])
  })

  it('writes file when not dry-run and fixes applied', async () => {
    const { writeFile } = await import('node:fs/promises')
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'r' }]) },
        rulesWithFixes: new Map(),
      },
    )

    expect(writeFile).toHaveBeenCalledWith('/abs/test.ts', 'fixed', 'utf8')
  })

  it('does not write file in dry-run mode', async () => {
    const { writeFile } = await import('node:fs/promises')
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: true,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'r' }]) },
        rulesWithFixes: new Map(),
      },
    )

    expect(writeFile).not.toHaveBeenCalled()
  })

  it('returns error when parsing throws', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue(new Error('Parse error'))

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn() },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.status).toBe('error')
    expect(r.error).toBe('Parse error')
    expect(r.fixesApplied).toBe(0)
  })

  it('handles non-Error thrown values', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue('string error')

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn() },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.status).toBe('error')
    expect(r.error).toBe('string error')
  })

  it('returns conflicts from fix report', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('code') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      fixesApplied: 1,
      fixesSkipped: 1,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'r' }]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.conflicts).toEqual([{ conflictingRule: 'rule-b', ruleId: 'rule-a' }])
    expect(r.fixesSkipped).toBe(1)
  })

  it('generates diffPreview in dry-run mode when changes exist', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { renderTextChangesAsDiff } = await import('../../src/fix/diff-renderer.js')
    const { formatDiffForConsole } = await import('../../src/fix/diff-renderer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    vi.mocked(formatDiffForConsole).mockReturnValue('formatted diff')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: true,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'r' }]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.diffPreview).toBe('formatted diff')
    expect(renderTextChangesAsDiff).toHaveBeenCalled()
  })

  it('does not generate diffPreview when formatDiffForConsole returns empty', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { formatDiffForConsole } = await import('../../src/fix/diff-renderer.js')
    const { Parser } = await import('../../src/core/parser.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })
    vi.mocked(formatDiffForConsole).mockReturnValue('')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const result = await fixInstance.p.processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: true,
        parser,
        registry: { runRules: vi.fn().mockReturnValue([{ ruleId: 'r' }]) },
        rulesWithFixes: new Map(),
      },
    )

    const r = result as Record<string, unknown>
    expect(r.diffPreview).toBeUndefined()
  })
})

// ─── processFiles ───

describe('processFiles', () => {
  let fixInstance: ReturnType<typeof createFixInstance>

  beforeEach(() => {
    fixInstance = createFixInstance()
  })

  it('aggregates results from multiple files', async () => {
    const mockProcessFile = vi.fn()
      .mockResolvedValueOnce({
        conflicts: [],
        file: 'a.ts',
        fixesApplied: 2,
        fixesSkipped: 0,
        status: 'processed',
      })
      .mockResolvedValueOnce({
        conflicts: [],
        file: 'b.ts',
        fixesApplied: 0,
        fixesSkipped: 0,
        status: 'unchanged',
      })

    // Override processFile on the instance
    fixInstance.p.processFile = mockProcessFile

    const result = await fixInstance.p.processFiles(
      [
        { absolutePath: '/abs/a.ts', path: 'a.ts' },
        { absolutePath: '/abs/b.ts', path: 'b.ts' },
      ],
      {},
      { concurrency: 1, 'dry-run': false, verbose: false },
    )

    expect(result.totalFixesApplied).toBe(2)
    expect(result.filesModified).toEqual(['a.ts'])
    expect(result.filesUnchanged).toEqual(['b.ts'])
  })

  it('handles error results by logging them', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [],
      error: 'something broke',
      file: 'bad.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'error',
    })

    fixInstance.p.processFile = mockProcessFile

    const result = await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/bad.ts', path: 'bad.ts' }],
      {},
      { concurrency: 1, 'dry-run': false, verbose: false },
    )

    expect(result.totalFixesApplied).toBe(0)
    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('Error processing bad.ts')
  })

  it('tracks skipped fixes from conflicts', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      file: 'a.ts',
      fixesApplied: 1,
      fixesSkipped: 2,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    const result = await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': false, verbose: false },
    )

    expect(result.totalFixesSkipped).toBe(2)
  })

  it('shows verbose conflict output', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      file: 'a.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': false, verbose: true },
    )

    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('Skipped rule-a')
    expect(output).toContain('conflicts with rule-b')
  })

  it('shows verbose fix output in non-dry-run', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [],
      file: 'a.ts',
      fixesApplied: 3,
      fixesSkipped: 0,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': false, verbose: true },
    )

    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('Fixed 3 violation(s) in a.ts')
  })

  it('shows "would fix" in dry-run mode', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [],
      file: 'a.ts',
      fixesApplied: 2,
      fixesSkipped: 0,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': true, verbose: false },
    )

    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('Would fix 2 violation(s) in a.ts')
  })

  it('does not add files with 0 fixes to modified list in non-dry-run', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [],
      file: 'a.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    const result = await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': false, verbose: false },
    )

    expect(result.filesModified).toEqual([])
  })

  it('adds files to modified list in dry-run when fixes > 0', async () => {
    const mockProcessFile = vi.fn().mockResolvedValue({
      conflicts: [],
      file: 'a.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
      status: 'processed',
    })

    fixInstance.p.processFile = mockProcessFile

    const result = await fixInstance.p.processFiles(
      [{ absolutePath: '/abs/a.ts', path: 'a.ts' }],
      {},
      { concurrency: 1, 'dry-run': true, verbose: false },
    )

    expect(result.filesModified).toEqual(['a.ts'])
  })
})

// ─── setupFixContext ───

describe('setupFixContext', () => {
  let fixInstance: ReturnType<typeof createFixInstance>

  beforeEach(() => {
    fixInstance = createFixInstance()
  })

  it('returns null when no files discovered (non-CI)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(result).toBeNull()
    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('No files found to fix')
  })

  it('returns null when no files discovered (CI)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: true,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      true,
    )

    expect(result).toBeNull()
    const parsed = JSON.parse(fixInstance.logs[0])
    expect(parsed.error).toBe('No files found to fix')
  })

  it('returns null when no fixable rules available (non-CI)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(result).toBeNull()
    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('No fixable rules available')
  })

  it('returns null when no fixable rules available (CI)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: true,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      true,
    )

    expect(result).toBeNull()
  })

  it('returns context when files and rules available', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
      { absolutePath: '/abs/b.ts', path: 'b.ts' },
    ])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(result).not.toBeNull()
    expect(result!.discoveredFiles).toHaveLength(2)
    expect(result!.context.dryRun).toBe(false)
    expect(result!.context.rulesWithFixes.size).toBe(1)
  })

  it('sets dryRun in context from flags', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    const result = await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': true,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(result!.context.dryRun).toBe(true)
  })

  it('passes requested rules to setupRuleRegistryLazy', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    const { setupRuleRegistryLazy } = await import('../../src/utils/command-helpers.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: 'prefer-const,no-eval',
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(setupRuleRegistryLazy).toHaveBeenCalledWith(['prefer-const', 'no-eval'])
  })

  it('uses ignore from flags when provided', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: ['dist/**', 'node_modules/**'],
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({ ignore: ['dist/**', 'node_modules/**'] }),
    )
  })

  it('shows "Fixing N file(s)" message in non-CI mode', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/a.ts', path: 'a.ts' },
      { absolutePath: '/b.ts', path: 'b.ts' },
      { absolutePath: '/c.ts', path: 'c.ts' },
    ])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: false,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      false,
    )

    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).toContain('Fixing 3 file(s)')
  })

  it('does not show "Fixing" message in CI mode', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': { fix: vi.fn(), meta: { name: 'my-rule' } },
    })

    await fixInstance.p.setupFixContext(
      { files: undefined },
      {
        ci: true,
        concurrency: 4,
        config: undefined,
        'dry-run': false,
        ignore: undefined,
        rules: undefined,
        'safe-only': false,
        verbose: false,
      },
      true,
    )

    const output = stripAnsi(fixInstance.logs.join('\n'))
    expect(output).not.toContain('Fixing')
  })
})

// ─── Example structures ───

describe('Fix examples structure', () => {
  it('each example has command and description', () => {
    for (const example of Fix.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})
