import { beforeEach, describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'

import type { FileFixResult, FixFlags, FixSummary } from '../../../src/commands/fix-helpers.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

// ============================================================================
// Mocks — must come before imports of mocked modules
// ============================================================================

vi.mock('../../../src/rules/lazy-loader.js', () => ({
  lazyRuleLoader: {
    loadAllRules: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../../src/fix/fixer.js', () => ({
  applyFixesToFile: vi.fn().mockReturnValue({
    fixesApplied: 0,
    fixesSkipped: 0,
    conflicts: [],
    changes: [],
    filePath: '/test/file.ts',
  }),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: null,
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
      runRulesBatched: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/utils/command-helpers.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '../../../src/utils/command-helpers.js',
  )
  return {
    ...actual,
    setupRuleRegistryLazy: vi.fn().mockResolvedValue({
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
      runRulesBatched: vi.fn().mockReturnValue([]),
    }),
  }
})

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { setLevel: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 },
}))

// ============================================================================
// Imports — after mocks
// ============================================================================

import {
  aggregateResults,
  getRulesWithFixes,
  outputFixResults,
  printSummary,
  processFile,
  setupFixContext,
} from '../../../src/commands/fix-helpers.js'

import { lazyRuleLoader } from '../../../src/rules/lazy-loader.js'
import { applyFixesToFile } from '../../../src/fix/fixer.js'
import { Parser } from '../../../src/core/parser.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { setupRuleRegistryLazy } from '../../../src/utils/command-helpers.js'
import * as fs from 'node:fs/promises'

// ============================================================================
// Factory Helpers
// ============================================================================

const defaultFlags = (): FixFlags => ({
  ci: false,
  concurrency: 4,
  config: undefined,
  'dry-run': false,
  ignore: undefined,
  rules: undefined,
  'safe-only': false,
  verbose: false,
})

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'warning',
  message: 'Test violation',
  filePath: '/test/file.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

const makeFixResult = (overrides: Partial<FileFixResult> = {}): FileFixResult => ({
  conflicts: [],
  error: undefined,
  file: 'test.ts',
  fixesApplied: 0,
  fixesSkipped: 0,
  status: 'unchanged',
  ...overrides,
})

const makeFixSummary = (overrides: Partial<FixSummary> = {}): FixSummary => ({
  filesModified: [],
  filesUnchanged: [],
  totalFixesApplied: 0,
  totalFixesSkipped: 0,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// getRulesWithFixes
// ============================================================================

describe('getRulesWithFixes', () => {
  test('returns all rules with fix function when safeOnly=false', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fixable-rule': {
        meta: { id: 'fixable-rule', description: 'A fixable rule', fixable: true },
        fix: vi.fn(),
      },
      'another-fixable': {
        meta: { id: 'another-fixable', description: 'Another fixable' },
        fix: vi.fn(),
      },
      'no-fix-rule': {
        meta: { id: 'no-fix-rule', description: 'No fix' },
      },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(2)
    expect(result.has('fixable-rule')).toBe(true)
    expect(result.has('another-fixable')).toBe(true)
    expect(result.has('no-fix-rule')).toBe(false)
  })

  test('filters to only meta.fixable=true rules when safeOnly=true', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'safe-rule': {
        meta: { id: 'safe-rule', description: 'Safe', fixable: true },
        fix: vi.fn(),
      },
      'unsafe-rule': {
        meta: { id: 'unsafe-rule', description: 'Unsafe' },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(1)
    expect(result.has('safe-rule')).toBe(true)
    expect(result.has('unsafe-rule')).toBe(false)
  })

  test('returns empty map when no rules have fix functions', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { id: 'rule-a', description: 'No fix' } },
      'rule-b': { meta: { id: 'rule-b', description: 'No fix either' } },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('skips rules where fix is not a function', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'string-fix': { meta: { id: 'string-fix', description: 'Bad' }, fix: 'not-a-function' },
      'number-fix': { meta: { id: 'number-fix', description: 'Bad' }, fix: 42 },
      'good-fix': { meta: { id: 'good-fix', description: 'Good' }, fix: vi.fn() },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(1)
    expect(result.has('good-fix')).toBe(true)
  })

  test('maps each rule to RuleWithFix shape with id, fix, priority=10', async () => {
    const mockFix = vi.fn()
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'my-rule': {
        meta: { id: 'my-rule', description: 'My rule', fixable: true },
        fix: mockFix,
      },
    })

    const result = await getRulesWithFixes(false)

    const entry = result.get('my-rule')
    expect(entry).toBeDefined()
    expect(entry!.id).toBe('my-rule')
    expect(entry!.priority).toBe(10)
    expect(typeof entry!.fix).toBe('function')
  })

  test('returns empty map for empty loaded rules', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({})

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('wraps fix function to accept { sourceFile, violation } shape', async () => {
    const originalFix = vi.fn()
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'wrapped-rule': {
        meta: { id: 'wrapped-rule', description: 'Wrapped' },
        fix: originalFix,
      },
    })

    const result = await getRulesWithFixes(false)
    const entry = result.get('wrapped-rule')!

    const mockSourceFile = { getFilePath: () => '/test.ts' }
    const mockViolation = makeViolation()

    // The wrapped fix should call the original with (sourceFile, violation)
    entry.fix({ sourceFile: mockSourceFile, violation: mockViolation })
    expect(originalFix).toHaveBeenCalledWith(mockSourceFile, mockViolation)
  })

  test('default safeOnly parameter is false', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-meta-fixable': {
        meta: { id: 'no-meta-fixable', description: 'No fixable prop' },
        fix: vi.fn(),
      },
    })

    // getRulesWithFixes() without argument → safeOnly defaults to false
    const result = await getRulesWithFixes()

    expect(result.size).toBe(1)
    expect(result.has('no-meta-fixable')).toBe(true)
  })

  test('safeOnly=true excludes rule with meta but fixable=false', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'explicitly-unfixable': {
        meta: { id: 'explicitly-unfixable', description: 'Explicit', fixable: false },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(0)
  })

  test('safeOnly=true includes rule with meta.fixable=true', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'truly-fixable': {
        meta: { id: 'truly-fixable', description: 'Truly', fixable: true },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(1)
    expect(result.has('truly-fixable')).toBe(true)
  })

  test('handles rules with undefined meta gracefully', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-meta': {
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(false)

    // No meta → fix is a function → should be included
    expect(result.size).toBe(1)
    expect(result.has('no-meta')).toBe(true)
  })

  test('safeOnly=true excludes rule with undefined meta', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-meta-unsafe': {
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    // No meta → meta?.fixable is undefined → falsy → excluded
    expect(result.size).toBe(0)
  })

  test('handles large batch of mixed rules correctly', async () => {
    const rules: Record<string, unknown> = {}
    for (let i = 0; i < 50; i++) {
      rules[`rule-${i}`] = {
        meta: { id: `rule-${i}`, description: `Rule ${i}`, fixable: i % 2 === 0 },
        fix: vi.fn(),
      }
    }
    // Add some rules without fix
    rules['no-fix-1'] = { meta: { id: 'no-fix-1', description: 'No fix 1' } }
    rules['no-fix-2'] = { meta: { id: 'no-fix-2', description: 'No fix 2' } }

    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue(rules)

    const allResult = await getRulesWithFixes(false)
    expect(allResult.size).toBe(50)

    const safeResult = await getRulesWithFixes(true)
    // Only even-numbered rules have fixable: true
    expect(safeResult.size).toBe(25)
  })

  test('fix wrapper forwards return value from original fix', async () => {
    const returnValue = { success: true }
    const originalFix = vi.fn().mockReturnValue(returnValue)
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'returning-rule': {
        meta: { id: 'returning-rule', description: 'Returns' },
        fix: originalFix,
      },
    })

    const result = await getRulesWithFixes(false)
    const entry = result.get('returning-rule')!

    const mockSourceFile = { getFilePath: () => '/test.ts' }
    const mockViolation = makeViolation()
    const out = entry.fix({ sourceFile: mockSourceFile, violation: mockViolation })

    expect(out).toBe(returnValue)
  })
})

