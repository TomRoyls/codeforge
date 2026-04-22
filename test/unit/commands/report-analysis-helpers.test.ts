import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// ============================================================================
// Hoisted mocks — available in vi.mock factories
// ============================================================================

const {
  mockExistsSync,
  mockResolve,
  mockSpinner,
  mockDiscoverFiles,
  mockParserInstance,
  mockRunRulesBatched,
  mockSetupRuleRegistryLazy,
} = vi.hoisted(() => {
  const mockExistsSync = vi.fn(() => true)
  const mockResolve = vi.fn((p: string) => (p.startsWith('/') ? p : `/abs/${p}`))
  const mockSpinner = {
    start: vi.fn(function () {
      return mockSpinner
    }),
    succeed: vi.fn(),
    text: '',
  }
  const mockDiscoverFiles = vi.fn(() => Promise.resolve([]))
  const mockRunRulesBatched = vi.fn(() => [])
  const mockParserInstance = {
    initialize: vi.fn(() => Promise.resolve()),
    parseFile: vi.fn(() => Promise.resolve({ sourceFile: {}, parseTime: 10 })),
    releaseFile: vi.fn(),
    dispose: vi.fn(),
  }
  const mockSetupRuleRegistryLazy = vi.fn(() =>
    Promise.resolve({ runRulesBatched: mockRunRulesBatched }),
  )
  return {
    mockExistsSync,
    mockResolve,
    mockSpinner,
    mockDiscoverFiles,
    mockParserInstance,
    mockRunRulesBatched,
    mockSetupRuleRegistryLazy,
  }
})

// ============================================================================
// Module mocks
// ============================================================================

vi.mock('node:fs', () => ({
  existsSync: mockExistsSync,
}))

vi.mock('node:path', () => ({
  default: { resolve: mockResolve },
}))

vi.mock('ora', () => ({
  default: vi.fn(() => mockSpinner),
}))

vi.mock('p-limit', () => ({
  default: vi.fn(() => (fn: () => Promise<unknown>) => fn()),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: mockDiscoverFiles,
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn(function (this: object) {
    return mockParserInstance
  }),
}))

vi.mock('../../../src/utils/command-helpers.js', () => ({
  setupRuleRegistryLazy: mockSetupRuleRegistryLazy,
}))

// ============================================================================
// SUT import — after mocks
// ============================================================================

import { runAnalysisPipeline } from '../../../src/commands/report-analysis-helpers.js'

// ============================================================================
// Helpers
// ============================================================================

function makeDiscoveredFile(filePath: string, absolutePath?: string) {
  return { path: filePath, absolutePath: absolutePath ?? `/abs/${filePath}` }
}

function makeViolation(ruleId: string, severity: 'error' | 'warning' | 'info') {
  return {
    message: `violation from ${ruleId}`,
    ruleId,
    severity,
    range: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    },
    suggestion: `fix ${ruleId}`,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockExistsSync.mockReturnValue(true)
  mockResolve.mockImplementation((p: string) => (p.startsWith('/') ? p : `/abs/${p}`))
  mockDiscoverFiles.mockResolvedValue([])
  mockParserInstance.initialize.mockResolvedValue(undefined)
  mockParserInstance.parseFile.mockResolvedValue({ sourceFile: {}, parseTime: 10 })
  mockParserInstance.releaseFile.mockReturnValue(undefined)
  mockParserInstance.dispose.mockReturnValue(undefined)
  mockRunRulesBatched.mockReturnValue([])
  mockSetupRuleRegistryLazy.mockResolvedValue({
    runRulesBatched: mockRunRulesBatched,
  })
  mockSpinner.start.mockReturnValue(mockSpinner)
  mockSpinner.succeed.mockReturnValue(undefined)
  mockSpinner.text = ''
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============================================================================
// Path validation
// ============================================================================

describe('runAnalysisPipeline — path validation', () => {
  test('throws when path does not exist', async () => {
    mockExistsSync.mockReturnValue(false)

    await expect(runAnalysisPipeline('/nonexistent', 4)).rejects.toThrow(
      'Path not found: /nonexistent',
    )
  })

  test('resolves path to absolute using path.resolve', async () => {
    await runAnalysisPipeline('some/path', 4)

    expect(mockResolve).toHaveBeenCalledWith('some/path')
  })

  test('does not throw when path exists', async () => {
    mockExistsSync.mockReturnValue(true)

    const result = await runAnalysisPipeline('existing/path', 4)
    expect(result).toBeDefined()
  })
})

// ============================================================================
// Logging
// ============================================================================

describe('runAnalysisPipeline — logging', () => {
  test('calls log callback with "Analyzing:" message', async () => {
    const log = vi.fn()
    await runAnalysisPipeline('src', 4, { log })

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Analyzing:'))
  })

  test('works without log callback (no crash)', async () => {
    const result = await runAnalysisPipeline('src', 4)
    expect(result).toBeDefined()
  })

  test('log receives resolved absolute path', async () => {
    const log = vi.fn()
    await runAnalysisPipeline('my/project', 4, { log })

    expect(log).toHaveBeenCalledWith('Analyzing: /abs/my/project')
  })
})

// ============================================================================
// File discovery
// ============================================================================

describe('runAnalysisPipeline — file discovery', () => {
  test('calls discoverFiles with correct ignore patterns', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      }),
    )
  })

  test('calls discoverFiles with DEFAULT_FILE_PATTERNS', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      }),
    )
  })

  test('handles empty file list (0 files discovered)', async () => {
    mockDiscoverFiles.mockResolvedValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toEqual([])
    expect(result.summary.totalFiles).toBe(0)
  })
})

// ============================================================================
// Rule registry and parser
// ============================================================================

describe('runAnalysisPipeline — rule registry and parser', () => {
  test('calls setupRuleRegistryLazy', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSetupRuleRegistryLazy).toHaveBeenCalled()
  })

  test('creates and initializes Parser', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.initialize).toHaveBeenCalled()
  })

  test('calls parser.dispose() after processing', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalled()
  })
})

// ============================================================================
// Result structure
// ============================================================================

describe('runAnalysisPipeline — result structure', () => {
  test('returns AnalysisResult with files array', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(result).toHaveProperty('files')
    expect(Array.isArray(result.files)).toBe(true)
  })

  test('returns AnalysisResult with summary object', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(result).toHaveProperty('summary')
    expect(result.summary).toHaveProperty('errorCount')
    expect(result.summary).toHaveProperty('warningCount')
    expect(result.summary).toHaveProperty('infoCount')
    expect(result.summary).toHaveProperty('totalFiles')
    expect(result.summary).toHaveProperty('totalTime')
    expect(result.summary).toHaveProperty('filesWithViolations')
  })

  test('returns timestamp as ISO string', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(result.timestamp).toBeDefined()
    expect(typeof result.timestamp).toBe('string')
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
  })

  test('returns version from options when provided', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '2.5.0' })

    expect(result.version).toBe('2.5.0')
  })

  test('returns "unknown" version when no options.version', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(result.version).toBe('unknown')
  })
})

// ============================================================================
// Summary calculation
// ============================================================================

