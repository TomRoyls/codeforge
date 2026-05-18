import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FileFixResult, FixFlags } from '../../src/commands/fix-helpers.js'

// ─── Top-level mocks ───

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
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
    runRulesBatched: vi.fn().mockReturnValue([]),
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

vi.mock('../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

// ─── Helpers ───

function makeFixFlags(overrides: Partial<FixFlags> = {}): FixFlags {
  return {
    ci: false,
    concurrency: 4,
    config: undefined,
    'dry-run': false,
    ignore: undefined,
    rules: undefined,
    'safe-only': false,
    verbose: false,
    ...overrides,
  }
}

function makeFileFixResult(overrides: Partial<FileFixResult> = {}): FileFixResult {
  return {
    conflicts: [],
    file: 'test.ts',
    fixesApplied: 0,
    fixesSkipped: 0,
    status: 'unchanged',
    ...overrides,
  }
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

// ─── processFile ───

describe('processFile', () => {
  beforeEach(async () => {
    const { writeFile } = await import('node:fs/promises')
    vi.mocked(writeFile).mockClear()
  })

  it('returns unchanged when sourceFile is null', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: null })

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRulesBatched: vi.fn() } as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
    expect(result.file).toBe('test.ts')
  })

  it('returns unchanged when no violations found', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: {} })

    const registry = { runRulesBatched: vi.fn().mockReturnValue([]) }

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: registry as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
    expect(registry.runRulesBatched).toHaveBeenCalledWith({}, 50)
  })

  it('returns processed when fixes are applied', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const registry = { runRulesBatched: vi.fn().mockReturnValue([{ ruleId: 'r' }]) }

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: registry as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(2)
    expect(result.conflicts).toEqual([])
  })

  it('returns error when exception is thrown', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue(new Error('Parse failed'))

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRulesBatched: vi.fn() } as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('Parse failed')
    expect(result.fixesApplied).toBe(0)
  })

  it('handles non-Error thrown values', async () => {
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const parser = new Parser()
    parser.parseFile = vi.fn().mockRejectedValue('string error')

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: { runRulesBatched: vi.fn() } as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('string error')
  })

  it('returns conflict data from fix report', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('code') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      fixesApplied: 1,
      fixesSkipped: 1,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const registry = { runRulesBatched: vi.fn().mockReturnValue([{ ruleId: 'r' }]) }

    const result = await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: false,
        parser,
        registry: registry as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(result.conflicts).toEqual([{ conflictingRule: 'rule-b', ruleId: 'rule-a' }])
    expect(result.fixesSkipped).toBe(1)
  })

  it('does not write file in dry-run mode even when fixes applied', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { writeFile } = await import('node:fs/promises')
    const { Parser } = await import('../../src/core/parser.js')
    const { processFile } = await import('../../src/commands/fix-helpers.js')

    const mockSourceFile = { getFullText: vi.fn().mockReturnValue('fixed') }
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 5, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const parser = new Parser()
    parser.parseFile = vi.fn().mockResolvedValue({ sourceFile: mockSourceFile })

    const registry = { runRulesBatched: vi.fn().mockReturnValue([{ ruleId: 'r' }]) }

    await processFile(
      { absolutePath: '/abs/test.ts', path: 'test.ts' },
      {
        dryRun: true,
        parser,
        registry: registry as never,
        rulesWithFixes: new Map(),
      },
    )

    expect(writeFile).not.toHaveBeenCalled()
  })
})

// ─── setupFixContext ───

describe('setupFixContext', () => {
  it('returns null result with CI JSON when no files discovered', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    const { result, statusMessages } = await setupFixContext(
      { files: undefined },
      makeFixFlags(),
      true,
    )

    expect(result).toBeNull()
    expect(statusMessages.length).toBe(1)
    const parsed = JSON.parse(statusMessages[0])
    expect(parsed.error).toBe('No files found to fix')
  })

  it('returns null result with human-readable message when no files in non-CI mode', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    const { result, statusMessages } = await setupFixContext(
      { files: undefined },
      makeFixFlags(),
      false,
    )

    expect(result).toBeNull()
    expect(stripAnsi(statusMessages[0])).toContain('No files found to fix')
  })

  it('returns null when no fixable rules available (CI mode)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])

    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    const { result, statusMessages } = await setupFixContext(
      { files: undefined },
      makeFixFlags(),
      true,
    )

    expect(result).toBeNull()
    const parsed = JSON.parse(statusMessages[0])
    expect(parsed.error).toBe('No fixable rules available')
  })

  it('returns null when no fixable rules available (non-CI mode)', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])

    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    const { result, statusMessages } = await setupFixContext(
      { files: undefined },
      makeFixFlags(),
      false,
    )

    expect(result).toBeNull()
    expect(stripAnsi(statusMessages[1])).toContain('No fixable rules available')
  })

  it('returns context with discovered files when rules available', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])

    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'some-rule': {
        fix: vi.fn(),
        meta: { name: 'some-rule' },
      },
    })

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    const { result, statusMessages } = await setupFixContext(
      { files: undefined },
      makeFixFlags(),
      false,
    )

    expect(result).not.toBeNull()
    expect(result!.discoveredFiles).toHaveLength(1)
    expect(result!.context.dryRun).toBe(false)
    expect(result!.context.rulesWithFixes.size).toBe(1)
    expect(stripAnsi(statusMessages[0])).toContain('Fixing')
  })

  it('parses comma-separated rules from flags', async () => {
    const { resolvePatterns } = await import('../../src/utils/command-helpers.js')
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([{ absolutePath: '/a.ts', path: 'a.ts' }])

    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'some-rule': { fix: vi.fn(), meta: { name: 'some-rule' } },
    })

    const { setupFixContext } = await import('../../src/commands/fix-helpers.js')

    await setupFixContext(
      { files: undefined },
      makeFixFlags({ rules: 'rule-a, rule-b' }),
      false,
    )

    expect(resolvePatterns).toHaveBeenCalled()
  })
})