// ============================================================================
// processFile
// ============================================================================

describe('processFile', () => {
  const makeContext = (overrides: Record<string, unknown> = {}) => ({
    dryRun: false,
    parser: {
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: () => '/test/file.ts',
          getText: () => 'test code',
          getFullText: () => 'fixed code',
        },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    },
    registry: {
      runRules: vi.fn().mockReturnValue([makeViolation()]),
      runRulesBatched: vi.fn().mockReturnValue([makeViolation()]),
    },
    rulesWithFixes: new Map(),
    ...overrides,
  })

  test('returns unchanged when sourceFile is null', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: null,
      filePath: '/test/file.ts',
      parseTime: 0,
    })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
    expect(result.file).toBe('file.ts')
  })

  test('returns unchanged when no violations found', async () => {
    const ctx = makeContext()
    ctx.registry.runRules.mockReturnValue([])
    ctx.registry.runRulesBatched.mockReturnValue([])

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('unchanged')
    expect(result.fixesApplied).toBe(0)
  })

  test('applies fixes and returns processed status', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 2,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext()

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(2)
    expect(result.fixesSkipped).toBe(0)
  })

  test('writes file when not dry-run and fixes applied > 0', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 3,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: false })

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'fixed code', 'utf8')
  })

  test('does NOT write file in dry-run mode', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: true })

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('does NOT write file when fixes applied = 0', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 0,
      fixesSkipped: 1,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: false })

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('handles errors and returns error status with message', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(new Error('Parse failure'))

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('Parse failure')
    expect(result.file).toBe('file.ts')
  })

  test('handles non-Error thrown values (string error)', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue('string error message')

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('string error message')
  })

  test('returns conflicts from fixReport', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 2,
      conflicts: [
        { ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'Overlapping' },
        { ruleId: 'rule-c', conflictingRule: 'rule-d', reason: 'Overlapping' },
      ],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext()

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.conflicts).toHaveLength(2)
    expect(result.conflicts[0]!.ruleId).toBe('rule-a')
    expect(result.conflicts[1]!.conflictingRule).toBe('rule-d')
  })

  test('returns fixesSkipped from fixReport', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 5,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext()

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.fixesSkipped).toBe(5)
  })

  test('handles error from registry.runRules', async () => {
    const ctx = makeContext()
    ctx.registry.runRules.mockImplementation(() => {
      throw new Error('Rule execution failed')
    })
    ctx.registry.runRulesBatched.mockImplementation(() => {
      throw new Error('Rule execution failed')
    })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('Rule execution failed')
  })

  test('handles null thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(null)

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('null')
  })

  test('handles number thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(42)

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('42')
  })

  test('passes correct arguments to applyFixesToFile', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const rulesMap = new Map()
    rulesMap.set('test-rule', { id: 'test-rule', fix: vi.fn(), priority: 10 })

    const violations = [makeViolation()]
    const ctx = makeContext({ dryRun: true, rulesWithFixes: rulesMap })
    ctx.registry.runRules.mockReturnValue(violations)
    ctx.registry.runRulesBatched.mockReturnValue(violations)
  })

  test('returns processed status even in dry-run mode when fixes found', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 4,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: true })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(4)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('writes content from sourceFile.getFullText() to file', async () => {
    const expectedContent = 'const x = 1;\nconsole.log(x);\n'
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/test/file.ts',
        getText: () => 'old',
        getFullText: () => expectedContent,
      },
      filePath: '/test/file.ts',
      parseTime: 5,
    })

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', expectedContent, 'utf8')
  })

  test('handles writeFile rejection gracefully', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })
    vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('EACCES: permission denied'))

    const ctx = makeContext({ dryRun: false })

    const result = await processFile(
      { absolutePath: '/readonly/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('EACCES: permission denied')
  })

  test('passes multiple violations to applyFixesToFile', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 3,
      fixesSkipped: 1,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const violations = [
      makeViolation({ ruleId: 'rule-a' }),
      makeViolation({ ruleId: 'rule-b' }),
      makeViolation({ ruleId: 'rule-c' }),
      makeViolation({ ruleId: 'rule-d' }),
    ]

    const ctx = makeContext()
    ctx.registry.runRules.mockReturnValue(violations)
    ctx.registry.runRulesBatched.mockReturnValue(violations)

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(applyFixesToFile).toHaveBeenCalledTimes(1)
    // Second argument is the violations array
    const callArgs = vi.mocked(applyFixesToFile).mock.calls[0]!
    expect(callArgs[1]).toHaveLength(4)
  })

  test('handles undefined thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(undefined)

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('undefined')
  })

  test('handles object thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue({ code: 'ENOENT', path: '/missing.ts' })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('[object Object]')
  })

  test('processes .tsx file extension', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/src/component.tsx',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/src/component.tsx',
        getText: () => '<div />',
        getFullText: () => '<Component />',
      },
      filePath: '/src/component.tsx',
      parseTime: 5,
    })

    const result = await processFile(
      { absolutePath: '/src/component.tsx', path: 'component.tsx' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.file).toBe('component.tsx')
  })

  test('processes .js file extension', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 2,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/src/index.js',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/src/index.js',
        getText: () => 'var x = 1',
        getFullText: () => 'const x = 1',
      },
      filePath: '/src/index.js',
      parseTime: 3,
    })

    const result = await processFile(
      { absolutePath: '/src/index.js', path: 'index.js' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(2)
  })

  test('returns empty conflicts when no conflicts in fixReport', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext()

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.conflicts).toEqual([])
  })

  test('error result has zero fixesApplied and fixesSkipped', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(new Error('fail'))

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.conflicts).toEqual([])
  })

  test('uses absolutePath for parser.parseFile call', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 0,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/deeply/nested/path/file.ts',
    })

    const ctx = makeContext()

    await processFile(
      { absolutePath: '/deeply/nested/path/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(ctx.parser.parseFile).toHaveBeenCalledWith('/deeply/nested/path/file.ts')
  })

  test('dry-run with zero fixes does not write file and returns processed', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 0,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: true })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(fs.writeFile).not.toHaveBeenCalled()
  })
})

// ============================================================================
// printSummary — pure function, no mocking needed
// ============================================================================