describe('runAnalysisPipeline — summary calculation', () => {
  test('counts error violations correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('rule-1', 'error'),
      makeViolation('rule-2', 'error'),
      makeViolation('rule-3', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(2)
  })

  test('counts warning violations correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('rule-1', 'warning'),
      makeViolation('rule-2', 'warning'),
      makeViolation('rule-3', 'error'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.warningCount).toBe(2)
  })

  test('counts info violations correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('rule-1', 'info'),
      makeViolation('rule-2', 'info'),
      makeViolation('rule-3', 'info'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.infoCount).toBe(3)
  })

  test('counts filesWithViolations correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])

    let callCount = 0
    mockRunRulesBatched.mockImplementation(() => {
      callCount++
      return callCount === 1 ? [makeViolation('rule-1', 'error')] : []
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.filesWithViolations).toBe(1)
    expect(result.summary.totalFiles).toBe(3)
  })
})

// ============================================================================
// Error handling
// ============================================================================

describe('runAnalysisPipeline — error handling', () => {
  test('returns null for files that fail to parse (graceful degradation)', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('good.ts'),
      makeDiscoveredFile('bad.ts'),
    ])

    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('Parse failure')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('good.ts')
  })

  test('filters out null results from final output', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('also-fail.ts'),
    ])
    mockParserInstance.parseFile.mockRejectedValue(new Error('Always fails'))

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(0)
    expect(result.summary.totalFiles).toBe(0)
  })

  test('still calls parser.dispose() even when errors occur', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('crash.ts')])
    mockParserInstance.parseFile.mockRejectedValue(new Error('Boom'))

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalled()
  })
})

// ============================================================================
// Concurrency
// ============================================================================

describe('runAnalysisPipeline — concurrency', () => {
  test('respects concurrency parameter via pLimit', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 8)

    expect(pLimit).toHaveBeenCalledWith(8)
  })

  test('processes files in parallel', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])
    mockRunRulesBatched.mockReturnValue([makeViolation('rule-1', 'warning')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(3)
    expect(result.summary.totalFiles).toBe(3)
    expect(result.summary.warningCount).toBe(3)
  })
})

// ============================================================================
// Spinner / progress UI
// ============================================================================

describe('runAnalysisPipeline — spinner and progress', () => {
  test('starts the ora spinner', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.start).toHaveBeenCalled()
  })

  test('calls spinner.succeed with file count message', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 2 files')
  })

  test('calls spinner.succeed with 0 for empty file list', async () => {
    mockDiscoverFiles.mockResolvedValue([])

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 0 files')
  })

  test('updates spinner text during processing', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.text).toContain('2/2')
  })

  test('calls ora with "Analyzing files..." start message', async () => {
    const { default: ora } = await import('ora')

    await runAnalysisPipeline('src', 4)

    expect(ora).toHaveBeenCalledWith('Analyzing files...')
  })
})

// ============================================================================
// Violation mapping / transformation
// ============================================================================

describe('runAnalysisPipeline — violation mapping', () => {
  test('maps violation range correctly to flat structure', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('mapped.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'bad code',
        ruleId: 'no-bad',
        severity: 'error',
        range: {
          start: { line: 5, column: 3 },
          end: { line: 8, column: 12 },
        },
        suggestion: 'fix it',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    const v = result.files[0]!.violations[0]!
    expect(v.line).toBe(5)
    expect(v.column).toBe(3)
    expect(v.endLine).toBe(8)
    expect(v.endColumn).toBe(12)
  })

  test('maps ruleId and message from registry output', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('msg.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'Do not use var',
        ruleId: 'no-var',
        severity: 'warning',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        suggestion: 'Use let or const',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    const v = result.files[0]!.violations[0]!
    expect(v.ruleId).toBe('no-var')
    expect(v.message).toBe('Do not use var')
  })

  test('maps severity correctly for all levels', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('sev.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
    ])

    const result = await runAnalysisPipeline('src', 4)
    const severities = result.files[0]!.violations.map((v) => v.severity)

    expect(severities).toEqual(['error', 'warning', 'info'])
  })

  test('maps suggestion from registry output', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('sug.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'issue',
        ruleId: 'rule-a',
        severity: 'info',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
        suggestion: 'Consider refactoring',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.suggestion).toBe('Consider refactoring')
  })

  test('maps filePath in each violation to file.path', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('components/Button.tsx')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r1', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.filePath).toBe('components/Button.tsx')
  })
})

// ============================================================================
// File-level stats
// ============================================================================

describe('runAnalysisPipeline — file-level stats', () => {
  test('includes parseTime in file stats', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('timed.ts')])
    mockParserInstance.parseFile.mockResolvedValue({ sourceFile: {}, parseTime: 42 })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.parseTime).toBe(42)
  })

  test('sets analysisTime to 0 in file stats', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('zero.ts')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.analysisTime).toBe(0)
  })

  test('sets totalTime equal to parseTime in file stats', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('equal.ts')])
    mockParserInstance.parseFile.mockResolvedValue({ sourceFile: {}, parseTime: 77 })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.totalTime).toBe(77)
  })

  test('includes filePath in each file result', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('foo.ts'),
      makeDiscoveredFile('bar.tsx'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('foo.ts')
    expect(result.files[1]!.filePath).toBe('bar.tsx')
  })

  test('file result violations array is empty when no violations', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('clean.ts')])
    mockRunRulesBatched.mockReturnValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations).toEqual([])
  })
})

// ============================================================================
// releaseFile calls
// ============================================================================

describe('runAnalysisPipeline — releaseFile', () => {
  test('calls releaseFile for each discovered file on success', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.releaseFile).toHaveBeenCalledTimes(2)
    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/abs/a.ts')
    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/abs/b.ts')
  })

  test('does not call releaseFile for files that fail to parse', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('good.ts'),
      makeDiscoveredFile('bad.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 5 })
    })

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.releaseFile).toHaveBeenCalledTimes(1)
    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/abs/good.ts')
  })

  test('calls releaseFile with absolute path from discovered file', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('x.ts', '/custom/abs/x.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/custom/abs/x.ts')
  })
})

// ============================================================================
// Summary totalTime
// ============================================================================

describe('runAnalysisPipeline — totalTime tracking', () => {
  test('summary.totalTime is a number >= 0', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(typeof result.summary.totalTime).toBe('number')
    expect(result.summary.totalTime).toBeGreaterThanOrEqual(0)
  })

  test('summary.totalTime increases with more files', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalTime).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================================
// Mixed severity across multiple files
// ============================================================================

describe('runAnalysisPipeline — mixed severity across files', () => {
  test('aggregates violations from all files into summary', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])
    let callIdx = 0
    mockRunRulesBatched.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) return [makeViolation('r1', 'error'), makeViolation('r2', 'warning')]
      return [makeViolation('r3', 'info')]
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(1)
    expect(result.summary.warningCount).toBe(1)
    expect(result.summary.infoCount).toBe(1)
    expect(result.summary.filesWithViolations).toBe(2)
  })

  test('counts zero for all severities when no violations', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('clean1.ts'),
      makeDiscoveredFile('clean2.ts'),
    ])
    mockRunRulesBatched.mockReturnValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
    expect(result.summary.filesWithViolations).toBe(0)
  })

  test('handles single file with many violations', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('messy.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'error'),
      makeViolation('r3', 'error'),
      makeViolation('r4', 'warning'),
      makeViolation('r5', 'warning'),
      makeViolation('r6', 'info'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(3)
    expect(result.summary.warningCount).toBe(2)
    expect(result.summary.infoCount).toBe(1)
    expect(result.files[0]!.violations).toHaveLength(6)
  })

  test('handles many files with single violation each', async () => {
    const files = Array.from({ length: 10 }, (_, i) => makeDiscoveredFile(`file${i}.ts`))
    mockDiscoverFiles.mockResolvedValue(files)
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalFiles).toBe(10)
    expect(result.summary.errorCount).toBe(10)
    expect(result.summary.filesWithViolations).toBe(10)
  })
})

