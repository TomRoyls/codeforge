import { describe, expect, it, vi } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'
import type { DiscoveredFile } from '../../src/core/file-discovery.js'
import type { ParseResult } from '../../src/core/parser.js'

import type { ApplyFixesOptions, FixResult } from '../../src/commands/analyze-fix-helpers.js'

// ─── Top-level mocks ───

vi.mock('p-limit', () => {
  return {
    default: () => (fn: () => Promise<unknown>) => fn(),
  }
})

vi.mock('../../src/fix/fixer.js', () => ({
  applyFixesToFile: vi.fn().mockReturnValue({
    changes: [],
    conflicts: [],
    filePath: '',
    fixesApplied: 0,
    fixesSkipped: 0,
  }),
}))

vi.mock('../../src/fix/diff-renderer.js', () => ({
  formatDiffForConsole: vi.fn().mockReturnValue(''),
  renderTextChangesAsDiff: vi.fn().mockReturnValue(''),
}))

vi.mock('../../src/utils/command-helpers.js', () => ({
  applyFixesToFiles: vi.fn().mockResolvedValue({
    fileFixReports: [],
    fixesApplied: 0,
    fixesSkipped: 0,
  }),
}))

vi.mock('../../src/utils/logger.js', () => ({
  logger: { warn: vi.fn() },
}))

// ─── Helpers ───

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'test.ts',
    message: 'test violation',
    range: { start: { column: 1, line: 1 }, end: { column: 5, line: 1 } },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function makeDiscoveredFile(overrides: Partial<DiscoveredFile> = {}): DiscoveredFile {
  return {
    absolutePath: '/abs/test.ts',
    path: 'test.ts',
    ...overrides,
  }
}

function makeApplyFixesOptions(overrides: Partial<ApplyFixesOptions> = {}): ApplyFixesOptions {
  return {
    allViolations: [],
    concurrency: 4,
    discoveredFiles: [],
    dryRun: false,
    parseCache: new Map(),
    parser: {
      parseFile: vi.fn().mockResolvedValue({
        parseTime: 10,
        sourceFile: { saveSync: vi.fn() },
      }),
    } as never,
    rulesWithFixes: new Map(),
    verbose: false,
    ...overrides,
  }
}

// ─── getRulesWithFixes ───

describe('getRulesWithFixes', () => {
  it('returns empty map when registry has no rules', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    expect(result.size).toBe(0)
  })

  it('includes rules that have fix functions', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const fixFn = vi.fn()
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: fixFn,
            meta: { name: 'fixable-rule' },
          },
        },
      ]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    expect(result.size).toBe(1)
    expect(result.has('fixable-rule')).toBe(true)
  })

  it('excludes rules without fix functions', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            meta: { name: 'no-fix-rule' },
          },
        },
      ]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    expect(result.size).toBe(0)
  })

  it('excludes rules where fix is not a function', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: 'not-a-function',
            meta: { name: 'string-fix-rule' },
          },
        },
      ]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    expect(result.size).toBe(0)
  })

  it('sets priority to 10 for all fixable rules', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: vi.fn(),
            meta: { name: 'rule-a' },
          },
        },
        {
          definition: {
            fix: vi.fn(),
            meta: { name: 'rule-b' },
          },
        },
      ]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    for (const entry of result.values()) {
      expect(entry.priority).toBe(10)
    }
    expect(result.size).toBe(2)
  })

  it('wraps the fix function correctly in the returned entry', async () => {
    const { getRulesWithFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )
    const fixFn = vi.fn()
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: fixFn,
            meta: { name: 'wrapped-rule' },
          },
        },
      ]),
    }
    const result = getRulesWithFixes(mockRegistry as never)
    const entry = result.get('wrapped-rule')
    expect(entry).toBeDefined()
    expect(entry!.id).toBe('wrapped-rule')
    expect(typeof entry!.fix).toBe('function')
  })
})

// ─── applyFixes: violation grouping ───