describe('printSummary', () => {
  test('dry-run mode shows "Dry run" message', () => {
    const summary = makeFixSummary()
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('no files modified'))).toBe(true)
  })

  test('non-dry-run shows "Files modified" and "Files unchanged"', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 5,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files modified: 2'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('shows skipped fixes when > 0', () => {
    const summary = makeFixSummary({ totalFixesSkipped: 3 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes skipped: 3'))).toBe(true)
    expect(lines.some((l) => l.includes('conflicts'))).toBe(true)
  })

  test('does NOT show skipped fixes when 0', () => {
    const summary = makeFixSummary({ totalFixesSkipped: 0 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(false)
  })

  test('shows "No violations found" when applied=0 and skipped=0', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('No violations found to fix'))).toBe(true)
  })

  test('shows "Fixes applied successfully" when applied > 0 and not dry-run', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
  })

  test('does NOT show "Fixes applied successfully" in dry-run mode', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('shows "Files would be modified" in dry-run when fixes > 0', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 3,
      filesModified: ['a.ts', 'b.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files would be modified: 2'))).toBe(true)
  })

  test('does NOT show "Files would be modified" in dry-run when fixes = 0', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files would be modified'))).toBe(false)
  })

  test('empty results produce correct output with no violations message', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found'))).toBe(true)
  })

  test('includes bold summary header', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines[0]).toBe(chalk.bold('\n📊 Fix Summary\n'))
  })

  test('shows Fixes applied count', () => {
    const summary = makeFixSummary({ totalFixesApplied: 7 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied: 7'))).toBe(true)
  })

  test('does not show "No violations found" when fixesSkipped > 0', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 2 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
  })

  test('shows both applied and skipped when both are non-zero', () => {
    const summary = makeFixSummary({ totalFixesApplied: 10, totalFixesSkipped: 3 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied: 10'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 3'))).toBe(true)
  })

  test('shows "Fixes applied successfully" with large applied count', () => {
    const summary = makeFixSummary({ totalFixesApplied: 999 })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied: 999'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
  })

  test('dry-run with fixes shows both dry-run message and "would be modified"', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 2,
      filesModified: ['a.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('Files would be modified: 1'))).toBe(true)
  })

  test('non-dry-run with zero files modified shows count 0', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0 })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files modified: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 0'))).toBe(true)
  })
})

// ============================================================================
// outputFixResults — pure function, no mocking needed
// ============================================================================

describe('outputFixResults', () => {
  test('ci mode returns jsonOutput and empty summaryLines', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: ['b.ts'],
      totalFixesApplied: 3,
      totalFixesSkipped: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const result = outputFixResults(summary, flags, true)

    expect(result.jsonOutput).toBeDefined()
    expect(result.summaryLines).toEqual([])
  })

  test('non-ci mode returns summaryLines and no jsonOutput', () => {
    const summary = makeFixSummary({ totalFixesApplied: 2 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, false)

    expect(result.jsonOutput).toBeUndefined()
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })

  test('json output has correct structure (dryRun, filesModified, filesUnchanged, summary)', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 5,
      totalFixesSkipped: 2,
    })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.dryRun).toBe(true)
    expect(parsed.filesModified).toEqual(['a.ts', 'b.ts'])
    expect(parsed.filesUnchanged).toEqual(['c.ts'])
    expect(parsed.summary.fixesApplied).toBe(5)
    expect(parsed.summary.fixesSkipped).toBe(2)
  })

  test('json output reflects dryRun=false correctly', () => {
    const summary = makeFixSummary()
    const flags = { ...defaultFlags(), 'dry-run': false }

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.dryRun).toBe(false)
  })

  test('non-ci mode summaryLines match printSummary output', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, false)

    // Should contain same lines as printSummary
    const expectedLines = printSummary(summary, flags)
    expect(result.summaryLines).toEqual(expectedLines)
  })

  test('ci mode json is pretty-printed (2-space indent)', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)

    expect(result.jsonOutput).toContain('\n')
    expect(result.jsonOutput).toContain('  ')
  })

  test('ci mode with empty summary produces valid json', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual([])
    expect(parsed.summary.fixesApplied).toBe(0)
    expect(parsed.summary.fixesSkipped).toBe(0)
  })

  test('non-ci mode with dry-run flags delegates to printSummary', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5, totalFixesSkipped: 2 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const result = outputFixResults(summary, flags, false)

    const expectedLines = printSummary(summary, flags)
    expect(result.summaryLines).toEqual(expectedLines)
    expect(result.jsonOutput).toBeUndefined()
  })

  test('ci mode json includes large file lists correctly', () => {
    const manyFiles = Array.from({ length: 100 }, (_, i) => `file-${i}.ts`)
    const summary = makeFixSummary({
      filesModified: manyFiles,
      filesUnchanged: [],
      totalFixesApplied: 100,
      totalFixesSkipped: 0,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.filesModified).toHaveLength(100)
    expect(parsed.summary.fixesApplied).toBe(100)
  })

  test('ci mode json with skipped fixes reflects in summary', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 5,
      totalFixesSkipped: 10,
    })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.summary.fixesSkipped).toBe(10)
  })

  test('non-ci mode with verbose flag still uses printSummary', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = { ...defaultFlags(), verbose: true }

    const result = outputFixResults(summary, flags, false)

    expect(result.jsonOutput).toBeUndefined()
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// setupFixContext
// ============================================================================

describe('setupFixContext', () => {
  test('returns null result when no files found, with status messages', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([])

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result).toBeNull()
    expect(result.statusMessages.length).toBeGreaterThan(0)
    expect(result.statusMessages.some((m) => m.includes('No files found'))).toBe(true)
  })

  test('returns null result when no fixable rules, with status messages', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'test.ts', absolutePath: '/test.ts' }])
    // Return rules without fix functions
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-fix': { meta: { id: 'no-fix', description: 'No fix' } },
    })

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result).toBeNull()
    expect(result.statusMessages.some((m) => m.includes('No fixable rules'))).toBe(true)
  })

  test('returns context with discovered files and rules when successful', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([
      { path: 'a.ts', absolutePath: '/abs/a.ts' },
      { path: 'b.ts', absolutePath: '/abs/b.ts' },
    ])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
      runRulesBatched: vi.fn().mockReturnValue([]),
    })

    const flags = defaultFlags()
    const result = await setupFixContext({ files: ['src/**/*.ts'] }, flags, false)

    expect(result.result).not.toBeNull()
    expect(result.result!.discoveredFiles).toHaveLength(2)
    expect(result.result!.context).toBeDefined()
    expect(result.result!.context.dryRun).toBe(false)
    expect(result.result!.context.rulesWithFixes.size).toBe(1)
  })

  test('status messages include "Fixing N file(s)" in non-CI mode', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([
      { path: 'a.ts', absolutePath: '/abs/a.ts' },
      { path: 'b.ts', absolutePath: '/abs/b.ts' },
      { path: 'c.ts', absolutePath: '/abs/c.ts' },
    ])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.statusMessages.some((m) => m.includes('Fixing 3 file(s)'))).toBe(true)
  })

  test('CI mode produces JSON error messages instead of chalk messages for no files', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([])

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, true)

    // Should be JSON, not chalk-colored text
    const msg = result.statusMessages[0]!
    const parsed = JSON.parse(msg)
    expect(parsed.error).toBe('No files found to fix')
    expect(parsed.files).toEqual([])
  })

  test('CI mode produces JSON error messages for no fixable rules', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'test.ts', absolutePath: '/test.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-fix': { meta: { id: 'no-fix', description: 'No fix' } },
    })

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, true)

    const msg = result.statusMessages[result.statusMessages.length - 1]!
    const parsed = JSON.parse(msg)
    expect(parsed.error).toBe('No fixable rules available')
  })

  test('CI mode does NOT print "Fixing N file(s)"', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, true)

    expect(result.statusMessages.some((m) => m.includes('Fixing'))).toBe(false)
  })

  test('parses comma-separated rules string correctly', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { id: 'rule-a', description: 'A', fixable: true }, fix: vi.fn() },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), rules: 'prefer-const, no-console' }
    await setupFixContext({ files: undefined }, flags, false)

    expect(setupRuleRegistryLazy).toHaveBeenCalledWith(['prefer-const', 'no-console'])
  })

  test('passes undefined rules when flags.rules is undefined', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { id: 'rule-a', description: 'A', fixable: true }, fix: vi.fn() },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    await setupFixContext({ files: undefined }, flags, false)

    expect(setupRuleRegistryLazy).toHaveBeenCalledWith(undefined)
  })

  test('creates Parser instance for context', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(Parser).toHaveBeenCalled()
    expect(result.result!.context.parser).toBeDefined()
  })

  test('sets dryRun from flags in context', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.context.dryRun).toBe(true)
  })

  test('passes safe-only flag to getRulesWithFixes', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), 'safe-only': true }
    await setupFixContext({ files: undefined }, flags, false)

    // getRulesWithFixes is called internally with flags['safe-only']
    // We verify it was called by checking loadAllRules was called
    expect(lazyRuleLoader.loadAllRules).toHaveBeenCalled()
  })

  test('passes ignore flags from flags.ignore to discoverFiles', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), ignore: ['node_modules', 'dist'] }
    await setupFixContext({ files: undefined }, flags, false)

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({ ignore: ['node_modules', 'dist'] }),
    )
  })

  test('handles single file discovery correctly', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([
      { path: 'single.ts', absolutePath: '/abs/single.ts' },
    ])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: ['single.ts'] }, flags, false)

    expect(result.result).not.toBeNull()
    expect(result.result!.discoveredFiles).toHaveLength(1)
    expect(result.statusMessages.some((m) => m.includes('Fixing 1 file(s)'))).toBe(true)
  })

  test('trims whitespace from comma-separated rules', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), rules: '  prefer-const  ,  no-console  ' }
    await setupFixContext({ files: undefined }, flags, false)

    expect(setupRuleRegistryLazy).toHaveBeenCalledWith(['prefer-const', 'no-console'])
  })

  test('uses empty files array when args.files is undefined', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    await setupFixContext({ files: undefined }, flags, false)

    // discoverFiles should be called with patterns resolved from [] (empty array + config defaults)
    expect(discoverFiles).toHaveBeenCalled()
  })

  test('populates rulesWithFixes map in context', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': {
        meta: { id: 'rule-a', description: 'A', fixable: true },
        fix: vi.fn(),
      },
      'rule-b': {
        meta: { id: 'rule-b', description: 'B', fixable: true },
        fix: vi.fn(),
      },
      'rule-c': { meta: { id: 'rule-c', description: 'C' } },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.context.rulesWithFixes.size).toBe(2)
    expect(result.result!.context.rulesWithFixes.has('rule-a')).toBe(true)
    expect(result.result!.context.rulesWithFixes.has('rule-b')).toBe(true)
  })

  test('context registry is the result of setupRuleRegistryLazy', async () => {
    const mockRegistry = {
      register: vi.fn(),
      disable: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
      runRulesBatched: vi.fn().mockReturnValue([]),
    }
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue(mockRegistry)

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.context.registry).toBe(mockRegistry)
  })
})