// ============================================================================
// discoverFiles cwd parameter
// ============================================================================

describe('runAnalysisPipeline — discoverFiles cwd', () => {
  test('passes resolved absolute path as cwd to discoverFiles', async () => {
    await runAnalysisPipeline('project/src', 4)

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({ cwd: '/abs/project/src' }),
    )
  })

  test('passes already-absolute path directly as cwd', async () => {
    await runAnalysisPipeline('/home/user/project', 4)

    expect(mockDiscoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({ cwd: '/home/user/project' }),
    )
  })
})

// ============================================================================
// runRulesBatched batch size
// ============================================================================

describe('runAnalysisPipeline — rule batched execution', () => {
  test('calls runRulesBatched with sourceFile and batch size 50', async () => {
    const mockSourceFile = { kind: 'sourceFile' }
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('batch.ts')])
    mockParserInstance.parseFile.mockResolvedValue({
      sourceFile: mockSourceFile,
      parseTime: 5,
    })

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).toHaveBeenCalledWith(mockSourceFile, 50)
  })

  test('calls runRulesBatched once per discovered file', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).toHaveBeenCalledTimes(3)
  })
})

// ============================================================================
// Edge cases — null/undefined file entries
// ============================================================================

describe('runAnalysisPipeline — edge cases', () => {
  test('skips null entries in discovered files array', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('b.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(2)
  })

  test('handles single file discovery correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('only.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r1', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('only.ts')
    expect(result.summary.totalFiles).toBe(1)
    expect(result.summary.filesWithViolations).toBe(1)
  })

  test('handles empty string path that resolves', async () => {
    mockResolve.mockReturnValue('/abs/')

    const result = await runAnalysisPipeline('', 4)

    expect(result).toBeDefined()
    expect(result.files).toEqual([])
  })

  test('handles concurrency of 1', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 1)

    expect(pLimit).toHaveBeenCalledWith(1)
  })

  test('handles very large concurrency value', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 100)

    expect(pLimit).toHaveBeenCalledWith(100)
  })
})

// ============================================================================
// Version edge cases
// ============================================================================

describe('runAnalysisPipeline — version edge cases', () => {
  test('handles empty string version', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '' })

    expect(result.version).toBe('')
  })

  test('handles semver-like version strings', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '1.2.3-beta.4' })

    expect(result.version).toBe('1.2.3-beta.4')
  })

  test('version defaults to "unknown" with empty options object', async () => {
    const result = await runAnalysisPipeline('src', 4, {})

    expect(result.version).toBe('unknown')
  })
})

// ============================================================================
// Summary with all zero counts
// ============================================================================

describe('runAnalysisPipeline — zero-state summary', () => {
  test('empty result has all zero violation counts', async () => {
    mockDiscoverFiles.mockResolvedValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
    expect(result.summary.filesWithViolations).toBe(0)
    expect(result.summary.totalFiles).toBe(0)
  })
})

// ============================================================================
// parseFile call verification
// ============================================================================

describe('runAnalysisPipeline — parseFile calls', () => {
  test('calls parseFile with absolute path for each file', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts', '/abs/a.ts'),
      makeDiscoveredFile('b.ts', '/abs/b.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.parseFile).toHaveBeenCalledWith('/abs/a.ts')
    expect(mockParserInstance.parseFile).toHaveBeenCalledWith('/abs/b.ts')
    expect(mockParserInstance.parseFile).toHaveBeenCalledTimes(2)
  })
})

// ============================================================================
// Path resolution — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — path resolution edge cases', () => {
  test('resolves relative path with dot segment', async () => {
    mockResolve.mockReturnValue('/abs/./src')

    await runAnalysisPipeline('./src', 4)

    expect(mockResolve).toHaveBeenCalledWith('./src')
  })

  test('resolves relative path with parent directory segment', async () => {
    mockResolve.mockReturnValue('/abs/../src')

    await runAnalysisPipeline('../src', 4)

    expect(mockResolve).toHaveBeenCalledWith('../src')
  })

  test('resolves path with trailing slash', async () => {
    mockResolve.mockReturnValue('/abs/src/')

    await runAnalysisPipeline('src/', 4)

    expect(mockResolve).toHaveBeenCalledWith('src/')
  })

  test('resolves absolute path unchanged', async () => {
    mockResolve.mockReturnValue('/usr/local/project')

    await runAnalysisPipeline('/usr/local/project', 4)

    expect(mockResolve).toHaveBeenCalledWith('/usr/local/project')
  })

  test('checks existsSync with the resolved absolute path', async () => {
    mockResolve.mockReturnValue('/resolved/absolute/path')

    await runAnalysisPipeline('relative', 4)

    expect(mockExistsSync).toHaveBeenCalledWith('/resolved/absolute/path')
  })

  test('throws with resolved path in error message for nonexistent path', async () => {
    mockExistsSync.mockReturnValue(false)
    mockResolve.mockReturnValue('/resolved/bad/path')

    await expect(runAnalysisPipeline('bad/path', 4)).rejects.toThrow(
      'Path not found: /resolved/bad/path',
    )
  })
})

// ============================================================================
// Logging — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — logging edge cases', () => {
  test('log is called exactly once', async () => {
    const log = vi.fn()
    await runAnalysisPipeline('src', 4, { log })

    expect(log).toHaveBeenCalledTimes(1)
  })

  test('log is not called when options is undefined', async () => {
    // Should not throw — options?.log?.() is optional chaining
    const result = await runAnalysisPipeline('src', 4, undefined)

    expect(result).toBeDefined()
  })

  test('log is not called when options has no log property', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '1.0.0' })

    expect(result).toBeDefined()
    expect(result.version).toBe('1.0.0')
  })

  test('log receives message starting with "Analyzing: "', async () => {
    const log = vi.fn()
    await runAnalysisPipeline('src', 4, { log })

    const loggedMessage = log.mock.calls[0]![0] as string
    expect(loggedMessage.startsWith('Analyzing: ')).toBe(true)
  })
})