describe('applyFixes: violation grouping', () => {
  it('returns zero fixes when no violations provided', async () => {
    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const result = await applyFixes(makeApplyFixesOptions())
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('returns zero fixes when no discovered files', async () => {
    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation({ filePath: 'test.ts' })]
    const result = await applyFixes(
      makeApplyFixesOptions({ allViolations: violations }),
    )
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('returns zero fixes when violations do not match any file', async () => {
    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation({ filePath: 'other.ts' })]
    const files = [makeDiscoveredFile({ path: 'test.ts', absolutePath: '/abs/test.ts' })]
    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: violations,
        discoveredFiles: files,
      }),
    )
    expect(result.fixesApplied).toBe(0)
  })

  it('groups multiple violations by file path', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [],
      conflicts: [],
      filePath: 'test.ts',
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [
      makeViolation({ filePath: 'test.ts', ruleId: 'r1' }),
      makeViolation({ filePath: 'test.ts', ruleId: 'r2' }),
    ]
    const files = [makeDiscoveredFile()]
    const parseResult = {
      parseTime: 10,
      sourceFile: { saveSync: vi.fn() },
    }

    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: violations,
        discoveredFiles: files,
        parseCache: new Map([['/abs/test.ts', parseResult as unknown as ParseResult]]),
      }),
    )
    expect(result.fixesApplied).toBe(2)
  })
})

// ─── applyFixes: dry-run behavior ───

describe('applyFixes: dry-run behavior', () => {
  it('includes fileFixReports in dry-run mode', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 5, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      filePath: 'test.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation()]
    const files = [makeDiscoveredFile()]
    const parseResult = {
      parseTime: 10,
      sourceFile: { saveSync: vi.fn() },
    }

    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: violations,
        discoveredFiles: files,
        dryRun: true,
        parseCache: new Map([['/abs/test.ts', parseResult as unknown as ParseResult]]),
      }),
    )
    expect(result.fileFixReports).toBeDefined()
    expect(result.fileFixReports!.length).toBe(1)
  })

  it('does not include fileFixReports when not dry-run', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 5, newText: 'const', oldText: 'let', start: 0 }],
      conflicts: [],
      filePath: 'test.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation()]
    const files = [makeDiscoveredFile()]
    const parseResult = {
      parseTime: 10,
      sourceFile: { saveSync: vi.fn() },
    }

    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: violations,
        discoveredFiles: files,
        dryRun: false,
        parseCache: new Map([['/abs/test.ts', parseResult as unknown as ParseResult]]),
      }),
    )
    expect(result.fileFixReports).toBeUndefined()
  })
})

// ─── applyFixes: error handling ───

describe('applyFixes: error handling', () => {
  it('handles exceptions during fix gracefully', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    vi.mocked(applyFixesToFile).mockImplementation(() => {
      throw new Error('fix exploded')
    })

    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation()]
    const files = [makeDiscoveredFile()]
    const parseResult = {
      parseTime: 10,
      sourceFile: { saveSync: vi.fn() },
    }

    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: violations,
        discoveredFiles: files,
        parseCache: new Map([['/abs/test.ts', parseResult as unknown as ParseResult]]),
      }),
    )
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  it('handles null file entries', async () => {
    const { applyFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const result = await applyFixes(
      makeApplyFixesOptions({
        allViolations: [],
        discoveredFiles: [null as unknown as DiscoveredFile],
      }),
    )
    expect(result.fixesApplied).toBe(0)
  })
})

// ─── processFixes: early return ───