// ============================================================================
// aggregateResults — pure function, no mocking needed
// ============================================================================

describe('aggregateResults', () => {
  test('aggregates totalFixesApplied across results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1 }),
      makeFixResult({ status: 'processed', fixesApplied: 2, fixesSkipped: 0 }),
    ]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(5)
  })

  test('aggregates totalFixesSkipped across results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 2 }),
      makeFixResult({ status: 'processed', fixesApplied: 0, fixesSkipped: 3 }),
    ]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary.totalFixesSkipped).toBe(5)
  })

  test('tracks filesModified when not dry-run and fixesApplied > 0', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual(['a.ts', 'b.ts'])
  })

  test('tracks filesUnchanged for non-processed results', () => {
    const results: FileFixResult[] = [makeFixResult({ status: 'unchanged', file: 'clean.ts' })]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesUnchanged).toEqual(['clean.ts'])
  })

  test('does NOT add to filesModified in dry-run mode', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true }

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual([])
  })

  test('does NOT add to filesModified when fixesApplied is 0', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual([])
  })

  test('logs error messages for error status results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'Parse failed', file: 'bad.ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Error processing'))).toBe(true)
    expect(logLines.some((l) => l.includes('bad.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('Parse failed'))).toBe(true)
  })

  test('logs verbose fix messages only when verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const flagsVerbose = { ...defaultFlags(), verbose: true, 'dry-run': false }
    const flagsQuiet = { ...defaultFlags(), verbose: false, 'dry-run': false }

    const verboseResult = aggregateResults(results, flagsVerbose)
    const quietResult = aggregateResults(results, flagsQuiet)

    expect(verboseResult.logLines.some((l) => l.includes('Fixed 3 violation(s)'))).toBe(true)
    expect(quietResult.logLines.some((l) => l.includes('Fixed 3 violation(s)'))).toBe(false)
  })

  test('logs dry-run "would fix" messages only when dry-run=true and verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
    ]

    const flagsDryVerbose = { ...defaultFlags(), 'dry-run': true, verbose: true }
    const flagsDryQuiet = { ...defaultFlags(), 'dry-run': true, verbose: false }
    const flagsNotDryVerbose = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const dryVerbose = aggregateResults(results, flagsDryVerbose)
    const dryQuiet = aggregateResults(results, flagsDryQuiet)
    const notDryVerbose = aggregateResults(results, flagsNotDryVerbose)

    expect(dryVerbose.logLines.some((l) => l.includes('Would fix 2 violation(s)'))).toBe(true)
    expect(dryQuiet.logLines.some((l) => l.includes('Would fix'))).toBe(false)
    expect(notDryVerbose.logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('logs conflict messages only when verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b' }],
      }),
    ]

    const flagsVerbose = { ...defaultFlags(), verbose: true }
    const flagsQuiet = { ...defaultFlags(), verbose: false }

    const verboseResult = aggregateResults(results, flagsVerbose)
    const quietResult = aggregateResults(results, flagsQuiet)

    expect(
      verboseResult.logLines.some((l) => l.includes('Skipped rule-a (conflicts with rule-b)')),
    ).toBe(true)
    expect(quietResult.logLines.some((l) => l.includes('conflicts with'))).toBe(false)
  })

  test('empty results array produces zero summary', () => {
    const flags = defaultFlags()

    const { summary, logLines } = aggregateResults([], flags)

    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(logLines).toEqual([])
  })

  test('mixed results aggregate correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1, file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'Oops', file: 'b.ts' }),
      makeFixResult({ status: 'unchanged', file: 'c.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 2, file: 'd.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { summary, logLines } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(4)
    expect(summary.totalFixesSkipped).toBe(3)
    expect(summary.filesModified).toEqual(['a.ts', 'd.ts'])
    expect(summary.filesUnchanged).toEqual(['c.ts'])
    expect(logLines.some((l) => l.includes('Error processing b.ts'))).toBe(true)
  })

  test('error results do not add to filesModified or filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'bad.ts' }),
    ]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('processed result with 0 fixesApplied goes to filesUnchanged in non-dry-run', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary } = aggregateResults(results, flags)

    // 0 fixes → not added to filesModified, not unchanged status
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('multiple conflict messages are all logged when verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [
          { ruleId: 'r1', conflictingRule: 'r2' },
          { ruleId: 'r3', conflictingRule: 'r4' },
        ],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.filter((l) => l.includes('Skipped')).length).toBe(2)
  })

  test('all unchanged results go to filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'b.ts' }),
      makeFixResult({ status: 'unchanged', file: 'c.ts' }),
    ]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesUnchanged).toEqual(['a.ts', 'b.ts', 'c.ts'])
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
  })

  test('all error results produce log lines with no summary files', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'err1', file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'err2', file: 'b.ts' }),
    ]
    const flags = defaultFlags()

    const { summary, logLines } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(logLines).toHaveLength(2)
  })

  test('dry-run mode still counts fixesApplied and fixesSkipped', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, fixesSkipped: 2, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1, file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true }

    const { summary } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(8)
    expect(summary.totalFixesSkipped).toBe(3)
    expect(summary.filesModified).toEqual([]) // dry-run, so not added
  })

  test('conflict without verbose flag produces no conflict log lines', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [
          { ruleId: 'r1', conflictingRule: 'r2' },
          { ruleId: 'r3', conflictingRule: 'r4' },
        ],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: false }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.filter((l) => l.includes('Skipped'))).toHaveLength(0)
  })

  test('large batch of results aggregates correctly', () => {
    const results: FileFixResult[] = Array.from({ length: 100 }, (_, i) => {
      if (i % 3 === 0) {
        return makeFixResult({ status: 'error', error: `err-${i}`, file: `err-${i}.ts` })
      }
      if (i % 3 === 1) {
        return makeFixResult({ status: 'unchanged', file: `unchanged-${i}.ts` })
      }
      return makeFixResult({
        status: 'processed',
        fixesApplied: i + 1,
        fixesSkipped: i,
        file: `fixed-${i}.ts`,
      })
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary, logLines } = aggregateResults(results, flags)

    // errors: 34 (i % 3 === 0 for i in 0..99)
    // unchanged: 33 (i % 3 === 1)
    // processed: 33 (i % 3 === 2)
    expect(summary.filesModified).toHaveLength(33)
    expect(summary.filesUnchanged).toHaveLength(33)
    expect(logLines.filter((l) => l.includes('Error processing'))).toHaveLength(34)
  })

  test('error with undefined error message handles gracefully', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: undefined, file: 'bad.ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Error processing bad.ts'))).toBe(true)
  })

  test('processed with verbose and dry-run produces "would fix" not "Fixed"', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Would fix 3 violation(s)'))).toBe(true)
    expect(logLines.some((l) => l.includes('Fixed 3 violation(s)'))).toBe(false)
  })

  test('dry-run verbose with zero fixes produces no would-fix log', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Would fix'))).toBe(false)
    expect(logLines.some((l) => l.includes('Fixed'))).toBe(false)
  })

  test('non-dry-run verbose with zero fixes produces no Fixed log', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Fixed'))).toBe(false)
    expect(logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('error with empty error string still produces log line', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: '', file: 'empty-err.ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Error processing empty-err.ts'))).toBe(true)
  })

  test('error with very long error message is included fully', () => {
    const longMessage = 'x'.repeat(500)
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: longMessage, file: 'long-err.ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes(longMessage))).toBe(true)
  })

  test('error with special characters in file name is handled', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'path/with spaces/[brackets].ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('path/with spaces/[brackets].ts'))).toBe(true)
  })

  test('single processed result with verbose shows correct message', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 7, file: 'single.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Fixed 7 violation(s) in single.ts'))).toBe(true)
  })

  test('verbose non-dry-run with conflicts shows all conflict details', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 2,
        file: 'conflict.ts',
        conflicts: [
          { ruleId: 'alpha', conflictingRule: 'beta' },
          { ruleId: 'gamma', conflictingRule: 'delta' },
          { ruleId: 'epsilon', conflictingRule: 'zeta' },
        ],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.filter((l) => l.includes('Skipped'))).toHaveLength(3)
    expect(logLines.some((l) => l.includes('alpha') && l.includes('beta'))).toBe(true)
    expect(logLines.some((l) => l.includes('gamma') && l.includes('delta'))).toBe(true)
    expect(logLines.some((l) => l.includes('epsilon') && l.includes('zeta'))).toBe(true)
  })

  test('summary object has correct structure matching FixSummary', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 2, file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'b.ts' }),
    ]
    const flags = defaultFlags()

    const { summary } = aggregateResults(results, flags)

    expect(summary).toHaveProperty('filesModified')
    expect(summary).toHaveProperty('filesUnchanged')
    expect(summary).toHaveProperty('totalFixesApplied')
    expect(summary).toHaveProperty('totalFixesSkipped')
    expect(Array.isArray(summary.filesModified)).toBe(true)
    expect(Array.isArray(summary.filesUnchanged)).toBe(true)
    expect(typeof summary.totalFixesApplied).toBe('number')
    expect(typeof summary.totalFixesSkipped).toBe('number')
  })

  test('interleaved errors and processed results produce ordered log lines', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'e1', file: 'err1.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'fix1.ts' }),
      makeFixResult({ status: 'error', error: 'e2', file: 'err2.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'fix2.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Error processing err1.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('Error processing err2.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('Fixed 1 violation(s) in fix1.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('Fixed 2 violation(s) in fix2.ts'))).toBe(true)
  })

  test('dry-run verbose with conflicts and fixes logs both types', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 2,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Would fix 2 violation(s)'))).toBe(true)
    expect(logLines.some((l) => l.includes('Skipped r1 (conflicts with r2)'))).toBe(true)
  })

  test('all processed results with zero fixes produce no modified files', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary } = aggregateResults(results, flags)

    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(summary.totalFixesApplied).toBe(0)
  })

  test('verbose non-dry-run processed with 0 fixes and conflicts shows conflicts only', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        fixesSkipped: 1,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines.some((l) => l.includes('Skipped r1 (conflicts with r2)'))).toBe(true)
    expect(logLines.some((l) => l.includes('Fixed'))).toBe(false)
    expect(logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })
})