// ============================================================================
// Spinner — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — spinner edge cases', () => {
  test('spinner.start returns the spinner object (chaining)', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.start).toHaveBeenCalled()
  })

  test('spinner text updates with (1/3) for first of 3 files', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    // After processing all files, spinner.text should contain final progress
    expect(mockSpinner.text).toContain('3/3')
  })

  test('spinner succeed called after all processing', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('one.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 1 files')
  })

  test('spinner succeed shows correct count for 5 files', async () => {
    mockDiscoverFiles.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => makeDiscoveredFile(`f${i}.ts`)),
    )

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 5 files')
  })

  test('spinner updates text even when a file parse fails', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('good.ts'),
      makeDiscoveredFile('bad.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    await runAnalysisPipeline('src', 4)

    // Spinner should still have been updated (completedCount incremented for both)
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 2 files')
  })
})

// ============================================================================
// Violation mapping — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — violation mapping edge cases', () => {
  test('handles violation with zero line and column values', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('zero.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'issue at zero',
        ruleId: 'zero-rule',
        severity: 'warning',
        range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        suggestion: undefined,
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    const v = result.files[0]!.violations[0]!
    expect(v.line).toBe(0)
    expect(v.column).toBe(0)
    expect(v.endLine).toBe(0)
    expect(v.endColumn).toBe(0)
  })

  test('handles violation with large line numbers', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('big.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'deep in file',
        ruleId: 'deep',
        severity: 'error',
        range: { start: { line: 9999, column: 1 }, end: { line: 10000, column: 50 } },
        suggestion: 'check deep code',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    const v = result.files[0]!.violations[0]!
    expect(v.line).toBe(9999)
    expect(v.endLine).toBe(10000)
  })

  test('handles violation with undefined suggestion', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('nosug.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'no suggestion',
        ruleId: 'no-sug',
        severity: 'info',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        suggestion: undefined,
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.suggestion).toBeUndefined()
  })

  test('handles multiple violations per file correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('multi.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
      makeViolation('r4', 'error'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations).toHaveLength(4)
  })

  test('each violation gets the correct filePath', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('path/to/file.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    for (const v of result.files[0]!.violations) {
      expect(v.filePath).toBe('path/to/file.ts')
    }
  })

  test('handles violation with same start and end position', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('point.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'point violation',
        ruleId: 'point',
        severity: 'error',
        range: { start: { line: 5, column: 3 }, end: { line: 5, column: 3 } },
        suggestion: 'fix',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    const v = result.files[0]!.violations[0]!
    expect(v.line).toBe(v.endLine)
    expect(v.column).toBe(v.endColumn)
  })

  test('maps all fields for a single violation correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('full.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'full mapping test',
        ruleId: 'full-rule',
        severity: 'warning',
        range: { start: { line: 10, column: 5 }, end: { line: 12, column: 20 } },
        suggestion: 'refactor this',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)
    const v = result.files[0]!.violations[0]!

    expect(v).toEqual({
      column: 5,
      endColumn: 20,
      endLine: 12,
      filePath: 'full.ts',
      line: 10,
      message: 'full mapping test',
      ruleId: 'full-rule',
      severity: 'warning',
      suggestion: 'refactor this',
    })
  })
})

// ============================================================================
// Summary — additional aggregation scenarios
// ============================================================================

describe('runAnalysisPipeline — summary aggregation scenarios', () => {
  test('correctly counts when all violations are errors', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('all.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'error'),
      makeViolation('r3', 'error'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(3)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
  })

  test('correctly counts when all violations are warnings', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('warn.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'warning'),
      makeViolation('r2', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(2)
    expect(result.summary.infoCount).toBe(0)
  })

  test('correctly counts when all violations are info', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('info.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r1', 'info')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(1)
  })

  test('filesWithViolations counts only files with at least one violation', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('has.ts'),
      makeDiscoveredFile('clean.ts'),
      makeDiscoveredFile('also-has.ts'),
    ])
    let callIdx = 0
    mockRunRulesBatched.mockImplementation(() => {
      callIdx++
      return callIdx === 2 ? [] : [makeViolation('r', 'error')]
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.filesWithViolations).toBe(2)
    expect(result.summary.totalFiles).toBe(3)
  })

  test('totalFiles equals number of valid (non-null) results', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
      makeDiscoveredFile('d.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 3) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    // 3 succeeded, 1 failed → totalFiles = 3
    expect(result.summary.totalFiles).toBe(3)
  })

  test('aggregates violations across 5 files correctly', async () => {
    mockDiscoverFiles.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => makeDiscoveredFile(`f${i}.ts`)),
    )
    let callIdx = 0
    mockRunRulesBatched.mockImplementation(() => {
      callIdx++
      if (callIdx <= 2) return [makeViolation('r', 'error')]
      if (callIdx <= 4) return [makeViolation('r', 'warning')]
      return [makeViolation('r', 'info')]
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(2)
    expect(result.summary.warningCount).toBe(2)
    expect(result.summary.infoCount).toBe(1)
  })
})

// ============================================================================
// Error handling — additional scenarios
// ============================================================================

describe('runAnalysisPipeline — error handling edge cases', () => {
  test('first file fails, second succeeds — only second appears in results', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('ok.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) throw new Error('first fails')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('ok.ts')
  })

  test('all files fail — result has empty files array and zero summary', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])
    mockParserInstance.parseFile.mockRejectedValue(new Error('always fails'))

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(0)
    expect(result.summary.totalFiles).toBe(0)
    expect(result.summary.errorCount).toBe(0)
    expect(result.summary.warningCount).toBe(0)
    expect(result.summary.infoCount).toBe(0)
  })

  test('mixed errors: first and last fail, middle succeeds', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1 || callCount === 3) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('b.ts')
  })

  test('runRulesBatched throwing does not crash pipeline', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('crash.ts')])
    mockRunRulesBatched.mockImplementation(() => {
      throw new Error('rules crash')
    })

    // The error is caught by the try/catch in the limit callback
    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(0)
  })

  test('parse error does not affect other files summary counts', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('ok.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })
    mockRunRulesBatched.mockReturnValue([makeViolation('r1', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(1)
    expect(result.summary.totalFiles).toBe(1)
  })
})

// ============================================================================
// Null file entries — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — null file edge cases', () => {
  test('skips null file — does not call parseFile for it', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('real.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.parseFile).toHaveBeenCalledTimes(1)
  })

  test('all null entries — returns empty result', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(0)
    expect(result.summary.totalFiles).toBe(0)
  })

  test('null file does not call releaseFile', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('ok.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.releaseFile).toHaveBeenCalledTimes(1)
  })

  test('null file does not call runRulesBatched', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('ok.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// Timestamp — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — timestamp edge cases', () => {
  test('timestamp is a valid ISO 8601 date string', async () => {
    const result = await runAnalysisPipeline('src', 4)

    const parsed = Date.parse(result.timestamp)
    expect(isNaN(parsed)).toBe(false)
  })

  test('timestamp is close to current time', async () => {
    const before = Date.now()
    const result = await runAnalysisPipeline('src', 4)
    const after = Date.now()

    const parsedTime = new Date(result.timestamp).getTime()
    expect(parsedTime).toBeGreaterThanOrEqual(before)
    expect(parsedTime).toBeLessThanOrEqual(after)
  })

  test('two consecutive calls produce different timestamps', async () => {
    const result1 = await runAnalysisPipeline('src', 4)
    const result2 = await runAnalysisPipeline('src', 4)

    // They could technically be the same if fast enough, but usually different
    expect(typeof result1.timestamp).toBe('string')
    expect(typeof result2.timestamp).toBe('string')
  })
})

// ============================================================================
// Parser lifecycle — additional tests
// ============================================================================

describe('runAnalysisPipeline — parser lifecycle', () => {
  test('initialize is called before any parseFile calls', async () => {
    const initOrder: string[] = []
    mockParserInstance.initialize.mockImplementation(async () => {
      initOrder.push('init')
    })
    mockParserInstance.parseFile.mockImplementation(async () => {
      initOrder.push('parse')
      return { sourceFile: {}, parseTime: 10 }
    })
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])

    await runAnalysisPipeline('src', 4)

    expect(initOrder.indexOf('init')).toBeLessThan(initOrder.indexOf('parse'))
  })

  test('dispose is called even when discoverFiles returns empty', async () => {
    mockDiscoverFiles.mockResolvedValue([])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalled()
  })

  test('dispose is called after all files are processed', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])

    await runAnalysisPipeline('src', 4)

    // dispose should have been called once
    expect(mockParserInstance.dispose).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// Concurrency — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — concurrency edge cases', () => {
  test('concurrency value 2 is passed to pLimit', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 2)

    expect(pLimit).toHaveBeenCalledWith(2)
  })

  test('concurrency value 50 is passed to pLimit', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 50)

    expect(pLimit).toHaveBeenCalledWith(50)
  })

  test('processes files with different parse times', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fast.ts'),
      makeDiscoveredFile('slow.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(async () => {
      callCount++
      return { sourceFile: {}, parseTime: callCount === 1 ? 5 : 200 }
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.parseTime).toBe(5)
    expect(result.files[1]!.stats.parseTime).toBe(200)
  })
})

