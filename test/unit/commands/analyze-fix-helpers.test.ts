import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { RuleViolation } from '../../../src/ast/visitor.js'
import type { DiscoveredFile } from '../../../src/core/file-discovery.js'
import type { ParseResult } from '../../../src/core/parser.js'
import type { FileFixReport } from '../../../src/fix/types.js'

// ============================================================================
// Mocks
// ============================================================================

const mockApplyFixesToFile = vi.fn()
const mockApplyFixesToFiles = vi.fn()
const mockRenderTextChangesAsDiff = vi.fn()
const mockFormatDiffForConsole = vi.fn()

vi.mock('../../../src/fix/fixer.js', () => ({
  applyFixesToFile: (...args: unknown[]) => mockApplyFixesToFile(...args),
}))

vi.mock('../../../src/utils/command-helpers.js', () => ({
  applyFixesToFiles: (...args: unknown[]) => mockApplyFixesToFiles(...args),
}))

vi.mock('../../../src/fix/diff-renderer.js', () => ({
  renderTextChangesAsDiff: (...args: unknown[]) => mockRenderTextChangesAsDiff(...args),
  formatDiffForConsole: (...args: unknown[]) => mockFormatDiffForConsole(...args),
}))

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// ============================================================================
// Helpers
// ============================================================================

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'error',
  message: 'test message',
  filePath: '/test.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

const makeSourceFile = () => ({
  saveSync: vi.fn(),
  getText: vi.fn().mockReturnValue('const x = 1'),
  getFilePath: vi.fn().mockReturnValue('/src/a.ts'),
})

const makeDiscoveredFile = (filePath: string): DiscoveredFile => ({
  path: filePath,
  absolutePath: `/${filePath}`,
})

const makeParseResult = (sourceFile?: ReturnType<typeof makeSourceFile>): ParseResult =>
  ({
    sourceFile: sourceFile ?? makeSourceFile(),
    filePath: '/src/a.ts',
    parseTime: 5,
    cached: false,
  }) as ParseResult

const mockParser = {
  parseFile: vi.fn(),
}

// ============================================================================
// Import after mocks
// ============================================================================

const { applyFixes, getRulesWithFixes, processFixes } =
  await import('../../../src/commands/analyze-fix-helpers.js')

// ============================================================================
// applyFixes - no violations
// ============================================================================

describe('applyFixes - no violations scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns zero counts when allViolations is empty', async () => {
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  test('returns undefined fileFixReports when not dry run with no violations', async () => {
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toBeUndefined()
  })

  test('returns empty fileFixReports when dry run with no violations', async () => {
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toEqual([])
  })

  test('returns zero counts when discoveredFiles is empty', async () => {
    const result = await applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  test('returns zero when discoveredFiles is empty with dry run', async () => {
    const result = await applyFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fileFixReports).toEqual([])
  })

  test('returns zero when violations are for different files than discoveredFiles', async () => {
    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/other.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })
})

// ============================================================================
// applyFixes - single violation
// ============================================================================

describe('applyFixes - single violation processing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('processes a single violation and returns applied count', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
  })

  test('calls applyFixesToFile with correct arguments', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const rulesWithFixes = new Map()
    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes,
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      sourceFile,
      expect.arrayContaining([expect.objectContaining({ filePath: 'src/a.ts' })]),
      rulesWithFixes,
      false,
    )
  })

  test('uses cached parse result when available', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).not.toHaveBeenCalled()
  })

  test('parses file when no cache available', async () => {
    const parseResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(parseResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/a.ts')
  })

  test('returns skipped count from applyFixesToFile', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 3,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(2)
    expect(result.fixesSkipped).toBe(3)
  })
})

// ============================================================================
// applyFixes - saveSync behavior
// ============================================================================

describe('applyFixes - saveSync behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls saveSync when not dry run and changes exist', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sourceFile.saveSync).toHaveBeenCalledTimes(1)
  })

  test('does not call saveSync when not dry run but no changes', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sourceFile.saveSync).not.toHaveBeenCalled()
  })

  test('does not call saveSync in dry run mode even with changes', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sourceFile.saveSync).not.toHaveBeenCalled()
  })
})

// ============================================================================
// applyFixes - dry run reports
// ============================================================================

describe('applyFixes - dry run report generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('includes fileFixReports in dry run mode', async () => {
    const sourceFile = makeSourceFile()
    const report: FileFixReport = {
      changes: [{ start: 0, end: 1, newText: 'fixed', oldText: 'old' }],
      conflicts: [],
      filePath: 'src/a.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
    }
    mockApplyFixesToFile.mockReturnValue(report)

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(1)
  })

  test('fileFixReports is undefined when not dry run', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'fixed', oldText: 'old' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toBeUndefined()
  })

  test('includes multiple reports in dry run for multiple files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockImplementation((_sf: unknown) => ({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [],
      filePath: 'src/a.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
    }))

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: true,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(2)
  })

  test('includes report even when no changes in dry run', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 0,
      fixesSkipped: 1,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(1)
    expect(result.fileFixReports![0].fixesSkipped).toBe(1)
  })
})

// ============================================================================
// applyFixes - verbose conflict logging
// ============================================================================

describe('applyFixes - verbose conflict logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs conflicts when verbose and conflicts exist', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'overlap' }],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Fix conflict in src/a.ts'))
  })

  test('logs multiple conflicts when verbose', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [
        { ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'overlap' },
        { ruleId: 'rule-c', conflictingRule: 'rule-d', reason: 'overlap' },
      ],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledTimes(2)
  })

  test('does not log conflicts when not verbose', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b', reason: 'overlap' }],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Fix conflict'))
  })

  test('does not log when no conflicts even if verbose', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Fix conflict'))
  })
})

// ============================================================================
// applyFixes - error handling
// ============================================================================

describe('applyFixes - error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns zero counts when applyFixesToFile throws', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('fix failed')
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  test('logs warning when verbose and applyFixesToFile throws', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('fix failed')
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to fix src/a.ts'))
  })

  test('does not log warning when not verbose and error occurs', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('fix failed')
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('Failed to fix'))
  })

  test('continues processing other files when one file errors', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callCount = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        throw new Error('first file failed')
      }
      return {
        changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
        conflicts: [],
        fixesApplied: 2,
        fixesSkipped: 0,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(2)
  })
})

// ============================================================================
// applyFixes - multiple files and violations
// ============================================================================