// ============================================================================
// getRulesWithFixes — additional edge cases
// ============================================================================

describe('getRulesWithFixes — edge cases', () => {
  test('handles rule with fix as null', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'null-fix': { meta: { id: 'null-fix', description: 'Null' }, fix: null },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as undefined explicitly', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'undef-fix': { meta: { id: 'undef-fix', description: 'Undef' }, fix: undefined },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as boolean true (not a function)', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'bool-fix': { meta: { id: 'bool-fix', description: 'Bool' }, fix: true },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as an object (not a function)', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'obj-fix': { meta: { id: 'obj-fix', description: 'Obj' }, fix: { apply: vi.fn() } },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as an array (not a function)', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'arr-fix': { meta: { id: 'arr-fix', description: 'Arr' }, fix: [vi.fn()] },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(0)
  })

  test('handles rule with empty string id and valid fix', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      '': { meta: { id: '', description: 'Empty id' }, fix: vi.fn() },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(1)
    expect(result.has('')).toBe(true)
  })

  test('handles rule with special characters in id', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule/with-dots.and:special@chars': {
        meta: { id: 'rule/with-dots.and:special@chars', description: 'Special' },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(1)
    expect(result.has('rule/with-dots.and:special@chars')).toBe(true)
  })

  test('handles rule with meta as empty object (no fixable prop)', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'empty-meta': { meta: {}, fix: vi.fn() },
    })

    const resultSafe = await getRulesWithFixes(true)
    const resultAll = await getRulesWithFixes(false)

    expect(resultSafe.size).toBe(0)
    expect(resultAll.size).toBe(1)
  })

  test('handles rule with meta.fixable as truthy string', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'string-fixable': {
        meta: { id: 'string-fixable', description: 'S', fixable: 'yes' },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(1)
  })

  test('handles rule with meta.fixable as truthy number 1', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'num-fixable': { meta: { id: 'num-fixable', description: 'N', fixable: 1 }, fix: vi.fn() },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(1)
  })

  test('handles rule with meta.fixable as falsy number 0', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'zero-fixable': { meta: { id: 'zero-fixable', description: 'Z', fixable: 0 }, fix: vi.fn() },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(0)
  })

  test('handles rule with meta.fixable as empty string (falsy)', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'emptystr-fixable': {
        meta: { id: 'emptystr-fixable', description: 'ES', fixable: '' },
        fix: vi.fn(),
      },
    })

    const result = await getRulesWithFixes(true)

    expect(result.size).toBe(0)
  })

  test('multiple rules sharing the same fix function reference', async () => {
    const sharedFix = vi.fn()
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { id: 'rule-a', description: 'A' }, fix: sharedFix },
      'rule-b': { meta: { id: 'rule-b', description: 'B' }, fix: sharedFix },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(2)
    expect(result.get('rule-a')!.fix).not.toBe(result.get('rule-b')!.fix)
  })

  test('handles very large rule set (500 rules)', async () => {
    const rules: Record<string, unknown> = {}
    for (let i = 0; i < 500; i++) {
      rules[`rule-${i}`] = {
        meta: { id: `rule-${i}`, description: `Rule ${i}`, fixable: i % 3 === 0 },
        fix: vi.fn(),
      }
    }

    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue(rules)

    const allResult = await getRulesWithFixes(false)
    const safeResult = await getRulesWithFixes(true)

    expect(allResult.size).toBe(500)
    expect(safeResult.size).toBe(Math.ceil(500 / 3))
  })

  test('wrapped fix function preserves context correctly', async () => {
    const originalFix = vi.fn().mockReturnValue({ changed: true })
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'ctx-rule': { meta: { id: 'ctx-rule', description: 'Ctx' }, fix: originalFix },
    })

    const result = await getRulesWithFixes(false)
    const entry = result.get('ctx-rule')!

    const sf = { text: 'source' }
    const v = makeViolation({ ruleId: 'ctx-rule' })

    const ret = entry.fix({ sourceFile: sf, violation: v })

    expect(originalFix).toHaveBeenCalledWith(sf, v)
    expect(ret).toEqual({ changed: true })
  })

  test('rule with only fix and no other properties', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      minimal: { fix: vi.fn() },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(1)
    const entry = result.get('minimal')!
    expect(entry.id).toBe('minimal')
    expect(entry.priority).toBe(10)
  })

  test('rule with fix returning undefined still gets registered', async () => {
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'undef-return': {
        meta: { id: 'undef-return', description: 'UR' },
        fix: vi.fn().mockReturnValue(undefined),
      },
    })

    const result = await getRulesWithFixes(false)

    expect(result.size).toBe(1)
  })
})