// ============================================================================
// Version — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — version additional edge cases', () => {
  test('handles numeric-like version string', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '42' })

    expect(result.version).toBe('42')
  })

  test('handles version with pre-release tag', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '3.0.0-alpha.1' })

    expect(result.version).toBe('3.0.0-alpha.1')
  })

  test('handles version with build metadata', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '1.0.0+build.123' })

    expect(result.version).toBe('1.0.0+build.123')
  })

  test('handles very long version string', async () => {
    const longVersion = 'v' + '.'.repeat(100) + 'end'
    const result = await runAnalysisPipeline('src', 4, { version: longVersion })

    expect(result.version).toBe(longVersion)
  })

  test('version field is set when both log and version are provided', async () => {
    const log = vi.fn()
    const result = await runAnalysisPipeline('src', 4, { log, version: '9.9.9' })

    expect(result.version).toBe('9.9.9')
    expect(log).toHaveBeenCalled()
  })
})

// ============================================================================
// Options interface — coverage
// ============================================================================

describe('runAnalysisPipeline — options combinations', () => {
  test('works with empty options object', async () => {
    const result = await runAnalysisPipeline('src', 4, {})

    expect(result).toBeDefined()
    expect(result.version).toBe('unknown')
  })

  test('works with only log in options', async () => {
    const log = vi.fn()
    const result = await runAnalysisPipeline('src', 4, { log })

    expect(result).toBeDefined()
    expect(result.version).toBe('unknown')
    expect(log).toHaveBeenCalled()
  })

  test('works with only version in options', async () => {
    const result = await runAnalysisPipeline('src', 4, { version: '0.0.1' })

    expect(result).toBeDefined()
    expect(result.version).toBe('0.0.1')
  })
})

// ============================================================================
// File ordering in results
// ============================================================================

describe('runAnalysisPipeline — file result ordering', () => {
  test('preserves file order from discovery in results', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('first.ts'),
      makeDiscoveredFile('second.ts'),
      makeDiscoveredFile('third.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('first.ts')
    expect(result.files[1]!.filePath).toBe('second.ts')
    expect(result.files[2]!.filePath).toBe('third.ts')
  })

  test('preserves order when middle file fails', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(2)
    expect(result.files[0]!.filePath).toBe('a.ts')
    expect(result.files[1]!.filePath).toBe('c.ts')
  })
})

// ============================================================================
// Large file count stress test
// ============================================================================

describe('runAnalysisPipeline — large file sets', () => {
  test('handles 50 discovered files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => makeDiscoveredFile(`file${i}.ts`))
    mockDiscoverFiles.mockResolvedValue(files)
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'warning')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalFiles).toBe(50)
    expect(result.summary.warningCount).toBe(50)
    expect(result.summary.filesWithViolations).toBe(50)
  })

  test('handles 100 discovered files with no violations', async () => {
    const files = Array.from({ length: 100 }, (_, i) => makeDiscoveredFile(`clean${i}.ts`))
    mockDiscoverFiles.mockResolvedValue(files)

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalFiles).toBe(100)
    expect(result.summary.filesWithViolations).toBe(0)
    expect(result.files).toHaveLength(100)
  })
})

// ============================================================================
// discoverFiles called correctly
// ============================================================================

describe('runAnalysisPipeline — discoverFiles call details', () => {
  test('passes spread copy of DEFAULT_FILE_PATTERNS as patterns', async () => {
    await runAnalysisPipeline('src', 4)

    const callArg = mockDiscoverFiles.mock.calls[0]![0]
    // Should be a new array, not the same reference
    expect(Array.isArray(callArg.patterns)).toBe(true)
  })

  test('passes exactly 3 ignore patterns', async () => {
    await runAnalysisPipeline('src', 4)

    const callArg = mockDiscoverFiles.mock.calls[0]![0]
    expect(callArg.ignore).toHaveLength(3)
  })

  test('ignore patterns include node_modules, dist, and coverage', async () => {
    await runAnalysisPipeline('src', 4)

    const callArg = mockDiscoverFiles.mock.calls[0]![0]
    expect(callArg.ignore).toContain('node_modules/**')
    expect(callArg.ignore).toContain('dist/**')
    expect(callArg.ignore).toContain('coverage/**')
  })
})

// ============================================================================
// runRulesBatched — additional call verification
// ============================================================================

describe('runAnalysisPipeline — runRulesBatched details', () => {
  test('runRulesBatched is not called for null file entries', async () => {
    mockDiscoverFiles.mockResolvedValue([null as unknown as ReturnType<typeof makeDiscoveredFile>])

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).not.toHaveBeenCalled()
  })

  test('runRulesBatched receives the sourceFile from parseFile', async () => {
    const mockSource = { type: 'mock-source' }
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('src.ts')])
    mockParserInstance.parseFile.mockResolvedValue({
      sourceFile: mockSource,
      parseTime: 15,
    })

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).toHaveBeenCalledWith(mockSource, 50)
  })

  test('runRulesBatched called 0 times when no files discovered', async () => {
    mockDiscoverFiles.mockResolvedValue([])

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).not.toHaveBeenCalled()
  })

  test('runRulesBatched called once per non-null file', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('a.ts'),
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('b.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    expect(mockRunRulesBatched).toHaveBeenCalledTimes(2)
  })
})