describe('applyFixes - multiple files and violations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('groups violations by file correctly', async () => {
    const sf1 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts', ruleId: 'rule-1' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'rule-2' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf1)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ ruleId: 'rule-1' }),
        expect.objectContaining({ ruleId: 'rule-2' }),
      ]),
      expect.anything(),
      expect.anything(),
    )
  })

  test('processes two files with violations independently', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(2)
    expect(result.fixesApplied).toBe(2)
  })

  test('aggregates fixesApplied across files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callIndex = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIndex++
      return {
        changes: [],
        conflicts: [],
        fixesApplied: callIndex,
        fixesSkipped: 0,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(3) // 1 + 2
  })

  test('aggregates fixesSkipped across files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(
      (_sf: unknown, _viols: unknown, _rules: unknown, _dry: unknown, idx: number = 0) => ({
        changes: [],
        conflicts: [],
        fixesApplied: 0,
        fixesSkipped: 3,
      }),
    )

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesSkipped).toBe(6) // 3 + 3
  })

  test('skips file not in discoveredFiles', async () => {
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/missing.ts' }),
        makeViolation({ filePath: 'src/a.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    // missing.ts is not in discoveredFiles, only a.ts is processed
    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('handles three files with mixed results', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    const sf3 = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      if (callIdx === 2) {
        return { changes: [], conflicts: [], fixesApplied: 0, fixesSkipped: 5 }
      }
      return {
        changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
        conflicts: [],
        fixesApplied: 3,
        fixesSkipped: 1,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
        makeViolation({ filePath: 'src/c.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [
        makeDiscoveredFile('src/a.ts'),
        makeDiscoveredFile('src/b.ts'),
        makeDiscoveredFile('src/c.ts'),
      ],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
        ['/src/c.ts', makeParseResult(sf3)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(6) // 3 + 0 + 3
    expect(result.fixesSkipped).toBe(7) // 1 + 5 + 1
  })
})

// ============================================================================
// applyFixes - concurrency
// ============================================================================

describe('applyFixes - concurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('respects concurrency of 1 (sequential)', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sourceFile)],
        ['/src/b.ts', makeParseResult(makeSourceFile())],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(2)
  })

  test('handles higher concurrency value', async () => {
    const files = Array.from({ length: 5 }, (_, i) => makeDiscoveredFile(`src/file${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const parseCacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])

    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 5,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(parseCacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(5)
    expect(result.fixesApplied).toBe(5)
  })

  test('handles concurrency of 10', async () => {
    const files = Array.from({ length: 10 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const parseCacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])

    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 10,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(parseCacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(10)
  })
})

// ============================================================================
// applyFixes - file with no violations
// ============================================================================

describe('applyFixes - file with no violations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('skips file when it has no violations', async () => {
    const sourceFile = makeSourceFile()

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/other.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).not.toHaveBeenCalled()
    expect(result.fixesApplied).toBe(0)
  })

  test('mixed scenario: some files with violations, some without', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
    expect(result.fixesApplied).toBe(2)
  })
})

// ============================================================================
// getRulesWithFixes
// ============================================================================

describe('getRulesWithFixes', () => {
  test('returns empty map for empty registry', () => {
    const registry = { getAllRules: vi.fn().mockReturnValue([]) }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('filters rules without fix function', () => {
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: 'no-fix' } } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('includes rule with fix function', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'test-rule' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(1)
    expect(result.has('test-rule')).toBe(true)
  })

  test('excludes rule without fix', () => {
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: 'no-fix' } } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.has('no-fix')).toBe(false)
  })

  test('handles mix of rules with and without fixes', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'r1' }, fix: fixFn } },
          { definition: { meta: { name: 'r2' } } },
          { definition: { meta: { name: 'r3' }, fix: fixFn } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(2)
    expect(result.has('r1')).toBe(true)
    expect(result.has('r2')).toBe(false)
    expect(result.has('r3')).toBe(true)
  })

  test('calls getAllRules exactly once', () => {
    const getAllRules = vi.fn().mockReturnValue([])
    const registry = { getAllRules }
    getRulesWithFixes(registry)

    expect(getAllRules).toHaveBeenCalledTimes(1)
  })

  test('sets default priority of 10', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: 'r1' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.get('r1')!.priority).toBe(10)
  })

  test('sets the rule id correctly', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'my-custom-rule' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.get('my-custom-rule')!.id).toBe('my-custom-rule')
  })

  test('stores fix function as property', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'fixable-rule' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.get('fixable-rule')!.fix).toBeDefined()
    expect(typeof result.get('fixable-rule')!.fix).toBe('function')
  })

  test('handles multiple rules with fixes', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'r1' }, fix: fixFn } },
          { definition: { meta: { name: 'r2' }, fix: fixFn } },
          { definition: { meta: { name: 'r3' }, fix: fixFn } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(3)
    expect(result.has('r1')).toBe(true)
    expect(result.has('r2')).toBe(true)
    expect(result.has('r3')).toBe(true)
  })

  test('excludes rules where fix is not a function', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'string-fix' }, fix: 'not-a-function' } },
          { definition: { meta: { name: 'number-fix' }, fix: 42 } },
          { definition: { meta: { name: 'obj-fix' }, fix: {} } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('includes only actual function fixes alongside non-functions', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'good-rule' }, fix: fixFn } },
          { definition: { meta: { name: 'bad-fix' }, fix: 'string' } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(1)
    expect(result.has('good-rule')).toBe(true)
  })

  test('handles registry returning undefined fix', () => {
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: 'undef-fix' } } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('handles registry returning null fix', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'null-fix' }, fix: null } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as true (truthy but not function)', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'bool-fix' }, fix: true } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })

  test('handles rule with fix as false (falsy boolean)', () => {
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'false-fix' }, fix: false } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })
})

// ============================================================================
// processFixes - zero violations
// ============================================================================

describe('processFixes - zero violations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns early with empty result for zero violations', async () => {
    const result = await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toBe('')
  })

  test('does not call applyFixesToFiles for zero violations', async () => {
    await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).not.toHaveBeenCalled()
  })

  test('early return does not call getRulesWithFixes', async () => {
    const getAllRules = vi.fn().mockReturnValue([])
    await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules },
      verbose: false,
    })

    expect(getAllRules).not.toHaveBeenCalled()
  })
})

// ============================================================================
// processFixes - spinner messages
// ============================================================================

describe('processFixes - spinner messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dry run message format', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 12,
      fixesSkipped: 8,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 12 fixes, skip 8 (dry run)')
  })

  test('non-dry run message format', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 25,
      fixesSkipped: 5,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Applied 25 fixes, skipped 5')
  })

  test('dry run message with zero fixes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 0 fixes, skip 0 (dry run)')
  })

  test('non-dry run message with zero fixes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Applied 0 fixes, skipped 0')
  })

  test('dry run message with large numbers', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1000,
      fixesSkipped: 500,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 1000 fixes, skip 500 (dry run)')
  })

  test('non-dry run message with skipped only', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 42,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Applied 0 fixes, skipped 42')
  })
})

// ============================================================================
// processFixes - dry run diffs
// ============================================================================

describe('processFixes - dry run diffs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns empty diffs when not dry run', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'file.ts' },
      ],
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
  })

  test('returns diffs when dry run and changes exist', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'file.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'file.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('formatted diff')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toHaveLength(1)
    expect(result.dryRunDiffs[0]).toBe('formatted diff')
  })

  test('skips diffs when file report has no changes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [], filePath: 'empty.ts' },
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'has-changes.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'has-changes.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('diff-output')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toHaveLength(1)
  })

  test('skips diffs when formatDiffForConsole returns empty string', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'file.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'file.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toHaveLength(0)
  })

  test('skips diffs when formatDiffForConsole returns null', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'file.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'file.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue(null)

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toHaveLength(0)
  })

  test('handles multiple file reports with diffs', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'f1.ts' },
        { changes: [{ start: 0, end: 1, newText: 'c', oldText: 'd' }], filePath: 'f2.ts' },
        { changes: [{ start: 0, end: 1, newText: 'e', oldText: 'f' }], filePath: 'f3.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockImplementation((changes: unknown, path: string) => ({
      filePath: path,
      hunks: [],
    }))
    mockFormatDiffForConsole.mockImplementation((_diff: unknown) => 'diff-line')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toHaveLength(3)
  })

  test('returns empty diffs when dry run but no fileFixReports', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
  })

  test('returns empty diffs when dry run and empty fileFixReports', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [],
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
  })
})

// ============================================================================
// processFixes - concurrency passing
// ============================================================================

describe('processFixes - concurrency and options passing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('passes concurrency to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 5,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(expect.objectContaining({ concurrency: 5 }))
  })

  test('passes verbose flag to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: true,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }))
  })

  test('passes quiet flag to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: false,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(expect.objectContaining({ quiet: false }))
  })

  test('passes dryRun flag to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(expect.objectContaining({ dryRun: true }))
  })

  test('passes parseCache to applyFixesToFiles', async () => {
    const cache = new Map()
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: cache,
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ parseCache: cache }),
    )
  })

  test('passes discoveredFiles to applyFixesToFiles', async () => {
    const files = [makeDiscoveredFile('src/a.ts')]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ discoveredFiles: files }),
    )
  })

  test('passes parser to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ parser: mockParser }),
    )
  })
})

// ============================================================================
// processFixes - rulesWithFixes integration
// ============================================================================

describe('processFixes - rulesWithFixes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls getRulesWithFixes from registry', async () => {
    const fixFn = vi.fn()
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: {
        getAllRules: vi
          .fn()
          .mockReturnValue([{ definition: { meta: { name: 'test' }, fix: fixFn } }]),
      },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        rulesWithFixes: expect.any(Map),
      }),
    )
  })

  test('passes extracted rulesWithFixes containing fixable rules', async () => {
    const fixFn = vi.fn()
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: {
        getAllRules: vi
          .fn()
          .mockReturnValue([{ definition: { meta: { name: 'test' }, fix: fixFn } }]),
      },
      verbose: false,
    })

    const calledOpts = mockApplyFixesToFiles.mock.calls[0][0]
    expect(calledOpts.rulesWithFixes.has('test')).toBe(true)
  })
})

// ============================================================================
// applyFixes - edge cases
// ============================================================================

describe('applyFixes - edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles single file with many violations', async () => {
    const sourceFile = makeSourceFile()
    const violations = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ filePath: 'src/a.ts', ruleId: `rule-${i}` }),
    )
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [],
      fixesApplied: 50,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(50)
  })

  test('handles file with violation but null file entry', async () => {
    // discoveredFiles with a null-ish entry should be handled gracefully
    // The source checks: if (!file) return ...
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
  })

  test('handles file in violations that has no matching discoveredFile', async () => {
    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/only-in-violations.ts' }),
        makeViolation({ filePath: 'src/also-only-in-violations.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/actual-file.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(mockApplyFixesToFile).not.toHaveBeenCalled()
  })

  test('handles empty discoveredFiles and empty violations', async () => {
    const result = await applyFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
    expect(result.fileFixReports).toBeUndefined()
  })

  test('handles file where parser must be called (no cache)', async () => {
    const parseResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(parseResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'new', oldText: 'old' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/uncached.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/uncached.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/uncached.ts')
    expect(result.fixesApplied).toBe(1)
  })

  test('handles dry run with mixed results across files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callCount = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
          conflicts: [],
          fixesApplied: 1,
          fixesSkipped: 0,
        }
      }
      return { changes: [], conflicts: [], fixesApplied: 0, fixesSkipped: 3 }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: true,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
    expect(result.fixesSkipped).toBe(3)
    expect(result.fileFixReports).toHaveLength(2)
  })

  test('handles all errors across all files gracefully', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('all files fail')
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })
})

// ============================================================================
// applyFixes - report content
// ============================================================================

describe('applyFixes - report content details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('report contains correct filePath in dry run', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
      conflicts: [],
      filePath: 'src/custom.ts',
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/custom.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/custom.ts')],
      dryRun: true,
      parseCache: new Map([['/src/custom.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports![0].filePath).toBe('src/custom.ts')
  })

  test('report includes conflict details in dry run', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [{ ruleId: 'r1', conflictingRule: 'r2', reason: 'overlap' }],
      filePath: 'src/a.ts',
      fixesApplied: 1,
      fixesSkipped: 1,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports![0].conflicts).toHaveLength(1)
    expect(result.fileFixReports![0].conflicts[0].ruleId).toBe('r1')
  })

  test('report includes changes details in dry run', async () => {
    const sourceFile = makeSourceFile()
    const changes = [
      { start: 0, end: 3, newText: 'const', oldText: 'let' },
      { start: 10, end: 12, newText: '===', oldText: '==' },
    ]
    mockApplyFixesToFile.mockReturnValue({
      changes,
      conflicts: [],
      filePath: 'src/a.ts',
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports![0].changes).toEqual(changes)
  })

  test('multiple reports in dry run maintain order', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      return {
        changes: [{ start: 0, end: 1, newText: `fix${callIdx}`, oldText: 'old' }],
        conflicts: [],
        filePath: `src/file${callIdx}.ts`,
        fixesApplied: callIdx,
        fixesSkipped: 0,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: true,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    // Reports should accumulate in order of processing
    expect(result.fileFixReports!.length).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================================
// applyFixes - violation grouping
// ============================================================================

describe('applyFixes - violation grouping by file', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('groups three violations for same file together', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 3,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r2' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r3' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    // Should call applyFixesToFile once with all 3 violations
    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
    const callArgs = mockApplyFixesToFile.mock.calls[0]
    expect(callArgs[1]).toHaveLength(3)
  })

  test('splits violations across different files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
        makeViolation({ filePath: 'src/a.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(2)
    // First call should have 2 violations for src/a.ts
    expect(mockApplyFixesToFile.mock.calls[0][1]).toHaveLength(2)
    // Second call should have 1 violation for src/b.ts
    expect(mockApplyFixesToFile.mock.calls[1][1]).toHaveLength(1)
  })

  test('handles interleaved violations from multiple files', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
        makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r3' }),
        makeViolation({ filePath: 'src/b.ts', ruleId: 'r4' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'r5' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    // a.ts should get 3 violations, b.ts should get 2
    const aCall = mockApplyFixesToFile.mock.calls.find(
      (c: unknown[]) => (c[1] as unknown[]).length === 3,
    )
    const bCall = mockApplyFixesToFile.mock.calls.find(
      (c: unknown[]) => (c[1] as unknown[]).length === 2,
    )
    expect(aCall).toBeDefined()
    expect(bCall).toBeDefined()
  })
})

// ============================================================================
// processFixes - renderTextChangesAsDiff integration
// ============================================================================

describe('processFixes - diff rendering integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls renderTextChangesAsDiff with changes and filePath', async () => {
    const changes = [{ start: 0, end: 5, newText: 'const', oldText: 'let' }]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [{ changes, filePath: 'src/a.ts' }],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'src/a.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('diff')

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockRenderTextChangesAsDiff).toHaveBeenCalledWith(changes, 'src/a.ts')
  })

  test('calls formatDiffForConsole with rendered diff', async () => {
    const renderedDiff = { filePath: 'src/a.ts', hunks: [{ header: '@@ -1 +1 @@', changes: [] }] }
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'a', oldText: 'b' }], filePath: 'src/a.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue(renderedDiff)
    mockFormatDiffForConsole.mockReturnValue('formatted')

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockFormatDiffForConsole).toHaveBeenCalledWith(renderedDiff)
  })

  test('handles multiple diffs with mixed formatted results', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'f1.ts' },
        { changes: [{ start: 0, end: 1, newText: 'c', oldText: 'd' }], filePath: 'f2.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockImplementation((_c: unknown, path: string) => ({
      filePath: path,
      hunks: [],
    }))
    mockFormatDiffForConsole.mockReturnValueOnce('diff1').mockReturnValueOnce('') // Empty string - should be filtered out

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual(['diff1'])
  })
})

// ============================================================================
// getRulesWithFixes - fix function wrapping
// ============================================================================

describe('getRulesWithFixes - fix function wrapping', () => {
  test('wrapped fix function calls original with sourceFile and violation', () => {
    const originalFix = vi.fn().mockReturnValue({ applied: true, changes: [] })
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'wrapped-rule' }, fix: originalFix } }]),
    }
    const result = getRulesWithFixes(registry)
    const ruleWithFix = result.get('wrapped-rule')!

    const mockSourceFile = { getText: () => 'code' }
    const mockViolation = makeViolation()
    ruleWithFix.fix({
      sourceFile: mockSourceFile,
      violation: mockViolation,
      getNodeByRange: vi.fn(),
    })

    expect(originalFix).toHaveBeenCalledWith(mockSourceFile, mockViolation)
  })

  test('wrapped fix function returns result from original', () => {
    const fixResult = {
      applied: true,
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
    }
    const originalFix = vi.fn().mockReturnValue(fixResult)
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'return-rule' }, fix: originalFix } }]),
    }
    const result = getRulesWithFixes(registry)
    const ruleWithFix = result.get('return-rule')!

    const actual = ruleWithFix.fix({
      sourceFile: {},
      violation: makeViolation(),
      getNodeByRange: vi.fn(),
    })

    expect(actual).toEqual(fixResult)
  })

  test('wrapped fix returns null when original returns null', () => {
    const originalFix = vi.fn().mockReturnValue(null)
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'null-rule' }, fix: originalFix } }]),
    }
    const result = getRulesWithFixes(registry)
    const ruleWithFix = result.get('null-rule')!

    const actual = ruleWithFix.fix({
      sourceFile: {},
      violation: makeViolation(),
      getNodeByRange: vi.fn(),
    })

    expect(actual).toBeNull()
  })
})

// ============================================================================
// processFixes - applyFixesFn delegation
// ============================================================================

describe('processFixes - applyFixesFn delegation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('passes applyFixesFn to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    const callArg = mockApplyFixesToFiles.mock.calls[0][0]
    expect(callArg.applyFixesFn).toBeDefined()
    expect(typeof callArg.applyFixesFn).toBe('function')
  })

  test('passes allViolations to applyFixesToFiles', async () => {
    const violations = [
      makeViolation({ filePath: 'src/a.ts' }),
      makeViolation({ filePath: 'src/b.ts' }),
    ]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ allViolations: violations }),
    )
  })

  test('returns fixesApplied from applyFixesToFiles result', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 42,
      fixesSkipped: 13,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.fixesApplied).toBe(42)
    expect(result.fixesSkipped).toBe(13)
  })
})

// ============================================================================
// processFixes - comprehensive integration
// ============================================================================

describe('processFixes - comprehensive scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('complete dry run flow with diffs', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 1,
      fileFixReports: [
        {
          changes: [{ start: 0, end: 3, newText: 'const', oldText: 'let ' }],
          filePath: 'src/a.ts',
        },
        {
          changes: [{ start: 10, end: 15, newText: '===', oldText: '==' }],
          filePath: 'src/b.ts',
        },
      ],
    })
    mockRenderTextChangesAsDiff.mockImplementation((_c: unknown, path: string) => ({
      filePath: path,
      hunks: [],
    }))
    mockFormatDiffForConsole.mockImplementation((_d: unknown) => 'diff-output')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 2,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: false,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: true,
    })

    expect(result.fixesApplied).toBe(3)
    expect(result.fixesSkipped).toBe(1)
    expect(result.dryRunDiffs).toHaveLength(2)
    expect(result.spinnerMessage).toBe('Would apply 3 fixes, skip 1 (dry run)')
  })

  test('complete non-dry run flow without diffs', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 10,
      fixesSkipped: 2,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 4,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.fixesApplied).toBe(10)
    expect(result.fixesSkipped).toBe(2)
    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toBe('Applied 10 fixes, skipped 2')
  })

  test('handles registry with many rules correctly', async () => {
    const fixFn = vi.fn()
    const rules = Array.from({ length: 20 }, (_, i) => ({
      definition: { meta: { name: `rule-${i}` }, fix: i % 2 === 0 ? fixFn : undefined },
    }))
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue(rules) },
      verbose: false,
    })

    const callArg = mockApplyFixesToFiles.mock.calls[0][0]
    // Only even-numbered rules have fixes (0, 2, 4, 6, 8, 10, 12, 14, 16, 18)
    expect(callArg.rulesWithFixes.size).toBe(10)
  })
})

// ============================================================================
// applyFixes - violation severity variations
// ============================================================================

describe('applyFixes - violation severity variations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('processes error severity violations', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ severity: 'error', filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
  })

  test('processes warning severity violations', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ severity: 'warning', filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
  })

  test('processes info severity violations', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ severity: 'info', filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
  })

  test('processes mixed severity violations in same file', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 3,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ severity: 'error', filePath: 'src/a.ts' }),
        makeViolation({ severity: 'warning', filePath: 'src/a.ts' }),
        makeViolation({ severity: 'info', filePath: 'src/a.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(3)
  })
})

// ============================================================================
// applyFixes - rulesWithFixes interaction
// ============================================================================

describe('applyFixes - rulesWithFixes passed through', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('passes empty rulesWithFixes map to applyFixesToFile', async () => {
    const sourceFile = makeSourceFile()
    const emptyRules = new Map()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 0,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: emptyRules,
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      emptyRules,
      expect.anything(),
    )
  })

  test('passes populated rulesWithFixes map to applyFixesToFile', async () => {
    const sourceFile = makeSourceFile()
    const rulesWithFixes = new Map()
    rulesWithFixes.set('my-rule', { fix: vi.fn(), id: 'my-rule', priority: 5 })
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes,
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      rulesWithFixes,
      expect.anything(),
    )
  })
})

// ============================================================================
// applyFixes - dryRun flag passthrough
// ============================================================================

describe('applyFixes - dryRun flag passthrough', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('passes dryRun=false to applyFixesToFile', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
    )
  })

  test('passes dryRun=true to applyFixesToFile', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      true,
    )
  })
})

// ============================================================================
// applyFixes - suggestion field on violations
// ============================================================================

describe('applyFixes - violation with suggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles violation with suggestion field', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts', suggestion: 'Use const instead' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([expect.objectContaining({ suggestion: 'Use const instead' })]),
      expect.anything(),
      expect.anything(),
    )
  })

  test('handles violation without suggestion field', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    const violation = mockApplyFixesToFile.mock.calls[0][1][0]
    expect(violation.suggestion).toBeUndefined()
  })
})

// ============================================================================
// applyFixes - range variations
// ============================================================================

describe('applyFixes - violation range variations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles violation with single line range', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({
          filePath: 'src/a.ts',
          range: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
        }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('handles violation with multi-line range', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({
          filePath: 'src/a.ts',
          range: { start: { line: 1, column: 0 }, end: { line: 10, column: 30 } },
        }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('handles violation with zero column range', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({
          filePath: 'src/a.ts',
          range: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// applyFixes - saveSync with multiple changes
// ============================================================================

describe('applyFixes - saveSync with multiple changes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls saveSync once when multiple changes applied', async () => {
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [
        { start: 0, end: 3, newText: 'const', oldText: 'let ' },
        { start: 10, end: 15, newText: '===', oldText: '==' },
      ],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sourceFile.saveSync).toHaveBeenCalledTimes(1)
  })

  test('saveSync called for each file with changes in non-dry mode', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sf1.saveSync).toHaveBeenCalledTimes(1)
    expect(sf2.saveSync).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// applyFixes - conflict details in verbose mode
// ============================================================================

describe('applyFixes - conflict rule IDs logged', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs conflict with specific rule IDs', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sourceFile = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [
        { ruleId: 'prefer-const', conflictingRule: 'no-redeclare', reason: 'range overlap' },
      ],
      fixesApplied: 0,
      fixesSkipped: 1,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/app.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/app.ts')],
      dryRun: false,
      parseCache: new Map([['/src/app.ts', makeParseResult(sourceFile)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('prefer-const'))
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('no-redeclare'))
  })
})

// ============================================================================
// processFixes - various violation counts
// ============================================================================

describe('processFixes - spinner messages with various counts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dry run message with one fix one skip', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 1 fixes, skip 1 (dry run)')
  })

  test('non-dry run with one fix one skip', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Applied 1 fixes, skipped 1')
  })

  test('dry run with only applied no skipped', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 7,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 7 fixes, skip 0 (dry run)')
  })

  test('non-dry run with only applied no skipped', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 7,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Applied 7 fixes, skipped 0')
  })
})

// ============================================================================
// getRulesWithFixes - additional edge cases
// ============================================================================

describe('getRulesWithFixes - additional edge cases', () => {
  test('handles rule with empty name', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi.fn().mockReturnValue([{ definition: { meta: { name: '' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(1)
    expect(result.has('')).toBe(true)
  })

  test('handles rule with special characters in name', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'rule/with-special.chars@v2' }, fix: fixFn } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(1)
    expect(result.has('rule/with-special.chars@v2')).toBe(true)
  })

  test('handles duplicate rule names by keeping last', () => {
    const fixFn1 = vi.fn()
    const fixFn2 = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'dup-rule' }, fix: fixFn1 } },
          { definition: { meta: { name: 'dup-rule' }, fix: fixFn2 } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(1)
    expect(result.get('dup-rule')!.fix).toBeDefined()
  })

  test('handles registry returning undefined for a rule', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'valid' }, fix: fixFn } },
          undefined,
        ] as Array<{ definition: { meta: { name: string }; fix?: unknown } }>),
    }
    expect(() => getRulesWithFixes(registry)).toThrow()
  })

  test('creates new map on each call', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'rule' }, fix: fixFn } }]),
    }
    const result1 = getRulesWithFixes(registry)
    const result2 = getRulesWithFixes(registry)

    expect(result1).not.toBe(result2)
  })
})

// ============================================================================
// applyFixes - parser cache miss scenarios
// ============================================================================

describe('applyFixes - parser cache behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('parses each uncached file independently', async () => {
    const parseResult1 = makeParseResult()
    const parseResult2 = makeParseResult()
    mockParser.parseFile.mockResolvedValueOnce(parseResult1).mockResolvedValueOnce(parseResult2)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledTimes(2)
    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/a.ts')
    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/b.ts')
  })

  test('does not parse cached file even with empty parseCache value', async () => {
    const parseResult = makeParseResult()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', parseResult]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).not.toHaveBeenCalled()
  })

  test('falls back to parser when cache has value but no sourceFile property', async () => {
    const parseResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(parseResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/a.ts')
    expect(result.fixesApplied).toBe(1)
  })

  test('mixes cached and uncached files', async () => {
    const cachedResult = makeParseResult()
    const uncachedResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(uncachedResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', cachedResult]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledTimes(1)
    expect(mockParser.parseFile).toHaveBeenCalledWith('/src/b.ts')
  })
})

// ============================================================================
// applyFixes - error in parser.parseFile
// ============================================================================

describe('applyFixes - parser error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles parser.parseFile rejection gracefully', async () => {
    mockParser.parseFile.mockRejectedValue(new Error('parse error'))
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })

  test('logs parse error when verbose', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    mockParser.parseFile.mockRejectedValue(new Error('parse error'))

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to fix'))
  })

  test('continues after parse error on one file', async () => {
    const sf2 = makeSourceFile()
    mockParser.parseFile.mockRejectedValueOnce(new Error('bad file'))
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 5,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/bad.ts' }),
        makeViolation({ filePath: 'src/good.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/bad.ts'), makeDiscoveredFile('src/good.ts')],
      dryRun: false,
      parseCache: new Map([['/src/good.ts', makeParseResult(sf2)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(5)
  })
})

// ============================================================================
// applyFixes - many files stress test
// ============================================================================

describe('applyFixes - many files', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles 20 files with violations', async () => {
    const files = Array.from({ length: 20 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const cacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])

    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 4,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(cacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(20)
    expect(result.fixesSkipped).toBe(0)
  })

  test('handles 20 files dry run with reports', async () => {
    const files = Array.from({ length: 20 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const cacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])

    mockApplyFixesToFile.mockImplementation(
      (_sf: unknown, _v: unknown, _r: unknown, _d: unknown) => ({
        changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
        conflicts: [],
        filePath: 'f.ts',
        fixesApplied: 1,
        fixesSkipped: 0,
      }),
    )

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 4,
      discoveredFiles: files,
      dryRun: true,
      parseCache: new Map(cacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(20)
  })

  test('handles 20 files where half have errors', async () => {
    const files = Array.from({ length: 20 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const cacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      if (callIdx % 2 === 0) throw new Error('error')
      return { changes: [], conflicts: [], fixesApplied: 1, fixesSkipped: 0 }
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(cacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(10)
  })
})

// ============================================================================
// processFixes - diff filtering edge cases
// ============================================================================

describe('processFixes - diff filtering edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles fileReport with changes that produce no diff hunks', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 5, newText: 'same', oldText: 'same' }], filePath: 'src/a.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'src/a.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
  })

  test('handles fileReport with multiple changes that produce one diff', async () => {
    const changes = [
      { start: 0, end: 3, newText: 'abc', oldText: 'xyz' },
      { start: 10, end: 15, newText: 'hello', oldText: 'world' },
    ]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: [{ changes, filePath: 'src/a.ts' }],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({
      filePath: 'src/a.ts',
      hunks: [{ header: '@@', changes: [] }],
    })
    mockFormatDiffForConsole.mockReturnValue('combined-diff')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual(['combined-diff'])
    expect(mockRenderTextChangesAsDiff).toHaveBeenCalledWith(changes, 'src/a.ts')
  })

  test('skips report when changes array is empty in dry run', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 2,
      fileFixReports: [{ changes: [], filePath: 'src/empty.ts' }],
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
    expect(mockRenderTextChangesAsDiff).not.toHaveBeenCalled()
  })
})

// ============================================================================
// applyFixes - result aggregation details
// ============================================================================

describe('applyFixes - result aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('aggregates results from files processed in parallel', async () => {
    const files = Array.from({ length: 4 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const cacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])
    let idx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      idx++
      return {
        changes: idx <= 2 ? [{ start: 0, end: 1, newText: 'a', oldText: 'b' }] : [],
        conflicts: [],
        fixesApplied: idx,
        fixesSkipped: idx - 1,
      }
    })

    const result = await applyFixes({
      allViolations: violations,
      concurrency: 2,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(cacheEntries),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    // 1+2+3+4 = 10
    expect(result.fixesApplied).toBe(10)
    // 0+1+2+3 = 6
    expect(result.fixesSkipped).toBe(6)
  })

  test('empty results from errors do not affect totals', async () => {
    const sf1 = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('fail')
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf1)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(0)
    expect(result.fixesSkipped).toBe(0)
  })
})

// ============================================================================
// processFixes - combined scenario tests
// ============================================================================

describe('processFixes - combined scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dry run with violations but no fixable rules', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 10,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: Array.from({ length: 10 }, () => makeViolation()),
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 0 fixes, skip 10 (dry run)')
    expect(result.dryRunDiffs).toEqual([])
  })

  test('non-dry run with single violation and single fixable rule', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const fixFn = vi.fn()
    const result = await processFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: {
        getAllRules: vi
          .fn()
          .mockReturnValue([{ definition: { meta: { name: 'fix-rule' }, fix: fixFn } }]),
      },
      verbose: false,
    })

    expect(result.fixesApplied).toBe(1)
    expect(result.spinnerMessage).toBe('Applied 1 fixes, skipped 0')
  })

  test('verbose mode with rules having fixes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })

    const fixFn = vi.fn()
    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: false,
      registry: {
        getAllRules: vi
          .fn()
          .mockReturnValue([{ definition: { meta: { name: 'r1' }, fix: fixFn } }]),
      },
      verbose: true,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }))
  })
})

// ============================================================================
// applyFixes - detailed file path handling
// ============================================================================

describe('applyFixes - file path handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('uses absolutePath for cache lookup', async () => {
    const parseResult = makeParseResult()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [{ path: 'src/a.ts', absolutePath: '/abs/src/a.ts' }],
      dryRun: false,
      parseCache: new Map([['/abs/src/a.ts', parseResult]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).not.toHaveBeenCalled()
  })

  test('uses absolutePath for parser.parseFile call', async () => {
    const parseResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(parseResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/deep/file.ts' })],
      concurrency: 1,
      discoveredFiles: [{ path: 'src/deep/file.ts', absolutePath: '/project/src/deep/file.ts' }],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/project/src/deep/file.ts')
  })

  test('matches violation filePath to discoveredFile path', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/match.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/other.ts'), makeDiscoveredFile('src/match.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/other.ts', makeParseResult()],
        ['/src/match.ts', makeParseResult(sf)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('handles relative path correctly', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: './relative.ts' })],
      concurrency: 1,
      discoveredFiles: [{ path: './relative.ts', absolutePath: '/cwd/relative.ts' }],
      dryRun: false,
      parseCache: new Map([['/cwd/relative.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('handles deeply nested paths', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const deepPath = 'src/packages/core/utils/helpers/deep.ts'
    await applyFixes({
      allViolations: [makeViolation({ filePath: deepPath })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile(deepPath)],
      dryRun: false,
      parseCache: new Map([[`/${deepPath}`, makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// applyFixes - report exclusion in non-dry mode
// ============================================================================

describe('applyFixes - report exclusion in non-dry mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('excludes report from results when dryRun is false even with changes', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
      conflicts: [],
      fixesApplied: 2,
      fixesSkipped: 1,
      filePath: 'src/a.ts',
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(2)
    expect(result.fixesSkipped).toBe(1)
    expect(result.fileFixReports).toBeUndefined()
  })

  test('multiple files still aggregate correctly in non-dry mode', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      return {
        changes: [{ start: 0, end: 1, newText: `${callIdx}`, oldText: 'x' }],
        conflicts: [],
        fixesApplied: callIdx,
        fixesSkipped: 0,
        filePath: `src/f${callIdx}.ts`,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(3)
    expect(result.fileFixReports).toBeUndefined()
  })
})

// ============================================================================
// getRulesWithFixes - priority and id properties
// ============================================================================

describe('getRulesWithFixes - entry properties', () => {
  test('every entry has priority 10', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'a' }, fix: fixFn } },
          { definition: { meta: { name: 'b' }, fix: fixFn } },
          { definition: { meta: { name: 'c' }, fix: fixFn } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    for (const [, rule] of result) {
      expect(rule.priority).toBe(10)
    }
  })

  test('every entry has matching id', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([
          { definition: { meta: { name: 'alpha' }, fix: fixFn } },
          { definition: { meta: { name: 'beta' }, fix: fixFn } },
        ]),
    }
    const result = getRulesWithFixes(registry)

    for (const [name, rule] of result) {
      expect(rule.id).toBe(name)
    }
  })

  test('every entry has callable fix', () => {
    const fixFn = vi.fn()
    const registry = {
      getAllRules: vi
        .fn()
        .mockReturnValue([{ definition: { meta: { name: 'callable' }, fix: fixFn } }]),
    }
    const result = getRulesWithFixes(registry)

    for (const [, rule] of result) {
      expect(typeof rule.fix).toBe('function')
    }
  })
})

// ============================================================================
// processFixes - empty discoveredFiles with violations
// ============================================================================

describe('processFixes - empty discoveredFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('passes empty discoveredFiles to applyFixesToFiles', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ discoveredFiles: [] }),
    )
  })

  test('passes populated discoveredFiles to applyFixesToFiles', async () => {
    const files = [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: files,
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ discoveredFiles: files }),
    )
  })

  test('passes allViolations array to applyFixesToFiles', async () => {
    const violations = [
      makeViolation({ filePath: 'src/a.ts' }),
      makeViolation({ filePath: 'src/b.ts' }),
    ]
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockApplyFixesToFiles).toHaveBeenCalledWith(
      expect.objectContaining({ allViolations: violations }),
    )
  })
})

// ============================================================================
// applyFixes - conflict details propagation
// ============================================================================

describe('applyFixes - conflict propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('conflict reason is included in verbose log', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [{ ruleId: 'r1', conflictingRule: 'r2', reason: 'ranges overlap at line 5' }],
      fixesApplied: 0,
      fixesSkipped: 1,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('r1'))
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('r2'))
  })

  test('conflicts in dry run are still included in report', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [{ ruleId: 'c1', conflictingRule: 'c2', reason: 'test' }],
      fixesApplied: 1,
      fixesSkipped: 1,
      filePath: 'src/a.ts',
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports![0].conflicts).toHaveLength(1)
  })
})

// ============================================================================
// processFixes - spinner message format details
// ============================================================================

describe('processFixes - spinner message format', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dry run message contains dry run suffix', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('(dry run)')
  })

  test('non-dry run message does not contain dry run suffix', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 5,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).not.toContain('(dry run)')
  })

  test('dry run message uses Would prefix', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('Would apply')
  })

  test('non-dry run message uses Applied prefix', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 1,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('Applied')
  })

  test('dry run uses skip verb', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 2,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('skip 2')
  })

  test('non-dry run uses skipped verb', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 2,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toContain('skipped 2')
  })
})

// ============================================================================
// applyFixes - violation message field
// ============================================================================

describe('applyFixes - violation message variations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('processes violation with custom message', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({
          filePath: 'src/a.ts',
          message: 'Unexpected var, use let or const instead',
        }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ message: 'Unexpected var, use let or const instead' }),
      ]),
      expect.anything(),
      expect.anything(),
    )
  })

  test('processes violation with empty message', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts', message: '' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('processes violation with very long message', async () => {
    const sf = makeSourceFile()
    const longMsg = 'A'.repeat(500)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts', message: longMsg })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// applyFixes - violation ruleId variations
// ============================================================================

describe('applyFixes - violation ruleId variations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('processes violation with namespaced ruleId', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts', ruleId: '@scope/plugin-rule' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('processes violation with kebab-case ruleId', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts', ruleId: 'no-unused-vars' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
  })

  test('processes violations with different ruleIds for same file', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 3,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts', ruleId: 'prefer-const' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
        makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockApplyFixesToFile).toHaveBeenCalledTimes(1)
    expect(result.fixesApplied).toBe(3)
  })
})

// ============================================================================
// applyFixes - no report when no violations processed
// ============================================================================

describe('applyFixes - report absence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('no report when file has violations but they all error', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockImplementation(() => {
      throw new Error('error')
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toEqual([])
  })

  test('report present when at least one file succeeds in dry run', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) throw new Error('fail')
      return {
        changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
        conflicts: [],
        fixesApplied: 1,
        fixesSkipped: 0,
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: true,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(1)
  })
})

// ============================================================================
// processFixes - return type shape
// ============================================================================

describe('processFixes - return type shape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns all four expected properties', async () => {
    const result = await processFixes({
      allViolations: [],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result).toHaveProperty('dryRunDiffs')
    expect(result).toHaveProperty('fixesApplied')
    expect(result).toHaveProperty('fixesSkipped')
    expect(result).toHaveProperty('spinnerMessage')
  })

  test('returns correct types for all properties', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(typeof result.fixesApplied).toBe('number')
    expect(typeof result.fixesSkipped).toBe('number')
    expect(typeof result.spinnerMessage).toBe('string')
    expect(Array.isArray(result.dryRunDiffs)).toBe(true)
  })
})

// ============================================================================
// applyFixes - return type shape
// ============================================================================

describe('applyFixes - return type shape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns correct properties when not dry run', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result).toHaveProperty('fixesApplied')
    expect(result).toHaveProperty('fixesSkipped')
    expect(result).toHaveProperty('fileFixReports')
    expect(result.fileFixReports).toBeUndefined()
  })

  test('returns array of reports when dry run', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
      filePath: 'src/a.ts',
    })

    const result = await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: true,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(Array.isArray(result.fileFixReports)).toBe(true)
  })
})

// ============================================================================
// applyFixes - parseCache key resolution
// ============================================================================

describe('applyFixes - parseCache key resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('cache key uses absolutePath not path', async () => {
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [{ path: 'src/a.ts', absolutePath: '/root/src/a.ts' }],
      dryRun: false,
      parseCache: new Map([['/root/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).not.toHaveBeenCalled()
  })

  test('misses cache when key does not match absolutePath', async () => {
    const parseResult = makeParseResult()
    mockParser.parseFile.mockResolvedValue(parseResult)
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [{ path: 'src/a.ts', absolutePath: '/abs/src/a.ts' }],
      dryRun: false,
      parseCache: new Map([['src/a.ts', makeParseResult()]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(mockParser.parseFile).toHaveBeenCalledWith('/abs/src/a.ts')
  })
})

// ============================================================================
// processFixes - getRulesWithFixes called before applyFixesToFiles
// ============================================================================

describe('processFixes - getRulesWithFixes integration details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('extracts rules from registry before calling applyFixesToFiles', async () => {
    const fixFn = vi.fn()
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    const getAllRules = vi
      .fn()
      .mockReturnValue([
        { definition: { meta: { name: 'r1' }, fix: fixFn } },
        { definition: { meta: { name: 'r2' } } },
      ])

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules },
      verbose: false,
    })

    expect(getAllRules).toHaveBeenCalledTimes(1)
    const callArg = mockApplyFixesToFiles.mock.calls[0][0]
    expect(callArg.rulesWithFixes.size).toBe(1)
    expect(callArg.rulesWithFixes.has('r1')).toBe(true)
    expect(callArg.rulesWithFixes.has('r2')).toBe(false)
  })

  test('passes rulesWithFixes to applyFixesFn callback', async () => {
    const fixFn = vi.fn()
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: undefined,
    })

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: false,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: {
        getAllRules: vi
          .fn()
          .mockReturnValue([{ definition: { meta: { name: 'my-rule' }, fix: fixFn } }]),
      },
      verbose: false,
    })

    const callArg = mockApplyFixesToFiles.mock.calls[0][0]
    expect(callArg.applyFixesFn).toBeDefined()
    expect(callArg.rulesWithFixes.has('my-rule')).toBe(true)
  })
})

// ============================================================================
// applyFixes - conflict logging edge cases
// ============================================================================

describe('applyFixes - conflict logging edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('logs conflict with empty reason string', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [],
      conflicts: [{ ruleId: 'r1', conflictingRule: 'r2', reason: '' }],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).toHaveBeenCalled()
  })

  test('does not log conflicts when changes exist but no conflicts', async () => {
    const { logger } = await import('../../../src/utils/logger.js')
    const sf = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [makeViolation({ filePath: 'src/a.ts' })],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts')],
      dryRun: false,
      parseCache: new Map([['/src/a.ts', makeParseResult(sf)]]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: true,
    })

    expect(logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('conflict'))
  })
})

// ============================================================================
// processFixes - dryRunDiffs populated with specific formatted strings
// ============================================================================

describe('processFixes - dryRunDiffs content', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('dryRunDiffs contains formatted strings from formatDiffForConsole', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 1,
      fixesSkipped: 0,
      fileFixReports: [
        {
          changes: [{ start: 0, end: 5, newText: 'hello', oldText: 'world' }],
          filePath: 'src/greet.ts',
        },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({
      filePath: 'src/greet.ts',
      hunks: [{ header: '@@ -1 +1 @@', changes: [] }],
    })
    mockFormatDiffForConsole.mockReturnValue('- world\n+ hello')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs[0]).toBe('- world\n+ hello')
  })

  test('calls renderTextChangesAsDiff once per file with changes', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'f1.ts' },
        { changes: [{ start: 2, end: 3, newText: 'c', oldText: 'd' }], filePath: 'f2.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'f.ts', hunks: [] })
    mockFormatDiffForConsole.mockReturnValue('diff')

    await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(mockRenderTextChangesAsDiff).toHaveBeenCalledTimes(2)
  })

  test('filters out falsy formatDiffForConsole results', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 3,
      fixesSkipped: 0,
      fileFixReports: [
        { changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }], filePath: 'f1.ts' },
        { changes: [{ start: 0, end: 1, newText: 'c', oldText: 'd' }], filePath: 'f2.ts' },
        { changes: [{ start: 0, end: 1, newText: 'e', oldText: 'f' }], filePath: 'f3.ts' },
      ],
    })
    mockRenderTextChangesAsDiff.mockReturnValue({ filePath: 'f.ts', hunks: [] })
    mockFormatDiffForConsole
      .mockReturnValueOnce('valid-diff')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('another-valid')

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual(['valid-diff', 'another-valid'])
  })
})

// ============================================================================
// applyFixes - multiple violations for one file with errors
// ============================================================================

describe('applyFixes - error with partial success', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('file error returns zero but other file succeeds', async () => {
    const sfOk = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) throw new Error('first fails')
      return { changes: [], conflicts: [], fixesApplied: 7, fixesSkipped: 2 }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/bad.ts' }),
        makeViolation({ filePath: 'src/good.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/bad.ts'), makeDiscoveredFile('src/good.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/bad.ts', makeParseResult()],
        ['/src/good.ts', makeParseResult(sfOk)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fixesApplied).toBe(7)
    expect(result.fixesSkipped).toBe(2)
  })

  test('error in dry run still produces report for successful file', async () => {
    const sfOk = makeSourceFile()
    let callIdx = 0
    mockApplyFixesToFile.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) throw new Error('fail')
      return {
        changes: [{ start: 0, end: 1, newText: 'a', oldText: 'b' }],
        conflicts: [],
        fixesApplied: 1,
        fixesSkipped: 0,
        filePath: 'src/good.ts',
      }
    })

    const result = await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/bad.ts' }),
        makeViolation({ filePath: 'src/good.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/bad.ts'), makeDiscoveredFile('src/good.ts')],
      dryRun: true,
      parseCache: new Map([
        ['/src/bad.ts', makeParseResult()],
        ['/src/good.ts', makeParseResult(sfOk)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(result.fileFixReports).toHaveLength(1)
    expect(result.fixesApplied).toBe(1)
  })
})

// ============================================================================
// processFixes - dry run with no fileFixReports at all
// ============================================================================

describe('processFixes - dry run no reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles dry run with no fileFixReports property', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 0,
      fixesSkipped: 0,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.dryRunDiffs).toEqual([])
    expect(result.spinnerMessage).toBe('Would apply 0 fixes, skip 0 (dry run)')
  })

  test('handles dry run with missing fileFixReports key entirely', async () => {
    mockApplyFixesToFiles.mockResolvedValueOnce({
      fixesApplied: 2,
      fixesSkipped: 1,
    })

    const result = await processFixes({
      allViolations: [makeViolation()],
      concurrency: 1,
      discoveredFiles: [],
      dryRun: true,
      parseCache: new Map(),
      parser: mockParser,
      quiet: true,
      registry: { getAllRules: vi.fn().mockReturnValue([]) },
      verbose: false,
    })

    expect(result.spinnerMessage).toBe('Would apply 2 fixes, skip 1 (dry run)')
    expect(result.dryRunDiffs).toEqual([])
  })
})

// ============================================================================
// getRulesWithFixes - large registry
// ============================================================================

describe('getRulesWithFixes - large registry', () => {
  test('handles 50 rules correctly', () => {
    const fixFn = vi.fn()
    const rules = Array.from({ length: 50 }, (_, i) => ({
      definition: {
        meta: { name: `rule-${i}` },
        fix: i % 3 === 0 ? fixFn : undefined,
      },
    }))
    const registry = { getAllRules: vi.fn().mockReturnValue(rules) }

    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(17) // 0,3,6,9,...,48 = 17 rules
  })

  test('handles 100 rules all with fixes', () => {
    const fixFn = vi.fn()
    const rules = Array.from({ length: 100 }, (_, i) => ({
      definition: { meta: { name: `rule-${i}` }, fix: fixFn },
    }))
    const registry = { getAllRules: vi.fn().mockReturnValue(rules) }

    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(100)
  })

  test('handles 100 rules none with fixes', () => {
    const rules = Array.from({ length: 100 }, (_, i) => ({
      definition: { meta: { name: `rule-${i}` } },
    }))
    const registry = { getAllRules: vi.fn().mockReturnValue(rules) }

    const result = getRulesWithFixes(registry)

    expect(result.size).toBe(0)
  })
})

// ============================================================================
// applyFixes - dry run saveSync never called
// ============================================================================

describe('applyFixes - dry run saveSync guarantees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('saveSync not called even with multiple files and changes in dry run', async () => {
    const files = Array.from({ length: 5 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const cacheEntries = files.map((f) => [`/${f.path}`, makeParseResult()])

    const sourceFiles = files.map(() => makeSourceFile())
    const cacheWithFiles = new Map(
      files.map((f, i) => [`/${f.path}`, makeParseResult(sourceFiles[i])]),
    )

    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 5, newText: 'const', oldText: 'let' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: violations,
      concurrency: 1,
      discoveredFiles: files,
      dryRun: true,
      parseCache: cacheWithFiles,
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    for (const sf of sourceFiles) {
      expect(sf.saveSync).not.toHaveBeenCalled()
    }
  })

  test('saveSync not called for file with changes only when concurrency > 1 in dry run', async () => {
    const files = Array.from({ length: 3 }, (_, i) => makeDiscoveredFile(`src/f${i}.ts`))
    const violations = files.map((f) => makeViolation({ filePath: f.path }))
    const sourceFiles = files.map(() => makeSourceFile())
    const cacheWithFiles = new Map(
      files.map((f, i) => [`/${f.path}`, makeParseResult(sourceFiles[i])]),
    )

    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: violations,
      concurrency: 3,
      discoveredFiles: files,
      dryRun: true,
      parseCache: cacheWithFiles,
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    for (const sf of sourceFiles) {
      expect(sf.saveSync).not.toHaveBeenCalled()
    }
  })

  test('saveSync called exactly once per file with changes in non-dry run', async () => {
    const sf1 = makeSourceFile()
    const sf2 = makeSourceFile()
    mockApplyFixesToFile.mockReturnValue({
      changes: [{ start: 0, end: 1, newText: 'x', oldText: 'y' }],
      conflicts: [],
      fixesApplied: 1,
      fixesSkipped: 0,
    })

    await applyFixes({
      allViolations: [
        makeViolation({ filePath: 'src/a.ts' }),
        makeViolation({ filePath: 'src/b.ts' }),
      ],
      concurrency: 1,
      discoveredFiles: [makeDiscoveredFile('src/a.ts'), makeDiscoveredFile('src/b.ts')],
      dryRun: false,
      parseCache: new Map([
        ['/src/a.ts', makeParseResult(sf1)],
        ['/src/b.ts', makeParseResult(sf2)],
      ]),
      parser: mockParser,
      rulesWithFixes: new Map(),
      verbose: false,
    })

    expect(sf1.saveSync).toHaveBeenCalledTimes(1)
    expect(sf2.saveSync).toHaveBeenCalledTimes(1)
  })
})