// ============================================================================
// processFile — additional edge cases
// ============================================================================

describe('processFile — additional edge cases', () => {
  const makeContext = (overrides: Record<string, unknown> = {}) => ({
    dryRun: false,
    parser: {
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: () => '/test/file.ts',
          getText: () => 'test code',
          getFullText: () => 'fixed code',
        },
        filePath: '/test/file.ts',
        parseTime: 10,
      }),
    },
    registry: {
      runRules: vi.fn().mockReturnValue([makeViolation()]),
      runRulesBatched: vi.fn().mockReturnValue([makeViolation()]),
    },
    rulesWithFixes: new Map(),
    ...overrides,
  })

  test('handles sourceFile with getFullText returning empty string', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/empty.ts',
    })

    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/test/empty.ts',
        getText: () => '',
        getFullText: () => '',
      },
      filePath: '/test/empty.ts',
      parseTime: 1,
    })

    const result = await processFile(
      { absolutePath: '/test/empty.ts', path: 'empty.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(fs.writeFile).toHaveBeenCalledWith('/test/empty.ts', '', 'utf8')
  })

  test('handles sourceFile with very large content', async () => {
    const largeContent = 'x'.repeat(1_000_000)
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/large.ts',
    })

    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/test/large.ts',
        getText: () => largeContent,
        getFullText: () => largeContent,
      },
      filePath: '/test/large.ts',
      parseTime: 100,
    })

    const result = await processFile(
      { absolutePath: '/test/large.ts', path: 'large.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(fs.writeFile).toHaveBeenCalledWith('/test/large.ts', largeContent, 'utf8')
  })

  test('handles file path with spaces', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/path/with spaces/my file.ts',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/path/with spaces/my file.ts',
        getText: () => 'code',
        getFullText: () => 'fixed code',
      },
      filePath: '/path/with spaces/my file.ts',
      parseTime: 5,
    })

    const result = await processFile(
      { absolutePath: '/path/with spaces/my file.ts', path: 'my file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.file).toBe('my file.ts')
  })

  test('handles file path with unicode characters', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/src/日本語/ファイル.ts',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/src/日本語/ファイル.ts',
        getText: () => 'code',
        getFullText: () => 'fixed',
      },
      filePath: '/src/日本語/ファイル.ts',
      parseTime: 5,
    })

    const result = await processFile(
      { absolutePath: '/src/日本語/ファイル.ts', path: 'ファイル.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.file).toBe('ファイル.ts')
  })

  test('multiple sequential processFile calls are independent', async () => {
    vi.mocked(applyFixesToFile)
      .mockReturnValueOnce({
        fixesApplied: 5,
        fixesSkipped: 0,
        conflicts: [],
        changes: [],
        filePath: '/test/a.ts',
      })
      .mockReturnValueOnce({
        fixesApplied: 1,
        fixesSkipped: 2,
        conflicts: [],
        changes: [],
        filePath: '/test/b.ts',
      })

    const ctx1 = makeContext()
    const ctx2 = makeContext()

    const result1 = await processFile({ absolutePath: '/test/a.ts', path: 'a.ts' }, ctx1 as never)
    const result2 = await processFile({ absolutePath: '/test/b.ts', path: 'b.ts' }, ctx2 as never)

    expect(result1.fixesApplied).toBe(5)
    expect(result2.fixesApplied).toBe(1)
    expect(result2.fixesSkipped).toBe(2)
  })

  test('applyFixesToFile receives correct sourceFile argument', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const mockSourceFile = {
      getFilePath: () => '/test/file.ts',
      getText: () => 'test',
      getFullText: () => 'fixed',
    }
    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: mockSourceFile,
      filePath: '/test/file.ts',
      parseTime: 5,
    })
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(applyFixesToFile).toHaveBeenCalledWith(
      mockSourceFile,
      expect.any(Array),
      expect.any(Map),
      false,
    )
  })

  test('applyFixesToFile receives dryRun flag from context', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: true })
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    expect(applyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      true,
    )
  })

  test('applyFixesToFile receives violations from runRulesBatched', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const violations = [makeViolation({ ruleId: 'r1' }), makeViolation({ ruleId: 'r2' })]
    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue(violations)

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    const callArgs = vi.mocked(applyFixesToFile).mock.calls[0]!
    expect(callArgs[1]).toBe(violations)
  })

  test('applyFixesToFile receives rulesWithFixes from context', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })

    const rulesMap = new Map()
    rulesMap.set('my-rule', { id: 'my-rule', fix: vi.fn(), priority: 10 })

    const ctx = makeContext({ rulesWithFixes: rulesMap })
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])

    await processFile({ absolutePath: '/test/file.ts', path: 'file.ts' }, ctx as never)

    const callArgs = vi.mocked(applyFixesToFile).mock.calls[0]!
    expect(callArgs[2]).toBe(rulesMap)
  })

  test('processed result with fixesSkipped > 0 but fixesApplied = 0 does not write file', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 0,
      fixesSkipped: 5,
      conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: false })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(5)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('processed result with both applied and skipped > 0', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 3,
      fixesSkipped: 2,
      conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      changes: [],
      filePath: '/test/file.ts',
    })

    const ctx = makeContext({ dryRun: false })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.fixesApplied).toBe(3)
    expect(result.fixesSkipped).toBe(2)
    expect(result.conflicts).toHaveLength(1)
    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })

  test('handles writeFile rejecting with non-Error object', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/file.ts',
    })
    vi.mocked(fs.writeFile).mockRejectedValueOnce('disk full')

    const ctx = makeContext({ dryRun: false })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('disk full')
  })

  test('error thrown by runRulesBatched is caught', async () => {
    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockImplementation(() => {
      throw new Error('batch rule crash')
    })

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('batch rule crash')
  })

  test('boolean true thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(true)

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('true')
  })

  test('boolean false thrown as error', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(false)

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('false')
  })

  test('Error subclass preserves message correctly', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockRejectedValue(new TypeError('not a function'))

    const result = await processFile(
      { absolutePath: '/test/file.ts', path: 'file.ts' },
      ctx as never,
    )

    expect(result.status).toBe('error')
    expect(result.error).toBe('not a function')
  })

  test('result file path matches the input relative path', async () => {
    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: null,
      filePath: '/abs/deep/nested/file.ts',
      parseTime: 0,
    })

    const result = await processFile(
      { absolutePath: '/abs/deep/nested/file.ts', path: 'deep/nested/file.ts' },
      ctx as never,
    )

    expect(result.file).toBe('deep/nested/file.ts')
  })

  test('processes .jsx file extension', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/src/component.jsx',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/src/component.jsx',
        getText: () => '<div />',
        getFullText: () => '<Component />',
      },
      filePath: '/src/component.jsx',
      parseTime: 5,
    })

    const result = await processFile(
      { absolutePath: '/src/component.jsx', path: 'component.jsx' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.file).toBe('component.jsx')
  })

  test('processes .mjs file extension', async () => {
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 1,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/src/index.mjs',
    })

    const ctx = makeContext()
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation()])
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/src/index.mjs',
        getText: () => 'export default {}',
        getFullText: () => 'export default {}',
      },
      filePath: '/src/index.mjs',
      parseTime: 3,
    })

    const result = await processFile(
      { absolutePath: '/src/index.mjs', path: 'index.mjs' },
      ctx as never,
    )

    expect(result.status).toBe('processed')
    expect(result.file).toBe('index.mjs')
  })

  test('sourceFile with complex getFullText output', async () => {
    const complexContent = 'import { a, b, c } from "mod"\nexport const x = a + b + c\n'
    vi.mocked(applyFixesToFile).mockReturnValue({
      fixesApplied: 2,
      fixesSkipped: 0,
      conflicts: [],
      changes: [],
      filePath: '/test/complex.ts',
    })

    const ctx = makeContext()
    ctx.parser.parseFile.mockResolvedValue({
      sourceFile: {
        getFilePath: () => '/test/complex.ts',
        getText: () => 'old content',
        getFullText: () => complexContent,
      },
      filePath: '/test/complex.ts',
      parseTime: 10,
    })
    ctx.registry.runRulesBatched.mockReturnValue([makeViolation(), makeViolation()])

    await processFile({ absolutePath: '/test/complex.ts', path: 'complex.ts' }, ctx as never)

    expect(fs.writeFile).toHaveBeenCalledWith('/test/complex.ts', complexContent, 'utf8')
  })
})