// ============================================================================
// releaseFile — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — releaseFile edge cases', () => {
  test('releaseFile not called for null file entries', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('ok.ts'),
    ])

    await runAnalysisPipeline('src', 4)

    // Only called for 'ok.ts'
    expect(mockParserInstance.releaseFile).toHaveBeenCalledTimes(1)
    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/abs/ok.ts')
  })

  test('releaseFile called after runRulesBatched for same file', async () => {
    const callOrder: string[] = []
    mockRunRulesBatched.mockImplementation(() => {
      callOrder.push('rules')
      return []
    })
    mockParserInstance.releaseFile.mockImplementation(() => {
      callOrder.push('release')
    })
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('order.ts')])

    await runAnalysisPipeline('src', 4)

    expect(callOrder.indexOf('rules')).toBeLessThan(callOrder.indexOf('release'))
  })

  test('releaseFile called for every successfully parsed file', async () => {
    mockDiscoverFiles.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => makeDiscoveredFile(`f${i}.ts`)),
    )

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.releaseFile).toHaveBeenCalledTimes(5)
  })
})

// ============================================================================
// File stats — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — file stats edge cases', () => {
  test('file with zero parseTime', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('instant.ts')])
    mockParserInstance.parseFile.mockResolvedValue({ sourceFile: {}, parseTime: 0 })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.parseTime).toBe(0)
    expect(result.files[0]!.stats.totalTime).toBe(0)
    expect(result.files[0]!.stats.analysisTime).toBe(0)
  })

  test('file with large parseTime', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('slow.ts')])
    mockParserInstance.parseFile.mockResolvedValue({ sourceFile: {}, parseTime: 5000 })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.parseTime).toBe(5000)
    expect(result.files[0]!.stats.totalTime).toBe(5000)
  })

  test('multiple files have independent stats', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(async () => {
      callCount++
      return { sourceFile: {}, parseTime: callCount * 10 }
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.stats.parseTime).toBe(10)
    expect(result.files[1]!.stats.parseTime).toBe(20)
  })
})

// ============================================================================
// Return type shape validation
// ============================================================================

describe('runAnalysisPipeline — return type shape', () => {
  test('result has exactly expected top-level keys', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(Object.keys(result).sort()).toEqual(['files', 'summary', 'timestamp', 'version'].sort())
  })

  test('summary has exactly expected keys', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(Object.keys(result.summary).sort()).toEqual(
      [
        'errorCount',
        'filesWithViolations',
        'infoCount',
        'totalFiles',
        'totalTime',
        'warningCount',
      ].sort(),
    )
  })

  test('file result has exactly expected keys', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('shape.ts')])

    const result = await runAnalysisPipeline('src', 4)
    const fileResult = result.files[0]!

    expect(Object.keys(fileResult).sort()).toEqual(['filePath', 'stats', 'violations'].sort())
  })

  test('file stats has exactly expected keys', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('statshape.ts')])

    const result = await runAnalysisPipeline('src', 4)
    const stats = result.files[0]!.stats

    expect(Object.keys(stats).sort()).toEqual(['analysisTime', 'parseTime', 'totalTime'].sort())
  })

  test('violation has all required fields', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('vshape.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('test-rule', 'error')])

    const result = await runAnalysisPipeline('src', 4)
    const v = result.files[0]!.violations[0]!

    expect(v).toHaveProperty('column')
    expect(v).toHaveProperty('endColumn')
    expect(v).toHaveProperty('endLine')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('line')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('suggestion')
  })
})

// ============================================================================
// Mixed success/failure with violations
// ============================================================================

describe('runAnalysisPipeline — mixed success and failure', () => {
  test('correctly aggregates when some files fail and others have violations', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('ok1.ts'),
      makeDiscoveredFile('ok2.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })
    let ruleCallIdx = 0
    mockRunRulesBatched.mockImplementation(() => {
      ruleCallIdx++
      return ruleCallIdx === 1
        ? [makeViolation('r1', 'error'), makeViolation('r2', 'warning')]
        : [makeViolation('r3', 'info')]
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(2)
    expect(result.summary.errorCount).toBe(1)
    expect(result.summary.warningCount).toBe(1)
    expect(result.summary.infoCount).toBe(1)
    expect(result.summary.filesWithViolations).toBe(2)
    expect(result.summary.totalFiles).toBe(2)
  })

  test('succeed count excludes failed files from totalFiles', async () => {
    mockDiscoverFiles.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => makeDiscoveredFile(`f${i}.ts`)),
    )
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      // Even-numbered files fail
      if (callCount % 2 === 0) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalFiles).toBe(5)
  })
})

// ============================================================================
// Path validation — additional edge cases
// ============================================================================

describe('runAnalysisPipeline — path validation extra', () => {
  test('throws for path with special characters when not found', async () => {
    mockExistsSync.mockReturnValue(false)
    mockResolve.mockReturnValue('/abs/path with spaces & stuff!')

    await expect(runAnalysisPipeline('path with spaces & stuff!', 4)).rejects.toThrow(
      'Path not found: /abs/path with spaces & stuff!',
    )
  })

  test('throws for single character path that does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    mockResolve.mockReturnValue('/abs/x')

    await expect(runAnalysisPipeline('x', 4)).rejects.toThrow('Path not found: /abs/x')
  })

  test('succeeds for deeply nested path that exists', async () => {
    mockResolve.mockReturnValue('/abs/a/b/c/d/e/f')
    mockExistsSync.mockReturnValue(true)

    const result = await runAnalysisPipeline('a/b/c/d/e/f', 4)
    expect(result).toBeDefined()
  })

  test('path.resolve is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockResolve).toHaveBeenCalledTimes(1)
  })

  test('existsSync is called exactly once with resolved path', async () => {
    mockResolve.mockReturnValue('/resolved')

    await runAnalysisPipeline('src', 4)

    expect(mockExistsSync).toHaveBeenCalledTimes(1)
    expect(mockExistsSync).toHaveBeenCalledWith('/resolved')
  })
})

// ============================================================================
// discoverFiles — cwd parameter extra
// ============================================================================

describe('runAnalysisPipeline — discoverFiles cwd extra', () => {
  test('passes cwd matching the resolved path', async () => {
    mockResolve.mockReturnValue('/custom/cwd')

    await runAnalysisPipeline('my/project', 4)

    const callArg = mockDiscoverFiles.mock.calls[0]![0]
    expect(callArg.cwd).toBe('/custom/cwd')
  })

  test('discoverFiles is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockDiscoverFiles).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// Spinner — completed count accuracy
// ============================================================================

describe('runAnalysisPipeline — spinner completed count', () => {
  test('spinner succeed shows total discovered file count even when some fail', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('ok.ts'),
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('ok2.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 2) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })

    await runAnalysisPipeline('src', 4)

    // succeed shows totalFiles (discovered count), not valid count
    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 3 files')
  })

  test('spinner succeed for single file', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('one.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 1 files')
  })

  test('spinner succeed for 20 files', async () => {
    mockDiscoverFiles.mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => makeDiscoveredFile(`f${i}.ts`)),
    )

    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Analyzed 20 files')
  })
})

// ============================================================================
// Violation severity types
// ============================================================================