// ─── getRulesWithFixes ───

describe('getRulesWithFixes', () => {
  beforeEach(async () => {
    const loader = await import('../../src/rules/lazy-loader.js')
    vi.mocked(loader.lazyRuleLoader.loadAllRules).mockReset()
  })

  it('returns empty map when no rules have fix functions', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-fix-rule': { meta: { name: 'no-fix-rule' } },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(false)
    expect(result.size).toBe(0)
  })

  it('includes rules with fix functions', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fixable-rule': {
        fix: vi.fn(),
        meta: { fixable: true, name: 'fixable-rule' },
      },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(false)
    expect(result.size).toBe(1)
    expect(result.has('fixable-rule')).toBe(true)
  })

  it('excludes non-fixable rules when safeOnly is true', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'unsafe-rule': {
        fix: vi.fn(),
        meta: { fixable: false, name: 'unsafe-rule' },
      },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(true)
    expect(result.size).toBe(0)
  })

  it('includes fixable rules when safeOnly is true', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'safe-rule': {
        fix: vi.fn(),
        meta: { fixable: true, name: 'safe-rule' },
      },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(true)
    expect(result.size).toBe(1)
    expect(result.has('safe-rule')).toBe(true)
  })

  it('sets priority to 10 for all rules', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'some-rule': {
        fix: vi.fn(),
        meta: { name: 'some-rule' },
      },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(false)
    const entry = result.get('some-rule')
    expect(entry?.priority).toBe(10)
  })

  it('handles mixed rules with some having no meta', async () => {
    const { lazyRuleLoader } = await import('../../src/rules/lazy-loader.js')
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-with-meta': {
        fix: vi.fn(),
        meta: { fixable: true, name: 'rule-with-meta' },
      },
      'rule-no-meta': {
        fix: vi.fn(),
      },
    })

    const { getRulesWithFixes } = await import('../../src/commands/fix-helpers.js')
    const result = await getRulesWithFixes(true)
    expect(result.has('rule-with-meta')).toBe(true)
    expect(result.has('rule-no-meta')).toBe(false)
  })
})

// ─── Re-exports from fix-format-helpers ───

describe('re-exports from fix-format-helpers', () => {
  it('exports aggregateResults', async () => {
    const mod = await import('../../src/commands/fix-helpers.js')
    expect(typeof mod.aggregateResults).toBe('function')
  })

  it('exports outputFixResults', async () => {
    const mod = await import('../../src/commands/fix-helpers.js')
    expect(typeof mod.outputFixResults).toBe('function')
  })

  it('exports printSummary', async () => {
    const mod = await import('../../src/commands/fix-helpers.js')
    expect(typeof mod.printSummary).toBe('function')
  })
})

// ─── FileFixResult type shape ───

describe('FileFixResult interface shape', () => {
  it('has all required fields', () => {
    const result: FileFixResult = makeFileFixResult()
    expect(result).toHaveProperty('conflicts')
    expect(result).toHaveProperty('file')
    expect(result).toHaveProperty('fixesApplied')
    expect(result).toHaveProperty('fixesSkipped')
    expect(result).toHaveProperty('status')
  })

  it('accepts error status with error message', () => {
    const result: FileFixResult = makeFileFixResult({
      error: 'something went wrong',
      status: 'error',
    })
    expect(result.status).toBe('error')
    expect(result.error).toBe('something went wrong')
  })

  it('accepts conflict entries', () => {
    const result: FileFixResult = makeFileFixResult({
      conflicts: [{ conflictingRule: 'rule-b', ruleId: 'rule-a' }],
      status: 'processed',
    })
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0].ruleId).toBe('rule-a')
    expect(result.conflicts[0].conflictingRule).toBe('rule-b')
  })
})

// ─── FixFlags type shape ───

describe('FixFlags interface shape', () => {
  it('has all required fields with defaults', () => {
    const flags: FixFlags = makeFixFlags()
    expect(flags.ci).toBe(false)
    expect(flags.concurrency).toBe(4)
    expect(flags.config).toBeUndefined()
    expect(flags['dry-run']).toBe(false)
    expect(flags.rules).toBeUndefined()
    expect(flags['safe-only']).toBe(false)
    expect(flags.verbose).toBe(false)
  })

  it('accepts ignore array', () => {
    const flags: FixFlags = makeFixFlags({ ignore: ['node_modules/**', 'dist/**'] })
    expect(flags.ignore).toEqual(['node_modules/**', 'dist/**'])
  })

  it('accepts rules string', () => {
    const flags: FixFlags = makeFixFlags({ rules: 'prefer-const,no-eval' })
    expect(flags.rules).toBe('prefer-const,no-eval')
  })
})