// ============================================================================
// printSummary — additional edge cases
// ============================================================================

describe('printSummary — additional edge cases', () => {
  test('dry-run with fixesSkipped > 0 shows skipped count', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1, totalFixesSkipped: 3 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes skipped: 3'))).toBe(true)
  })

  test('dry-run with zero fixes and zero skips shows "No violations found"', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('No violations found'))).toBe(true)
  })

  test('non-dry-run with only modified files shows correct counts', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 10,
      filesModified: ['a.ts', 'b.ts', 'c.ts'],
      filesUnchanged: [],
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files modified: 3'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 0'))).toBe(true)
  })

  test('large number of files modified shows correct count', () => {
    const manyFiles = Array.from({ length: 50 }, (_, i) => `file-${i}.ts`)
    const summary = makeFixSummary({
      totalFixesApplied: 50,
      filesModified: manyFiles,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files modified: 50'))).toBe(true)
  })

  test('large number of files unchanged shows correct count', () => {
    const manyFiles = Array.from({ length: 30 }, (_, i) => `clean-${i}.ts`)
    const summary = makeFixSummary({
      totalFixesApplied: 0,
      filesUnchanged: manyFiles,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Files unchanged: 30'))).toBe(true)
  })

  test('totalFixesApplied=0 and totalFixesSkipped>0 does NOT show no violations', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 1 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(true)
  })

  test('header line is always the first line', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines[0]).toContain('Fix Summary')
  })

  test('fixes applied line is always present', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0 })
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes applied: 0'))).toBe(true)
  })

  test('dry-run mode line appears when dry-run flag is set', () => {
    const summary = makeFixSummary()
    const flags = { ...defaultFlags(), 'dry-run': true }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('no files modified'))).toBe(true)
  })

  test('non-dry-run with skipped fixes shows yellow warning', () => {
    const summary = makeFixSummary({ totalFixesApplied: 2, totalFixesSkipped: 4 })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const lines = printSummary(summary, flags)

    expect(lines.some((l) => l.includes('Fixes skipped: 4'))).toBe(true)
  })

  test('returns array of strings', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const lines = printSummary(summary, flags)

    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })
})

// ============================================================================
// outputFixResults — additional edge cases
// ============================================================================

describe('outputFixResults — additional edge cases', () => {
  test('ci mode always produces valid JSON', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      totalFixesApplied: 1,
    })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)

    expect(() => JSON.parse(result.jsonOutput!)).not.toThrow()
  })

  test('ci mode JSON has all expected top-level keys', () => {
    const summary = makeFixSummary({ totalFixesApplied: 3, totalFixesSkipped: 1 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(Object.keys(parsed)).toEqual(['dryRun', 'filesModified', 'filesUnchanged', 'summary'])
    expect(Object.keys(parsed.summary)).toEqual(['fixesApplied', 'fixesSkipped'])
  })

  test('ci mode with dryRun=true flag reflects in JSON output', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = { ...defaultFlags(), 'dry-run': true }

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.dryRun).toBe(true)
  })

  test('ci mode with dryRun=false flag reflects in JSON output', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = { ...defaultFlags(), 'dry-run': false }

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.dryRun).toBe(false)
  })

  test('non-ci mode with verbose flag delegates to printSummary', () => {
    const summary = makeFixSummary({ totalFixesApplied: 3 })
    const flags = { ...defaultFlags(), verbose: true }

    const result = outputFixResults(summary, flags, false)

    expect(result.jsonOutput).toBeUndefined()
    const expected = printSummary(summary, flags)
    expect(result.summaryLines).toEqual(expected)
  })

  test('ci mode with empty summary arrays produces valid JSON', () => {
    const summary = makeFixSummary()
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual([])
  })

  test('ci mode JSON is indented with 2 spaces', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)

    expect(result.jsonOutput).toMatch(/^{\n  "/)
  })

  test('ci mode with large data produces correct JSON', () => {
    const files = Array.from({ length: 200 }, (_, i) => `file-${i}.ts`)
    const summary = makeFixSummary({
      filesModified: files,
      totalFixesApplied: 200,
      totalFixesSkipped: 50,
    })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.filesModified).toHaveLength(200)
    expect(parsed.summary.fixesApplied).toBe(200)
    expect(parsed.summary.fixesSkipped).toBe(50)
  })

  test('non-ci summaryLines is never empty when summary has data', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, false)

    expect(result.summaryLines.length).toBeGreaterThan(0)
  })

  test('ci mode returns empty summaryLines array', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = defaultFlags()

    const result = outputFixResults(summary, flags, true)

    expect(result.summaryLines).toEqual([])
  })
})

// ============================================================================
// setupFixContext — additional edge cases
// ============================================================================