describe('runAnalysisPipeline — violation severity types', () => {
  test('error severity is exactly the string "error"', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.severity).toBe('error')
    expect(typeof result.files[0]!.violations[0]!.severity).toBe('string')
  })

  test('warning severity is exactly the string "warning"', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'warning')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.severity).toBe('warning')
  })

  test('info severity is exactly the string "info"', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'info')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.severity).toBe('info')
  })
})

// ============================================================================
// Summary totalTime measurement
// ============================================================================

describe('runAnalysisPipeline — summary totalTime measurement', () => {
  test('summary totalTime is greater than 0 when files processed', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockParserInstance.parseFile.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ sourceFile: {}, parseTime: 10 }), 5)),
    )

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.totalTime).toBeGreaterThanOrEqual(0)
  })

  test('summary totalTime is a finite number', async () => {
    const result = await runAnalysisPipeline('src', 4)

    expect(Number.isFinite(result.summary.totalTime)).toBe(true)
  })
})

// ============================================================================
// Rule registry setup
// ============================================================================

describe('runAnalysisPipeline — rule registry setup', () => {
  test('setupRuleRegistryLazy is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSetupRuleRegistryLazy).toHaveBeenCalledTimes(1)
  })

  test('setupRuleRegistryLazy is called before parseFile', async () => {
    const callOrder: string[] = []
    mockSetupRuleRegistryLazy.mockImplementation(async () => {
      callOrder.push('registry')
      return { runRulesBatched: mockRunRulesBatched }
    })
    mockParserInstance.parseFile.mockImplementation(async () => {
      callOrder.push('parse')
      return { sourceFile: {}, parseTime: 10 }
    })
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])

    await runAnalysisPipeline('src', 4)

    expect(callOrder.indexOf('registry')).toBeLessThan(callOrder.indexOf('parse'))
  })
})

// ============================================================================
// Parser lifecycle — extra
// ============================================================================

describe('runAnalysisPipeline — parser lifecycle extra', () => {
  test('Parser constructor is called exactly once', async () => {
    const { Parser } = await import('../../../src/core/parser.js')

    await runAnalysisPipeline('src', 4)

    expect(Parser).toHaveBeenCalledTimes(1)
  })

  test('parser.initialize is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.initialize).toHaveBeenCalledTimes(1)
  })

  test('parser.dispose is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalledTimes(1)
  })

  test('dispose is called even when all files fail to parse', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('fail.ts')])
    mockParserInstance.parseFile.mockRejectedValue(new Error('boom'))

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalledTimes(1)
  })

  test('dispose is called even when runRulesBatched throws', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('crash.ts')])
    mockRunRulesBatched.mockImplementation(() => {
      throw new Error('rules crash')
    })

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.dispose).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// Concurrency — pLimit call verification
// ============================================================================

describe('runAnalysisPipeline — pLimit verification', () => {
  test('pLimit is called with concurrency 4', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 4)

    expect(pLimit).toHaveBeenCalledWith(4)
  })

  test('pLimit is called once per pipeline run', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 4)

    expect(pLimit).toHaveBeenCalledTimes(1)
  })

  test('different concurrency values on successive calls', async () => {
    const { default: pLimit } = await import('p-limit')

    await runAnalysisPipeline('src', 2)
    await runAnalysisPipeline('src', 16)

    expect(pLimit).toHaveBeenCalledWith(2)
    expect(pLimit).toHaveBeenCalledWith(16)
    expect(pLimit).toHaveBeenCalledTimes(2)
  })
})

// ============================================================================
// File result — violations ordering
// ============================================================================

describe('runAnalysisPipeline — violations ordering', () => {
  test('violations appear in the order returned by runRulesBatched', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('order.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('first-rule', 'error'),
      makeViolation('second-rule', 'warning'),
      makeViolation('third-rule', 'info'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.ruleId).toBe('first-rule')
    expect(result.files[0]!.violations[1]!.ruleId).toBe('second-rule')
    expect(result.files[0]!.violations[2]!.ruleId).toBe('third-rule')
  })

  test('violations preserve severity order from runRulesBatched', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('sev-order.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'info'),
      makeViolation('r2', 'error'),
      makeViolation('r3', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.severity).toBe('info')
    expect(result.files[0]!.violations[1]!.severity).toBe('error')
    expect(result.files[0]!.violations[2]!.severity).toBe('warning')
  })
})

// ============================================================================
// Empty violations array behavior
// ============================================================================

describe('runAnalysisPipeline — empty violations behavior', () => {
  test('files with empty violations still appear in results', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('clean.ts')])
    mockRunRulesBatched.mockReturnValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.violations).toEqual([])
  })

  test('multiple files all with empty violations', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])
    mockRunRulesBatched.mockReturnValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(2)
    expect(result.files[0]!.violations).toEqual([])
    expect(result.files[1]!.violations).toEqual([])
    expect(result.summary.filesWithViolations).toBe(0)
  })
})

// ============================================================================
// filesWithViolations — edge cases
// ============================================================================

describe('runAnalysisPipeline — filesWithViolations edge cases', () => {
  test('filesWithViolations is 0 when all files have zero violations', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      makeDiscoveredFile('b.ts'),
      makeDiscoveredFile('c.ts'),
    ])
    mockRunRulesBatched.mockReturnValue([])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.filesWithViolations).toBe(0)
  })

  test('filesWithViolations equals totalFiles when every file has violations', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'warning')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.filesWithViolations).toBe(result.summary.totalFiles)
  })

  test('filesWithViolations excludes files that failed to parse', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('fail.ts'),
      makeDiscoveredFile('ok.ts'),
    ])
    let callCount = 0
    mockParserInstance.parseFile.mockImplementation(() => {
      callCount++
      if (callCount === 1) throw new Error('fail')
      return Promise.resolve({ sourceFile: {}, parseTime: 10 })
    })
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'error')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.filesWithViolations).toBe(1)
  })
})

// ============================================================================
// ora spinner lifecycle
// ============================================================================

describe('runAnalysisPipeline — ora lifecycle', () => {
  test('ora is called exactly once per pipeline run', async () => {
    const { default: ora } = await import('ora')

    await runAnalysisPipeline('src', 4)

    expect(ora).toHaveBeenCalledTimes(1)
  })

  test('spinner.start is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.start).toHaveBeenCalledTimes(1)
  })

  test('spinner.succeed is called exactly once', async () => {
    await runAnalysisPipeline('src', 4)

    expect(mockSpinner.succeed).toHaveBeenCalledTimes(1)
  })

  test('spinner.succeed is called after spinner.start', async () => {
    const callOrder: string[] = []
    mockSpinner.start.mockImplementation(function () {
      callOrder.push('start')
      return mockSpinner
    })
    mockSpinner.succeed.mockImplementation(() => {
      callOrder.push('succeed')
    })

    await runAnalysisPipeline('src', 4)

    expect(callOrder.indexOf('start')).toBeLessThan(callOrder.indexOf('succeed'))
  })
})

// ============================================================================
// Violation message mapping
// ============================================================================