describe('processFixes: early return', () => {
  it('returns zero fixes when no violations', async () => {
    const { processFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const mockRegistry = { getAllRules: vi.fn().mockReturnValue([]) }
    const mockParser = { parseFile: vi.fn() }

    const result = await processFixes({
      allViolations: [],
      concurrency: 4,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser as never,
      quiet: false,
      registry: mockRegistry as never,
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toBe('')
  })

  it('returns correct dry-run spinner message', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { formatDiffForConsole } = await import('../../src/fix/diff-renderer.js')
    const { applyFixesToFiles } = await import('../../src/utils/command-helpers.js')

    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'x', oldText: 'y', start: 0 }],
      conflicts: [],
      filePath: 'test.ts',
      fixesApplied: 5,
      fixesSkipped: 2,
    })
    vi.mocked(formatDiffForConsole).mockReturnValue('diff output')

    vi.mocked(applyFixesToFiles).mockImplementation(async (opts) => {
      const result = await opts.applyFixesFn({
        allViolations: opts.allViolations,
        concurrency: opts.concurrency,
        discoveredFiles: opts.discoveredFiles,
        dryRun: opts.dryRun,
        parseCache: opts.parseCache,
        parser: opts.parser,
        rulesWithFixes: opts.rulesWithFixes,
        verbose: opts.verbose,
      })
      return {
        fileFixReports: result.fileFixReports,
        fixesApplied: result.fixesApplied,
        fixesSkipped: result.fixesSkipped,
      }
    })

    const { processFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation()]
    const files = [makeDiscoveredFile()]
    const mockSourceFile = { saveSync: vi.fn() }
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: vi.fn(),
            meta: { name: 'test-rule' },
          },
        },
      ]),
    }

    const result = await processFixes({
      allViolations: violations,
      concurrency: 4,
      discoveredFiles: files,
      dryRun: true,
      parseCache: new Map([
        ['/abs/test.ts', { parseTime: 10, sourceFile: mockSourceFile } as unknown as ParseResult],
      ]),
      parser: {
        parseFile: vi.fn().mockResolvedValue({
          parseTime: 10,
          sourceFile: mockSourceFile,
        }),
      } as never,
      quiet: true,
      registry: mockRegistry as never,
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('dry run')
    expect(result.dryRunDiffs.length).toBeGreaterThan(0)
  })

  it('returns correct non-dry-run spinner message', async () => {
    const { applyFixesToFile } = await import('../../src/fix/fixer.js')
    const { applyFixesToFiles } = await import('../../src/utils/command-helpers.js')

    vi.mocked(applyFixesToFile).mockReturnValue({
      changes: [{ end: 3, newText: 'x', oldText: 'y', start: 0 }],
      conflicts: [],
      filePath: 'test.ts',
      fixesApplied: 3,
      fixesSkipped: 1,
    })

    vi.mocked(applyFixesToFiles).mockImplementation(async (opts) => {
      const result = await opts.applyFixesFn({
        allViolations: opts.allViolations,
        concurrency: opts.concurrency,
        discoveredFiles: opts.discoveredFiles,
        dryRun: opts.dryRun,
        parseCache: opts.parseCache,
        parser: opts.parser,
        rulesWithFixes: opts.rulesWithFixes,
        verbose: opts.verbose,
      })
      return {
        fileFixReports: result.fileFixReports,
        fixesApplied: result.fixesApplied,
        fixesSkipped: result.fixesSkipped,
      }
    })

    const { processFixes } = await import(
      '../../src/commands/analyze-fix-helpers.js'
    )

    const violations = [makeViolation()]
    const files = [makeDiscoveredFile()]
    const mockSourceFile = { saveSync: vi.fn() }
    const mockRegistry = {
      getAllRules: vi.fn().mockReturnValue([
        {
          definition: {
            fix: vi.fn(),
            meta: { name: 'test-rule' },
          },
        },
      ]),
    }

    const result = await processFixes({
      allViolations: violations,
      concurrency: 4,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map([
        ['/abs/test.ts', { parseTime: 10, sourceFile: mockSourceFile } as unknown as ParseResult],
      ]),
      parser: {
        parseFile: vi.fn().mockResolvedValue({
          parseTime: 10,
          sourceFile: mockSourceFile,
        }),
      } as never,
      quiet: true,
      registry: mockRegistry as never,
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('Applied')
    expect(result.spinnerMessage).not.toContain('dry run')
    expect(result.dryRunDiffs).toEqual([])
  })
})

// ─── FixResult type shape ───

describe('FixResult type shape', () => {
  it('has required fields', () => {
    const result: FixResult = {
      fixesApplied: 0,
      fixesSkipped: 0,
    }
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.fileFixReports).toBeUndefined()
  })

  it('accepts fileFixReports', () => {
    const result: FixResult = {
      fileFixReports: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    }
    expect(result.fileFixReports).toEqual([])
  })
})

// ─── ApplyFixesOptions type shape ───

describe('ApplyFixesOptions type shape', () => {
  it('has all required fields', () => {
    const opts: ApplyFixesOptions = makeApplyFixesOptions()
    expect(Array.isArray(opts.allViolations)).toBe(true)
    expect(typeof opts.concurrency).toBe('number')
    expect(Array.isArray(opts.discoveredFiles)).toBe(true)
    expect(typeof opts.dryRun).toBe('boolean')
    expect(opts.parseCache).toBeInstanceOf(Map)
    expect(typeof opts.verbose).toBe('boolean')
  })
})