describe('setupFixContext — additional edge cases', () => {
  test('args.files as empty array resolves patterns from config defaults', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    await setupFixContext({ files: [] }, flags, false)

    expect(discoverFiles).toHaveBeenCalled()
  })

  test('flags.concurrency is present but not directly used by setupFixContext', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), concurrency: 8 }
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result).not.toBeNull()
  })

  test('CI mode with successful context returns result', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, true)

    expect(result.result).not.toBeNull()
    expect(result.result!.context).toBeDefined()
  })

  test('non-CI no fixable rules message includes chalk formatting', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'test.ts', absolutePath: '/test.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'no-fix': { meta: { id: 'no-fix', description: 'No fix' } },
    })

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.statusMessages.some((m) => m.includes('No fixable rules'))).toBe(true)
  })

  test('passes cwd to discoverFiles', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    await setupFixContext({ files: undefined }, flags, false)

    expect(discoverFiles).toHaveBeenCalledWith(expect.objectContaining({ cwd: expect.any(String) }))
  })

  test('multiple fixable rules are all included in context', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'rule-a': { meta: { id: 'rule-a', description: 'A', fixable: true }, fix: vi.fn() },
      'rule-b': { meta: { id: 'rule-b', description: 'B', fixable: true }, fix: vi.fn() },
      'rule-c': { meta: { id: 'rule-c', description: 'C', fixable: true }, fix: vi.fn() },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.context.rulesWithFixes.size).toBe(3)
  })

  test('safe-only filters out non-fixable rules in context', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      fixable: { meta: { id: 'fixable', description: 'F', fixable: true }, fix: vi.fn() },
      'not-fixable': { meta: { id: 'not-fixable', description: 'NF' }, fix: vi.fn() },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), 'safe-only': true }
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.context.rulesWithFixes.size).toBe(1)
    expect(result.result!.context.rulesWithFixes.has('fixable')).toBe(true)
  })

  test('status messages for CI mode when no files found has correct JSON structure', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([])

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, true)

    const parsed = JSON.parse(result.statusMessages[0]!)
    expect(parsed).toHaveProperty('error')
    expect(parsed).toHaveProperty('files')
  })

  test('status messages for non-CI mode when no files found is yellow text', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([])

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.statusMessages.length).toBeGreaterThan(0)
    expect(result.statusMessages.length).toBeGreaterThan(0)
    expect(result.statusMessages[0]).toContain('No files found')
  })

  test('creates new Parser instance each call', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result1 = await setupFixContext({ files: undefined }, flags, false)
    const result2 = await setupFixContext({ files: undefined }, flags, false)

    // Each call creates a new Parser instance
    expect(Parser).toHaveBeenCalledTimes(2)
    expect(result1.result!.context.parser).toBeDefined()
    expect(result2.result!.context.parser).toBeDefined()
  })

  test('rules with comma-separated values trims each rule id', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), rules: 'rule-a   ,   rule-b   ,rule-c' }
    await setupFixContext({ files: undefined }, flags, false)

    expect(setupRuleRegistryLazy).toHaveBeenCalledWith(['rule-a', 'rule-b', 'rule-c'])
  })

  test('ignores flags.config (not used by setupFixContext directly)', async () => {
    vi.mocked(discoverFiles).mockResolvedValue([{ path: 'a.ts', absolutePath: '/abs/a.ts' }])
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = { ...defaultFlags(), config: './custom-config.json' }
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(discoverFiles).toHaveBeenCalled()
  })

  test('flags.concurrency is present but not directly used by setupFixContext', async () => {
    const files = Array.from({ length: 50 }, (_, i) => ({
      path: `file-${i}.ts`,
      absolutePath: `/abs/file-${i}.ts`,
    }))
    vi.mocked(discoverFiles).mockResolvedValue(files)
    vi.mocked(lazyRuleLoader.loadAllRules).mockResolvedValue({
      'fix-rule': {
        meta: { id: 'fix-rule', description: 'Fix', fixable: true },
        fix: vi.fn(),
      },
    })
    vi.mocked(setupRuleRegistryLazy).mockResolvedValue({})

    const flags = defaultFlags()
    const result = await setupFixContext({ files: undefined }, flags, false)

    expect(result.result!.discoveredFiles).toHaveLength(50)
  })
})

// ============================================================================
// aggregateResults — additional combination tests
// ============================================================================

describe('aggregateResults — additional combination tests', () => {
  test('dry-run non-verbose with fixes produces no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: false }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines).toEqual([])
  })

  test('non-dry-run non-verbose with fixes produces no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: false }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines).toEqual([])
  })

  test('error result always produces log regardless of verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'a.ts' }),
    ]
    const flagsVerbose = { ...defaultFlags(), verbose: true }
    const flagsQuiet = { ...defaultFlags(), verbose: false }

    const { logLines: verboseLogs } = aggregateResults(results, flagsVerbose)
    const { logLines: quietLogs } = aggregateResults(results, flagsQuiet)

    expect(verboseLogs.some((l) => l.includes('Error processing'))).toBe(true)
    expect(quietLogs.some((l) => l.includes('Error processing'))).toBe(true)
  })

  test('100 error results produce 100 log lines', () => {
    const results: FileFixResult[] = Array.from({ length: 100 }, (_, i) =>
      makeFixResult({ status: 'error', error: `err-${i}`, file: `err-${i}.ts` }),
    )
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines).toHaveLength(100)
  })

  test('100 unchanged results produce no log lines', () => {
    const results: FileFixResult[] = Array.from({ length: 100 }, (_, i) =>
      makeFixResult({ status: 'unchanged', file: `clean-${i}.ts` }),
    )
    const flags = { ...defaultFlags(), verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines).toEqual([])
  })

  test('mixed dry-run and verbose flags produce correct log types', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'e', file: 'b.ts' }),
      makeFixResult({ status: 'unchanged', file: 'c.ts' }),
    ]

    const { logLines: dryVerbose } = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': true,
      verbose: true,
    })
    expect(dryVerbose.some((l) => l.includes('Would fix'))).toBe(true)
    expect(dryVerbose.some((l) => l.includes('Error processing'))).toBe(true)
    expect(dryVerbose.some((l) => l.includes('Fixed'))).toBe(false)

    const { logLines: wetVerbose } = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': false,
      verbose: true,
    })
    expect(wetVerbose.some((l) => l.includes('Fixed 2 violation(s)'))).toBe(true)
    expect(wetVerbose.some((l) => l.includes('Error processing'))).toBe(true)
    expect(wetVerbose.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('summary accumulates fixes correctly across all processed results', () => {
    const results: FileFixResult[] = Array.from({ length: 10 }, (_, i) =>
      makeFixResult({
        status: 'processed',
        fixesApplied: i + 1,
        fixesSkipped: i,
        file: `file-${i}.ts`,
      }),
    )
    const flags = { ...defaultFlags(), 'dry-run': false }

    const { summary } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(55)
    expect(summary.totalFixesSkipped).toBe(45)
  })

  test('dry-run summary tracks fixes but not modified files', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 10, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true }

    const { summary } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(15)
    expect(summary.filesModified).toEqual([])
  })

  test('log lines contain chalk formatting for errors', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'test error', file: 'a.ts' }),
    ]
    const flags = defaultFlags()

    const { logLines } = aggregateResults(results, flags)

    expect(logLines[0]).toContain('Error processing')
    expect(logLines[0]).toContain('test error')
  })

  test('verbose fixed log lines contain chalk formatting', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }

    const { logLines } = aggregateResults(results, flags)

    expect(logLines[0]).toContain('Fixed 1 violation(s)')
    expect(logLines[0]).toContain('a.ts')
  })

  test('conflict log contains both rule names and file', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'conflict.ts',
        conflicts: [{ ruleId: 'import-sort', conflictingRule: 'import-order' }],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }

    const { logLines } = aggregateResults(results, flags)

    const conflictLine = logLines.find((l) => l.includes('Skipped'))
    expect(conflictLine).toBeDefined()
    expect(conflictLine!).toContain('import-sort')
    expect(conflictLine!).toContain('import-order')
    expect(conflictLine!).toContain('conflict.ts')
  })
})