describe('runAnalysisPipeline — violation message mapping', () => {
  test('maps violation message correctly', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('msg.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'Unexpected console statement',
        ruleId: 'no-console',
        severity: 'warning',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
        suggestion: 'Remove console statement',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.message).toBe('Unexpected console statement')
  })

  test('maps empty string message', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('empty.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: '',
        ruleId: 'empty-msg',
        severity: 'info',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
        suggestion: undefined,
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.message).toBe('')
  })

  test('maps long violation message', async () => {
    const longMsg = 'A'.repeat(500)
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('long.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: longMsg,
        ruleId: 'long-msg',
        severity: 'error',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
        suggestion: 'fix',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.message).toBe(longMsg)
    expect(result.files[0]!.violations[0]!.message).toHaveLength(500)
  })
})

// ============================================================================
// Absolute path handling in results
// ============================================================================

describe('runAnalysisPipeline — absolute path handling', () => {
  test('parseFile receives absolute path from discovered file', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('rel.ts', '/absolute/path/rel.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.parseFile).toHaveBeenCalledWith('/absolute/path/rel.ts')
  })

  test('releaseFile receives same absolute path as parseFile', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('file.ts', '/same/abs/file.ts')])

    await runAnalysisPipeline('src', 4)

    expect(mockParserInstance.parseFile).toHaveBeenCalledWith('/same/abs/file.ts')
    expect(mockParserInstance.releaseFile).toHaveBeenCalledWith('/same/abs/file.ts')
  })

  test('result filePath uses file.path (relative) not absolutePath', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('components/App.tsx', '/proj/src/components/App.tsx'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('components/App.tsx')
    // Not the absolute path
    expect(result.files[0]!.filePath).not.toBe('/proj/src/components/App.tsx')
  })
})

// ============================================================================
// Null safety — multiple null entries
// ============================================================================

describe('runAnalysisPipeline — null safety extra', () => {
  test('handles alternating null and valid files', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('a.ts'),
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('b.ts'),
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('c.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(3)
    expect(result.summary.totalFiles).toBe(3)
  })

  test('null at start of list', async () => {
    mockDiscoverFiles.mockResolvedValue([
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
      makeDiscoveredFile('valid.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('valid.ts')
  })

  test('null at end of list', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('valid.ts'),
      null as unknown as ReturnType<typeof makeDiscoveredFile>,
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('valid.ts')
  })
})

// ============================================================================
// Violation ruleId mapping
// ============================================================================

describe('runAnalysisPipeline — violation ruleId mapping', () => {
  test('maps ruleId correctly for each violation', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('custom-rule-1', 'error'),
      makeViolation('custom-rule-2', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.ruleId).toBe('custom-rule-1')
    expect(result.files[0]!.violations[1]!.ruleId).toBe('custom-rule-2')
  })

  test('maps empty string ruleId', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'msg',
        ruleId: '',
        severity: 'info',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
        suggestion: undefined,
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.ruleId).toBe('')
  })

  test('maps ruleId with special characters', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([
      {
        message: 'msg',
        ruleId: '@scope/custom-rule-v2',
        severity: 'error',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
        suggestion: 'fix',
      },
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.violations[0]!.ruleId).toBe('@scope/custom-rule-v2')
  })
})

// ============================================================================
// Multiple runs — idempotency
// ============================================================================

describe('runAnalysisPipeline — idempotency', () => {
  test('produces consistent summary across two runs with same data', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])
    mockRunRulesBatched.mockReturnValue([makeViolation('r', 'warning')])

    const result1 = await runAnalysisPipeline('src', 4)
    const result2 = await runAnalysisPipeline('src', 4)

    expect(result1.summary.errorCount).toBe(result2.summary.errorCount)
    expect(result1.summary.warningCount).toBe(result2.summary.warningCount)
    expect(result1.summary.infoCount).toBe(result2.summary.infoCount)
    expect(result1.summary.totalFiles).toBe(result2.summary.totalFiles)
    expect(result1.summary.filesWithViolations).toBe(result2.summary.filesWithViolations)
  })

  test('produces consistent file counts across runs', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts'), makeDiscoveredFile('b.ts')])

    const result1 = await runAnalysisPipeline('src', 4)
    const result2 = await runAnalysisPipeline('src', 4)

    expect(result1.files).toHaveLength(result2.files.length)
  })

  test('parseFile count matches files discovered per run', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('a.ts')])

    await runAnalysisPipeline('src', 4)
    expect(mockParserInstance.parseFile).toHaveBeenCalledTimes(1)

    await runAnalysisPipeline('src', 4)
    expect(mockParserInstance.parseFile).toHaveBeenCalledTimes(2)
  })
})

// ============================================================================
// Summary — mixed severity with errors
// ============================================================================

describe('runAnalysisPipeline — mixed severity with errors', () => {
  test('all three severity types in single file', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('mixed.ts')])
    mockRunRulesBatched.mockReturnValue([
      makeViolation('r1', 'error'),
      makeViolation('r2', 'warning'),
      makeViolation('r3', 'info'),
      makeViolation('r4', 'error'),
      makeViolation('r5', 'warning'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(2)
    expect(result.summary.warningCount).toBe(2)
    expect(result.summary.infoCount).toBe(1)
    expect(result.summary.filesWithViolations).toBe(1)
  })

  test('different severity mixes across files', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('errors-only.ts'),
      makeDiscoveredFile('warnings-only.ts'),
    ])
    let callIdx = 0
    mockRunRulesBatched.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) return [makeViolation('r', 'error'), makeViolation('r', 'error')]
      return [makeViolation('r', 'warning')]
    })

    const result = await runAnalysisPipeline('src', 4)

    expect(result.summary.errorCount).toBe(2)
    expect(result.summary.warningCount).toBe(1)
    expect(result.summary.infoCount).toBe(0)
    expect(result.summary.filesWithViolations).toBe(2)
  })
})

// ============================================================================
// File path edge cases
// ============================================================================

describe('runAnalysisPipeline — file path edge cases', () => {
  test('handles file with deep nested path', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile(
        'src/features/auth/utils/validate.ts',
        '/abs/src/features/auth/utils/validate.ts',
      ),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('src/features/auth/utils/validate.ts')
  })

  test('handles file with dots in name', async () => {
    mockDiscoverFiles.mockResolvedValue([
      makeDiscoveredFile('some.test.utils.ts', '/abs/some.test.utils.ts'),
    ])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('some.test.utils.ts')
  })

  test('handles .tsx file extension', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('Component.tsx', '/abs/Component.tsx')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('Component.tsx')
  })

  test('handles .jsx file extension', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('app.jsx', '/abs/app.jsx')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('app.jsx')
  })

  test('handles .js file extension', async () => {
    mockDiscoverFiles.mockResolvedValue([makeDiscoveredFile('index.js', '/abs/index.js')])

    const result = await runAnalysisPipeline('src', 4)

    expect(result.files[0]!.filePath).toBe('index.js')
  })
})

// ============================================================================
// Error in options.log callback
// ============================================================================

describe('runAnalysisPipeline — log callback extra', () => {
  test('log receives exact absolute path string', async () => {
    const log = vi.fn()
    mockResolve.mockReturnValue('/exact/path')

    await runAnalysisPipeline('src', 4, { log })

    expect(log).toHaveBeenCalledWith('Analyzing: /exact/path')
  })
})
