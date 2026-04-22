import { describe, it, expect } from 'vitest'
import type {
  Severity,
  Violation,
  AnalysisStats,
  FileAnalysisResult,
  AnalysisResult,
  ReporterOptions,
  Reporter,
  ReporterFactory,
  ReporterRegistryEntry,
} from '../../../src/reporters/types.js'

// ─── Helper factories ───────────────────────────────────────────────

function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 1,
    filePath: '/src/test.ts',
    line: 1,
    message: 'default message',
    ruleId: 'default-rule',
    severity: 'error',
    ...overrides,
  }
}

function makeStats(overrides: Partial<AnalysisStats> = {}): AnalysisStats {
  return { analysisTime: 10, parseTime: 5, totalTime: 15, ...overrides }
}

function makeFileResult(overrides: Partial<FileAnalysisResult> = {}): FileAnalysisResult {
  return {
    filePath: '/src/test.ts',
    stats: makeStats(),
    violations: [],
    ...overrides,
  }
}

function makeAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 0,
      warningCount: 0,
    },
    timestamp: '2024-06-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeReporter(overrides: Partial<Reporter> = {}): Reporter {
  return {
    name: 'test-reporter',
    format: (v: Violation) => `${v.severity}: ${v.message}`,
    report: () => {},
    ...overrides,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXISTING TESTS (preserved verbatim)
// ═══════════════════════════════════════════════════════════════════════

describe('src/reporters/types.ts - Type Exports', () => {
  it('should export Severity type', () => {
    const severity1: Severity = 'error'
    const severity2: Severity = 'info'
    const severity3: Severity = 'warning'

    expect([severity1, severity2, severity3]).toEqual(['error', 'info', 'warning'])
  })

  it('should export Violation interface', () => {
    const violation: Violation = {
      column: 1,
      filePath: '/path/to/file.ts',
      line: 10,
      message: 'Test violation',
      ruleId: 'test-rule',
      severity: 'error',
    }

    expect(violation).toBeDefined()
    expect(violation.column).toBe(1)
    expect(violation.filePath).toBe('/path/to/file.ts')
    expect(violation.line).toBe(10)
    expect(violation.message).toBe('Test violation')
    expect(violation.ruleId).toBe('test-rule')
    expect(violation.severity).toBe('error')
  })

  it('should export Violation interface with optional fields', () => {
    const violation: Violation = {
      column: 5,
      endColumn: 10,
      endLine: 15,
      filePath: '/path/to/file.ts',
      line: 10,
      message: 'Test violation with ranges',
      meta: { key: 'value' },
      ruleId: 'test-rule',
      severity: 'warning',
      source: 'const x = 1',
      suggestion: 'Use const instead of let',
    }

    expect(violation.endColumn).toBe(10)
    expect(violation.endLine).toBe(15)
    expect(violation.meta).toEqual({ key: 'value' })
    expect(violation.source).toBe('const x = 1')
    expect(violation.suggestion).toBe('Use const instead of let')
  })

  it('should export AnalysisStats interface', () => {
    const stats: AnalysisStats = {
      analysisTime: 100,
      parseTime: 50,
      totalTime: 150,
    }

    expect(stats.analysisTime).toBe(100)
    expect(stats.parseTime).toBe(50)
    expect(stats.totalTime).toBe(150)
  })

  it('should export FileAnalysisResult interface', () => {
    const result: FileAnalysisResult = {
      filePath: '/path/to/file.ts',
      stats: {
        analysisTime: 100,
        parseTime: 50,
        totalTime: 150,
      },
      violations: [],
    }

    expect(result.filePath).toBe('/path/to/file.ts')
    expect(result.violations).toEqual([])
    expect(result.stats.totalTime).toBe(150)
  })

  it('should export AnalysisResult interface', () => {
    const result: AnalysisResult = {
      files: [],
      summary: {
        errorCount: 0,
        filesWithViolations: 0,
        infoCount: 0,
        totalFiles: 5,
        totalTime: 500,
        warningCount: 0,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
    }

    expect(result.files).toEqual([])
    expect(result.summary.totalFiles).toBe(5)
    expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z')
    expect(result.version).toBe('1.0.0')
  })

  it('should export ReporterOptions interface', () => {
    const options: ReporterOptions = {
      color: true,
      errorsOnly: false,
      includeSource: true,
      outputPath: '/path/to/output.txt',
      pretty: true,
      quiet: false,
      verbose: true,
    }

    expect(options.color).toBe(true)
    expect(options.errorsOnly).toBe(false)
    expect(options.includeSource).toBe(true)
    expect(options.outputPath).toBe('/path/to/output.txt')
    expect(options.pretty).toBe(true)
    expect(options.quiet).toBe(false)
    expect(options.verbose).toBe(true)
  })

  it('should export ReporterOptions interface with minimal options', () => {
    const options: ReporterOptions = {}

    expect(options).toBeDefined()
    expect(options.color).toBeUndefined()
    expect(options.errorsOnly).toBeUndefined()
  })

  it('should export Reporter interface', () => {
    const mockReporter: Reporter = {
      name: 'mock-reporter',
      format: (violation: Violation): string => {
        return `${violation.severity}: ${violation.message}`
      },
      report: (results: AnalysisResult): void => {
        console.log(`Reporting ${results.files.length} files`)
      },
    }

    expect(mockReporter.name).toBe('mock-reporter')
    expect(typeof mockReporter.format).toBe('function')
    expect(typeof mockReporter.report).toBe('function')

    const violation: Violation = {
      column: 1,
      filePath: '/path/to/file.ts',
      line: 10,
      message: 'Test violation',
      ruleId: 'test-rule',
      severity: 'error',
    }
    expect(mockReporter.format(violation)).toBe('error: Test violation')
  })

  it('should export Reporter interface with optional methods', () => {
    let initialized = false
    let disposed = false

    const mockReporterWithLifecycle: Reporter = {
      name: 'lifecycle-reporter',
      format: (violation: Violation): string => {
        return `${violation.severity}: ${violation.message}`
      },
      report: (results: AnalysisResult): void => {
        console.log(`Reporting ${results.files.length} files`)
      },
      init: async (): Promise<void> => {
        initialized = true
      },
      dispose: async (): Promise<void> => {
        disposed = true
      },
    }

    expect(mockReporterWithLifecycle.init).toBeDefined()
    expect(mockReporterWithLifecycle.dispose).toBeDefined()
    expect(typeof mockReporterWithLifecycle.init).toBe('function')
    expect(typeof mockReporterWithLifecycle.dispose).toBe('function')

    mockReporterWithLifecycle.init?.()
    mockReporterWithLifecycle.dispose?.()

    expect(initialized).toBe(true)
    expect(disposed).toBe(true)
  })

  it('should export ReporterFactory type', () => {
    const factory: ReporterFactory = (options: ReporterOptions): Reporter => ({
      name: 'factory-reporter',
      format: (violation: Violation): string => {
        const color = options.color ? '\x1b[31m' : ''
        const reset = options.color ? '\x1b[0m' : ''
        return `${color}${violation.severity}${reset}: ${violation.message}`
      },
      report: (results: AnalysisResult): void => {
        if (options.verbose) {
          console.log(`Verbose report: ${results.files.length} files`)
        }
      },
    })

    expect(typeof factory).toBe('function')

    const reporter = factory({ color: true, verbose: true })
    expect(reporter.name).toBe('factory-reporter')
    expect(typeof reporter.format).toBe('function')
    expect(typeof reporter.report).toBe('function')
  })

  it('should export ReporterRegistryEntry interface', () => {
    const entry: ReporterRegistryEntry = {
      name: 'json-reporter',
      description: 'Reports analysis results in JSON format',
      factory: (options: ReporterOptions): Reporter => ({
        name: entry.name,
        format: (violation: Violation): string =>
          JSON.stringify(violation, null, options.pretty ? 2 : 0),
        report: (results: AnalysisResult): void => {
          console.log(JSON.stringify(results, null, options.pretty ? 2 : 0))
        },
      }),
    }

    expect(entry.name).toBe('json-reporter')
    expect(entry.description).toBe('Reports analysis results in JSON format')
    expect(typeof entry.factory).toBe('function')

    const reporter = entry.factory({ pretty: true })
    expect(reporter.name).toBe('json-reporter')
  })

  it('should export ReporterRegistryEntry with optional description', () => {
    const entry: ReporterRegistryEntry = {
      name: 'simple-reporter',
      factory: (): Reporter => ({
        name: 'simple-reporter',
        format: (violation: Violation): string => violation.message,
        report: (): void => {
          console.log('Simple report')
        },
      }),
    }

    expect(entry.name).toBe('simple-reporter')
    expect(entry.description).toBeUndefined()
  })
})

describe('src/reporters/types.ts - Type System Validation', () => {
  it('should enforce Severity type constraints', () => {
    const validSeverities: Severity[] = ['error', 'info', 'warning']
    expect(validSeverities).toHaveLength(3)
  })

  it('should support complex Violation structures', () => {
    const complexViolation: Violation = {
      column: 1,
      endColumn: 20,
      endLine: 10,
      filePath: '/src/example.ts',
      line: 5,
      message: 'Complex violation example',
      meta: {
        category: 'complexity',
        confidence: 0.95,
        customField: 'custom value',
      },
      ruleId: 'complex-rule',
      severity: 'warning',
      source: 'function complexExample(a, b, c, d, e) { return a + b + c + d + e }',
      suggestion: 'Consider refactoring to reduce parameters',
    }

    expect(complexViolation.meta).toBeDefined()
    expect(complexViolation.meta?.category).toBe('complexity')
    expect(complexViolation.source).toContain('function')
    expect(complexViolation.suggestion).toContain('refactoring')
  })

  it('should support nested AnalysisResult structures', () => {
    const violation1: Violation = {
      column: 1,
      filePath: '/src/file1.ts',
      line: 10,
      message: 'Error 1',
      ruleId: 'rule1',
      severity: 'error',
    }

    const violation2: Violation = {
      column: 5,
      filePath: '/src/file2.ts',
      line: 20,
      message: 'Warning 1',
      ruleId: 'rule2',
      severity: 'warning',
    }

    const fileResult1: FileAnalysisResult = {
      filePath: '/src/file1.ts',
      stats: { analysisTime: 50, parseTime: 25, totalTime: 75 },
      violations: [violation1],
    }

    const fileResult2: FileAnalysisResult = {
      filePath: '/src/file2.ts',
      stats: { analysisTime: 100, parseTime: 50, totalTime: 150 },
      violations: [violation2],
    }

    const analysisResult: AnalysisResult = {
      files: [fileResult1, fileResult2],
      summary: {
        errorCount: 1,
        filesWithViolations: 2,
        infoCount: 0,
        totalFiles: 2,
        totalTime: 225,
        warningCount: 1,
      },
      timestamp: '2024-01-01T12:00:00.000Z',
      version: '1.0.0',
    }

    expect(analysisResult.files).toHaveLength(2)
    expect(analysisResult.summary.errorCount).toBe(1)
    expect(analysisResult.summary.warningCount).toBe(1)
    expect(analysisResult.files[0].violations[0].ruleId).toBe('rule1')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Severity
// ═══════════════════════════════════════════════════════════════════════

describe('Severity type', () => {
  it('accepts "error" as a Severity', () => {
    const s: Severity = 'error'
    expect(s).toBe('error')
  })

  it('accepts "info" as a Severity', () => {
    const s: Severity = 'info'
    expect(s).toBe('info')
  })

  it('accepts "warning" as a Severity', () => {
    const s: Severity = 'warning'
    expect(s).toBe('warning')
  })

  it('can be used in a switch statement', () => {
    function label(s: Severity): string {
      switch (s) {
        case 'error':
          return 'E'
        case 'warning':
          return 'W'
        case 'info':
          return 'I'
      }
    }
    expect(label('error')).toBe('E')
    expect(label('warning')).toBe('W')
    expect(label('info')).toBe('I')
  })

  it('can be stored in an array', () => {
    const arr: Severity[] = ['error', 'warning', 'info', 'error']
    expect(arr).toHaveLength(4)
    expect(arr.filter((s) => s === 'error')).toHaveLength(2)
  })

  it('can be used as a Record key', () => {
    const map: Record<Severity, number> = { error: 3, warning: 2, info: 1 }
    expect(map.error).toBeGreaterThan(map.warning)
    expect(map.warning).toBeGreaterThan(map.info)
  })

  it('can be used in a Set', () => {
    const set = new Set<Severity>(['error', 'error', 'warning'])
    expect(set.size).toBe(2)
    expect(set.has('info')).toBe(false)
  })

  it('can be compared with strict equality', () => {
    const s: Severity = 'error'
    expect(s === 'error').toBe(true)
    expect(s === 'warning').toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Violation
// ═══════════════════════════════════════════════════════════════════════

describe('Violation interface', () => {
  it('creates a minimal violation with only required fields', () => {
    const v: Violation = makeViolation()
    expect(v.column).toBeDefined()
    expect(v.filePath).toBeDefined()
    expect(v.line).toBeDefined()
    expect(v.message).toBeDefined()
    expect(v.ruleId).toBeDefined()
    expect(v.severity).toBeDefined()
  })

  it('allows column to be 1 (1-indexed)', () => {
    const v = makeViolation({ column: 1 })
    expect(v.column).toBe(1)
  })

  it('allows column to be a large number', () => {
    const v = makeViolation({ column: 999 })
    expect(v.column).toBe(999)
  })

  it('allows line to be 1', () => {
    const v = makeViolation({ line: 1 })
    expect(v.line).toBe(1)
  })

  it('allows line to be a large number', () => {
    const v = makeViolation({ line: 10000 })
    expect(v.line).toBe(10000)
  })

  it('allows filePath to be a relative path', () => {
    const v = makeViolation({ filePath: './src/index.ts' })
    expect(v.filePath).toBe('./src/index.ts')
  })

  it('allows filePath to be an absolute path', () => {
    const v = makeViolation({ filePath: '/home/user/project/src/index.ts' })
    expect(v.filePath).toBe('/home/user/project/src/index.ts')
  })

  it('allows filePath to use Windows-style paths', () => {
    const v = makeViolation({ filePath: 'C:\\Users\\project\\src\\index.ts' })
    expect(v.filePath).toContain('\\')
  })

  it('allows empty string message', () => {
    const v = makeViolation({ message: '' })
    expect(v.message).toBe('')
  })

  it('allows long multi-line message', () => {
    const msg = 'Line 1\nLine 2\nLine 3'
    const v = makeViolation({ message: msg })
    expect(v.message.split('\n')).toHaveLength(3)
  })

  it('allows ruleId with namespace prefix', () => {
    const v = makeViolation({ ruleId: 'security/no-eval' })
    expect(v.ruleId).toContain('/')
  })

  it('allows ruleId with camelCase', () => {
    const v = makeViolation({ ruleId: 'noUnusedVars' })
    expect(v.ruleId).toBe('noUnusedVars')
  })

  it('supports severity "error"', () => {
    const v = makeViolation({ severity: 'error' })
    expect(v.severity).toBe('error')
  })

  it('supports severity "warning"', () => {
    const v = makeViolation({ severity: 'warning' })
    expect(v.severity).toBe('warning')
  })

  it('supports severity "info"', () => {
    const v = makeViolation({ severity: 'info' })
    expect(v.severity).toBe('info')
  })

  it('optional endColumn is undefined when omitted', () => {
    const v = makeViolation()
    expect(v.endColumn).toBeUndefined()
  })

  it('optional endLine is undefined when omitted', () => {
    const v = makeViolation()
    expect(v.endLine).toBeUndefined()
  })

  it('optional meta is undefined when omitted', () => {
    const v = makeViolation()
    expect(v.meta).toBeUndefined()
  })

  it('optional source is undefined when omitted', () => {
    const v = makeViolation()
    expect(v.source).toBeUndefined()
  })

  it('optional suggestion is undefined when omitted', () => {
    const v = makeViolation()
    expect(v.suggestion).toBeUndefined()
  })

  it('sets endColumn when provided', () => {
    const v = makeViolation({ endColumn: 42 })
    expect(v.endColumn).toBe(42)
  })

  it('sets endLine when provided', () => {
    const v = makeViolation({ endLine: 20 })
    expect(v.endLine).toBe(20)
  })

  it('sets source when provided', () => {
    const v = makeViolation({ source: 'const x: never = null as never' })
    expect(v.source).toContain('const')
  })

  it('sets suggestion when provided', () => {
    const v = makeViolation({ suggestion: 'Remove unused variable' })
    expect(v.suggestion).toBe('Remove unused variable')
  })

  it('sets meta with string values', () => {
    const v = makeViolation({ meta: { tag: 'security' } })
    expect(v.meta?.tag).toBe('security')
  })

  it('sets meta with numeric values', () => {
    const v = makeViolation({ meta: { complexity: 15 } })
    expect(v.meta?.complexity).toBe(15)
  })

  it('sets meta with boolean values', () => {
    const v = makeViolation({ meta: { fixable: true } })
    expect(v.meta?.fixable).toBe(true)
  })

  it('sets meta with nested objects', () => {
    const v = makeViolation({ meta: { range: { start: 0, end: 10 } } })
    expect((v.meta?.range as Record<string, number>).start).toBe(0)
  })

  it('sets meta with array values', () => {
    const v = makeViolation({ meta: { tags: ['security', 'critical'] } })
    expect((v.meta?.tags as string[]).length).toBe(2)
  })

  it('sets meta with null value', () => {
    const v = makeViolation({ meta: { data: null } })
    expect(v.meta?.data).toBeNull()
  })

  it('sets meta with mixed value types', () => {
    const v = makeViolation({
      meta: { count: 5, name: 'test', active: true, extra: null },
    })
    expect(Object.keys(v.meta!)).toHaveLength(4)
  })

  it('supports single-line range (same line, different columns)', () => {
    const v = makeViolation({ line: 5, column: 1, endLine: 5, endColumn: 10 })
    expect(v.line).toBe(v.endLine)
    expect(v.endColumn).toBeGreaterThan(v.column)
  })

  it('supports multi-line range', () => {
    const v = makeViolation({ line: 5, endLine: 8 })
    expect(v.endLine!).toBeGreaterThan(v.line)
  })

  it('can be serialized to JSON', () => {
    const v = makeViolation({ meta: { key: 'val' } })
    const json = JSON.stringify(v)
    const parsed = JSON.parse(json)
    expect(parsed.ruleId).toBe('default-rule')
    expect(parsed.meta.key).toBe('val')
  })

  it('can be cloned with spread operator', () => {
    const v1 = makeViolation()
    const v2 = { ...v1 }
    expect(v2).toEqual(v1)
    expect(v2).not.toBe(v1)
  })

  it('preserves all fields when cloned', () => {
    const v1 = makeViolation({
      endColumn: 5,
      endLine: 2,
      meta: { a: 1 },
      source: 'code',
      suggestion: 'fix it',
    })
    const v2 = { ...v1 }
    expect(v2.endColumn).toBe(5)
    expect(v2.endLine).toBe(2)
    expect(v2.meta).toEqual({ a: 1 })
    expect(v2.source).toBe('code')
    expect(v2.suggestion).toBe('fix it')
  })

  it('can be part of a Readonly array', () => {
    const violations: readonly Violation[] = [
      makeViolation({ message: 'a' }),
      makeViolation({ message: 'b' }),
    ]
    expect(violations).toHaveLength(2)
  })

  it('supports different filePath extensions', () => {
    const paths = ['a.ts', 'b.tsx', 'c.js', 'd.jsx', 'e.mjs']
    paths.forEach((fp) => {
      const v = makeViolation({ filePath: fp })
      expect(v.filePath).toBe(fp)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — AnalysisStats
// ═══════════════════════════════════════════════════════════════════════

describe('AnalysisStats interface', () => {
  it('has all required fields', () => {
    const s: AnalysisStats = { analysisTime: 1, parseTime: 2, totalTime: 3 }
    expect(s).toHaveProperty('analysisTime')
    expect(s).toHaveProperty('parseTime')
    expect(s).toHaveProperty('totalTime')
  })

  it('accepts zero for all fields', () => {
    const s: AnalysisStats = { analysisTime: 0, parseTime: 0, totalTime: 0 }
    expect(s.analysisTime).toBe(0)
    expect(s.parseTime).toBe(0)
    expect(s.totalTime).toBe(0)
  })

  it('accepts fractional milliseconds', () => {
    const s: AnalysisStats = { analysisTime: 1.5, parseTime: 0.3, totalTime: 1.8 }
    expect(s.analysisTime).toBe(1.5)
  })

  it('accepts large numbers', () => {
    const s: AnalysisStats = { analysisTime: 600000, parseTime: 300000, totalTime: 900000 }
    expect(s.totalTime).toBe(900000)
  })

  it('can be compared: totalTime >= analysisTime + parseTime', () => {
    const s: AnalysisStats = { analysisTime: 100, parseTime: 50, totalTime: 200 }
    expect(s.totalTime).toBeGreaterThanOrEqual(s.analysisTime + s.parseTime)
  })

  it('can be serialized to JSON', () => {
    const s: AnalysisStats = { analysisTime: 10, parseTime: 5, totalTime: 15 }
    const json = JSON.stringify(s)
    const parsed = JSON.parse(json)
    expect(parsed).toEqual(s)
  })

  it('can be cloned via spread', () => {
    const s1 = makeStats()
    const s2 = { ...s1 }
    expect(s2).toEqual(s1)
    expect(s2).not.toBe(s1)
  })

  it('allows independent field overrides', () => {
    const s = makeStats({ analysisTime: 999 })
    expect(s.analysisTime).toBe(999)
    expect(s.parseTime).toBe(5)
    expect(s.totalTime).toBe(15)
  })

  it('stores numbers as numbers not strings', () => {
    const s = makeStats()
    expect(typeof s.analysisTime).toBe('number')
    expect(typeof s.parseTime).toBe('number')
    expect(typeof s.totalTime).toBe('number')
  })

  it('can be used in array mapping', () => {
    const stats: AnalysisStats[] = [
      makeStats({ totalTime: 10 }),
      makeStats({ totalTime: 20 }),
      makeStats({ totalTime: 30 }),
    ]
    const total = stats.reduce((sum, s) => sum + s.totalTime, 0)
    expect(total).toBe(60)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — FileAnalysisResult
// ═══════════════════════════════════════════════════════════════════════

describe('FileAnalysisResult interface', () => {
  it('has all required fields', () => {
    const r = makeFileResult()
    expect(r).toHaveProperty('filePath')
    expect(r).toHaveProperty('stats')
    expect(r).toHaveProperty('violations')
  })

  it('violations can be an empty array', () => {
    const r = makeFileResult()
    expect(r.violations).toEqual([])
    expect(r.violations).toHaveLength(0)
  })

  it('violations can contain multiple items', () => {
    const r = makeFileResult({
      violations: [makeViolation(), makeViolation(), makeViolation()],
    })
    expect(r.violations).toHaveLength(3)
  })

  it('stats are accessible', () => {
    const r = makeFileResult({ stats: makeStats({ totalTime: 42 }) })
    expect(r.stats.totalTime).toBe(42)
  })

  it('filePath matches the analyzed file', () => {
    const r = makeFileResult({ filePath: '/src/foo/bar.ts' })
    expect(r.filePath).toBe('/src/foo/bar.ts')
  })

  it('can reference violations with different severities', () => {
    const r = makeFileResult({
      violations: [
        makeViolation({ severity: 'error', message: 'e1' }),
        makeViolation({ severity: 'warning', message: 'w1' }),
        makeViolation({ severity: 'info', message: 'i1' }),
      ],
    })
    expect(r.violations.filter((v) => v.severity === 'error')).toHaveLength(1)
    expect(r.violations.filter((v) => v.severity === 'warning')).toHaveLength(1)
    expect(r.violations.filter((v) => v.severity === 'info')).toHaveLength(1)
  })

  it('can be serialized to JSON', () => {
    const r = makeFileResult()
    const json = JSON.stringify(r)
    const parsed = JSON.parse(json)
    expect(parsed.filePath).toBe('/src/test.ts')
  })

  it('can be cloned via spread', () => {
    const r1 = makeFileResult()
    const r2 = { ...r1 }
    expect(r2).toEqual(r1)
    expect(r2).not.toBe(r1)
  })

  it('deep clone creates independent violation arrays', () => {
    const r1 = makeFileResult({ violations: [makeViolation()] })
    const r2 = { ...r1, violations: [...r1.violations] }
    r2.violations.push(makeViolation({ message: 'new' }))
    expect(r1.violations).toHaveLength(1)
    expect(r2.violations).toHaveLength(2)
  })

  it('can be sorted by filePath', () => {
    const results: FileAnalysisResult[] = [
      makeFileResult({ filePath: '/b.ts' }),
      makeFileResult({ filePath: '/a.ts' }),
      makeFileResult({ filePath: '/c.ts' }),
    ]
    const sorted = [...results].sort((a, b) => a.filePath.localeCompare(b.filePath))
    expect(sorted[0].filePath).toBe('/a.ts')
    expect(sorted[2].filePath).toBe('/c.ts')
  })

  it('can compute violation count per file', () => {
    const r = makeFileResult({
      violations: [makeViolation(), makeViolation()],
    })
    expect(r.violations.length).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — AnalysisResult
// ═══════════════════════════════════════════════════════════════════════

describe('AnalysisResult interface', () => {
  it('has all required fields', () => {
    const r = makeAnalysisResult()
    expect(r).toHaveProperty('files')
    expect(r).toHaveProperty('summary')
    expect(r).toHaveProperty('timestamp')
  })

  it('version is optional', () => {
    const r = makeAnalysisResult()
    expect(r.version).toBeUndefined()
  })

  it('version can be set', () => {
    const r = makeAnalysisResult({ version: '2.0.0' })
    expect(r.version).toBe('2.0.0')
  })

  it('summary has all required fields', () => {
    const s = makeAnalysisResult().summary
    expect(s).toHaveProperty('errorCount')
    expect(s).toHaveProperty('filesWithViolations')
    expect(s).toHaveProperty('infoCount')
    expect(s).toHaveProperty('totalFiles')
    expect(s).toHaveProperty('totalTime')
    expect(s).toHaveProperty('warningCount')
  })

  it('summary counts can all be zero', () => {
    const s = makeAnalysisResult().summary
    expect(s.errorCount).toBe(0)
    expect(s.warningCount).toBe(0)
    expect(s.infoCount).toBe(0)
    expect(s.filesWithViolations).toBe(0)
    expect(s.totalFiles).toBe(0)
    expect(s.totalTime).toBe(0)
  })

  it('summary can represent large numbers', () => {
    const r = makeAnalysisResult({
      summary: {
        errorCount: 1000,
        filesWithViolations: 500,
        infoCount: 2000,
        totalFiles: 10000,
        totalTime: 300000,
        warningCount: 5000,
      },
    })
    expect(r.summary.totalFiles).toBe(10000)
    expect(r.summary.warningCount).toBe(5000)
  })

  it('files array can be empty', () => {
    const r = makeAnalysisResult({ files: [] })
    expect(r.files).toHaveLength(0)
  })

  it('files array can hold multiple FileAnalysisResults', () => {
    const r = makeAnalysisResult({
      files: [makeFileResult({ filePath: '/a.ts' }), makeFileResult({ filePath: '/b.ts' })],
    })
    expect(r.files).toHaveLength(2)
  })

  it('timestamp is an ISO date string', () => {
    const r = makeAnalysisResult({ timestamp: '2024-06-15T10:30:00.000Z' })
    const d = new Date(r.timestamp)
    expect(d.getTime()).not.toBeNaN()
  })

  it('can be serialized to JSON and back', () => {
    const r = makeAnalysisResult({
      files: [makeFileResult()],
      version: '3.0.0',
    })
    const json = JSON.stringify(r)
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('3.0.0')
    expect(parsed.files).toHaveLength(1)
  })

  it('can compute total violations across files', () => {
    const r = makeAnalysisResult({
      files: [
        makeFileResult({ violations: [makeViolation(), makeViolation()] }),
        makeFileResult({ violations: [makeViolation()] }),
      ],
    })
    const total = r.files.reduce((sum, f) => sum + f.violations.length, 0)
    expect(total).toBe(3)
  })

  it('summary errorCount can differ from actual error violations', () => {
    const r = makeAnalysisResult({
      files: [
        makeFileResult({
          violations: [makeViolation({ severity: 'error' })],
        }),
      ],
      summary: {
        errorCount: 99,
        filesWithViolations: 1,
        infoCount: 0,
        totalFiles: 1,
        totalTime: 10,
        warningCount: 0,
      },
    })
    expect(r.summary.errorCount).toBe(99)
  })

  it('can filter files by violation count', () => {
    const r = makeAnalysisResult({
      files: [
        makeFileResult({ violations: [] }),
        makeFileResult({ violations: [makeViolation()] }),
        makeFileResult({ violations: [makeViolation(), makeViolation()] }),
      ],
    })
    const withViolations = r.files.filter((f) => f.violations.length > 0)
    expect(withViolations).toHaveLength(2)
  })

  it('can compute max analysisTime across files', () => {
    const r = makeAnalysisResult({
      files: [
        makeFileResult({ stats: makeStats({ analysisTime: 50 }) }),
        makeFileResult({ stats: makeStats({ analysisTime: 200 }) }),
        makeFileResult({ stats: makeStats({ analysisTime: 100 }) }),
      ],
    })
    const maxTime = Math.max(...r.files.map((f) => f.stats.analysisTime))
    expect(maxTime).toBe(200)
  })

  it('can be cloned via deep spread', () => {
    const r1 = makeAnalysisResult({ version: '1.0.0' })
    const r2: AnalysisResult = {
      ...r1,
      summary: { ...r1.summary },
      files: [...r1.files],
    }
    expect(r2).toEqual(r1)
    expect(r2.summary).not.toBe(r1.summary)
  })

  it('summary properties are all numbers', () => {
    const s = makeAnalysisResult().summary
    for (const val of Object.values(s)) {
      expect(typeof val).toBe('number')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — ReporterOptions
// ═══════════════════════════════════════════════════════════════════════

describe('ReporterOptions interface', () => {
  it('can be an empty object', () => {
    const opts: ReporterOptions = {}
    expect(Object.keys(opts)).toHaveLength(0)
  })

  it('color can be true', () => {
    const opts: ReporterOptions = { color: true }
    expect(opts.color).toBe(true)
  })

  it('color can be false', () => {
    const opts: ReporterOptions = { color: false }
    expect(opts.color).toBe(false)
  })

  it('errorsOnly can be true', () => {
    const opts: ReporterOptions = { errorsOnly: true }
    expect(opts.errorsOnly).toBe(true)
  })

  it('errorsOnly can be false', () => {
    const opts: ReporterOptions = { errorsOnly: false }
    expect(opts.errorsOnly).toBe(false)
  })

  it('includeSource can be true', () => {
    const opts: ReporterOptions = { includeSource: true }
    expect(opts.includeSource).toBe(true)
  })

  it('includeSource can be false', () => {
    const opts: ReporterOptions = { includeSource: false }
    expect(opts.includeSource).toBe(false)
  })

  it('outputPath can be a relative path', () => {
    const opts: ReporterOptions = { outputPath: './out/report.json' }
    expect(opts.outputPath).toBe('./out/report.json')
  })

  it('outputPath can be an absolute path', () => {
    const opts: ReporterOptions = { outputPath: '/tmp/report.json' }
    expect(opts.outputPath).toBe('/tmp/report.json')
  })

  it('pretty can be true', () => {
    const opts: ReporterOptions = { pretty: true }
    expect(opts.pretty).toBe(true)
  })

  it('pretty can be false', () => {
    const opts: ReporterOptions = { pretty: false }
    expect(opts.pretty).toBe(false)
  })

  it('quiet can be true', () => {
    const opts: ReporterOptions = { quiet: true }
    expect(opts.quiet).toBe(true)
  })

  it('quiet can be false', () => {
    const opts: ReporterOptions = { quiet: false }
    expect(opts.quiet).toBe(false)
  })

  it('verbose can be true', () => {
    const opts: ReporterOptions = { verbose: true }
    expect(opts.verbose).toBe(true)
  })

  it('verbose can be false', () => {
    const opts: ReporterOptions = { verbose: false }
    expect(opts.verbose).toBe(false)
  })

  it('all options can be set simultaneously', () => {
    const opts: ReporterOptions = {
      color: true,
      errorsOnly: true,
      includeSource: true,
      outputPath: '/out.txt',
      pretty: true,
      quiet: false,
      verbose: true,
    }
    expect(Object.keys(opts)).toHaveLength(7)
  })

  it('all options are undefined by default', () => {
    const opts: ReporterOptions = {}
    expect(opts.color).toBeUndefined()
    expect(opts.errorsOnly).toBeUndefined()
    expect(opts.includeSource).toBeUndefined()
    expect(opts.outputPath).toBeUndefined()
    expect(opts.pretty).toBeUndefined()
    expect(opts.quiet).toBeUndefined()
    expect(opts.verbose).toBeUndefined()
  })

  it('can be spread and overridden', () => {
    const base: ReporterOptions = { color: true, verbose: false }
    const override: ReporterOptions = { ...base, verbose: true }
    expect(override.color).toBe(true)
    expect(override.verbose).toBe(true)
  })

  it('can be passed to a function', () => {
    function useOptions(opts: ReporterOptions): boolean {
      return opts.verbose ?? false
    }
    expect(useOptions({ verbose: true })).toBe(true)
    expect(useOptions({})).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Reporter
// ═══════════════════════════════════════════════════════════════════════

describe('Reporter interface', () => {
  it('has required name property', () => {
    const r = makeReporter()
    expect(r.name).toBe('test-reporter')
  })

  it('name is a string', () => {
    const r = makeReporter()
    expect(typeof r.name).toBe('string')
  })

  it('format is a function', () => {
    const r = makeReporter()
    expect(typeof r.format).toBe('function')
  })

  it('format returns a string', () => {
    const r = makeReporter()
    const result = r.format(makeViolation())
    expect(typeof result).toBe('string')
  })

  it('report is a function', () => {
    const r = makeReporter()
    expect(typeof r.report).toBe('function')
  })

  it('report accepts an AnalysisResult', () => {
    let called = false
    const r: Reporter = {
      name: 'spy',
      format: () => '',
      report: (_results: AnalysisResult) => {
        called = true
      },
    }
    r.report(makeAnalysisResult())
    expect(called).toBe(true)
  })

  it('init is optional', () => {
    const r = makeReporter()
    expect(r.init).toBeUndefined()
  })

  it('dispose is optional', () => {
    const r = makeReporter()
    expect(r.dispose).toBeUndefined()
  })

  it('init can be a sync function', () => {
    let inited = false
    const r: Reporter = {
      name: 'sync-init',
      format: () => '',
      report: () => {},
      init: () => {
        inited = true
      },
    }
    r.init?.()
    expect(inited).toBe(true)
  })

  it('init can be an async function', async () => {
    let inited = false
    const r: Reporter = {
      name: 'async-init',
      format: () => '',
      report: () => {},
      init: async () => {
        inited = true
      },
    }
    await r.init?.()
    expect(inited).toBe(true)
  })

  it('dispose can be a sync function', () => {
    let disposed = false
    const r: Reporter = {
      name: 'sync-dispose',
      format: () => '',
      report: () => {},
      dispose: () => {
        disposed = true
      },
    }
    r.dispose?.()
    expect(disposed).toBe(true)
  })

  it('dispose can be an async function', async () => {
    let disposed = false
    const r: Reporter = {
      name: 'async-dispose',
      format: () => '',
      report: () => {},
      dispose: async () => {
        disposed = true
      },
    }
    await r.dispose?.()
    expect(disposed).toBe(true)
  })

  it('format can produce custom output', () => {
    const r: Reporter = {
      name: 'custom',
      format: (v) => `[${v.ruleId}] ${v.message}`,
      report: () => {},
    }
    expect(r.format(makeViolation({ ruleId: 'r1', message: 'msg' }))).toBe('[r1] msg')
  })

  it('report can process results', () => {
    let count = 0
    const r: Reporter = {
      name: 'counter',
      format: () => '',
      report: (res) => {
        count = res.files.length
      },
    }
    r.report(makeAnalysisResult({ files: [makeFileResult(), makeFileResult()] }))
    expect(count).toBe(2)
  })

  it('name property is readonly at type level', () => {
    const r = makeReporter()
    expect(r.name).toBe('test-reporter')
  })

  it('can implement a reporter that formats as JSON', () => {
    const r: Reporter = {
      name: 'json',
      format: (v) => JSON.stringify(v),
      report: () => {},
    }
    const output = r.format(makeViolation({ ruleId: 'r1' }))
    const parsed = JSON.parse(output)
    expect(parsed.ruleId).toBe('r1')
  })

  it('can implement a reporter that collects violations', () => {
    const collected: Violation[] = []
    const r: Reporter = {
      name: 'collector',
      format: (v) => {
        collected.push(v)
        return v.message
      },
      report: () => {},
    }
    r.format(makeViolation({ message: 'a' }))
    r.format(makeViolation({ message: 'b' }))
    expect(collected).toHaveLength(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — ReporterFactory
// ═══════════════════════════════════════════════════════════════════════

describe('ReporterFactory type', () => {
  it('is a function that takes ReporterOptions', () => {
    const factory: ReporterFactory = (_opts) => makeReporter()
    expect(typeof factory).toBe('function')
  })

  it('returns a Reporter', () => {
    const factory: ReporterFactory = () => makeReporter()
    const reporter = factory({})
    expect(reporter.name).toBeDefined()
    expect(typeof reporter.format).toBe('function')
    expect(typeof reporter.report).toBe('function')
  })

  it('can use options to configure the reporter', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'option-aware',
      format: (v) => (opts.verbose ? `[${v.severity}] ${v.message}` : v.message),
      report: () => {},
    })
    const verbose = factory({ verbose: true })
    const terse = factory({ verbose: false })
    const v = makeViolation({ severity: 'error', message: 'fail' })
    expect(verbose.format(v)).toBe('[error] fail')
    expect(terse.format(v)).toBe('fail')
  })

  it('can create reporters with different names', () => {
    const factory: ReporterFactory = (opts) => ({
      name: opts.outputPath ?? 'default',
      format: () => '',
      report: () => {},
    })
    expect(factory({ outputPath: 'custom' }).name).toBe('custom')
    expect(factory({}).name).toBe('default')
  })

  it('can create a reporter that uses color option', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'colored',
      format: (v) => (opts.color ? `\x1b[31m${v.message}\x1b[0m` : v.message),
      report: () => {},
    })
    const colored = factory({ color: true })
    const plain = factory({ color: false })
    expect(colored.format(makeViolation({ message: 'err' }))).toContain('\x1b[31m')
    expect(plain.format(makeViolation({ message: 'err' }))).toBe('err')
  })

  it('can create a reporter that uses errorsOnly option', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'errors-only',
      format: (v) => (v.severity === 'error' || !opts.errorsOnly ? v.message : ''),
      report: () => {},
    })
    const eo = factory({ errorsOnly: true })
    const all = factory({ errorsOnly: false })
    const warn = makeViolation({ severity: 'warning', message: 'warn' })
    expect(eo.format(warn)).toBe('')
    expect(all.format(warn)).toBe('warn')
  })

  it('can create a reporter that uses pretty option', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'pretty',
      format: (v) => JSON.stringify(v, null, opts.pretty ? 2 : 0),
      report: () => {},
    })
    const pretty = factory({ pretty: true })
    const compact = factory({ pretty: false })
    expect(pretty.format(makeViolation())).toContain('\n')
    expect(compact.format(makeViolation())).not.toContain('\n')
  })

  it('can create a reporter that uses quiet option', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'quiet',
      format: () => '',
      report: (_r) => {
        if (!opts.quiet) console.log('reporting')
      },
    })
    const quiet = factory({ quiet: true })
    const loud = factory({ quiet: false })
    expect(typeof quiet.report).toBe('function')
    expect(typeof loud.report).toBe('function')
  })

  it('can create a reporter with includeSource option', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'source',
      format: (v) => (opts.includeSource && v.source ? v.source : v.message),
      report: () => {},
    })
    const withSource = factory({ includeSource: true })
    const withoutSource = factory({ includeSource: false })
    const v = makeViolation({ source: 'code here', message: 'msg' })
    expect(withSource.format(v)).toBe('code here')
    expect(withoutSource.format(v)).toBe('msg')
  })

  it('factory calls produce independent reporter instances', () => {
    let counter = 0
    const factory: ReporterFactory = () => {
      const id = counter++
      return {
        name: `reporter-${id}`,
        format: () => String(id),
        report: () => {},
      }
    }
    const r1 = factory({})
    const r2 = factory({})
    expect(r1.name).not.toBe(r2.name)
    expect(r1.format(makeViolation())).not.toBe(r2.format(makeViolation()))
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — ReporterRegistryEntry
// ═══════════════════════════════════════════════════════════════════════

describe('ReporterRegistryEntry interface', () => {
  it('has required name field', () => {
    const entry: ReporterRegistryEntry = {
      name: 'test',
      factory: () => makeReporter(),
    }
    expect(entry.name).toBe('test')
  })

  it('has required factory field', () => {
    const entry: ReporterRegistryEntry = {
      name: 'test',
      factory: () => makeReporter(),
    }
    expect(typeof entry.factory).toBe('function')
  })

  it('description is optional', () => {
    const entry: ReporterRegistryEntry = {
      name: 'test',
      factory: () => makeReporter(),
    }
    expect(entry.description).toBeUndefined()
  })

  it('description can be set', () => {
    const entry: ReporterRegistryEntry = {
      name: 'test',
      description: 'A test reporter',
      factory: () => makeReporter(),
    }
    expect(entry.description).toBe('A test reporter')
  })

  it('description can be an empty string', () => {
    const entry: ReporterRegistryEntry = {
      name: 'test',
      description: '',
      factory: () => makeReporter(),
    }
    expect(entry.description).toBe('')
  })

  it('factory creates a Reporter instance', () => {
    const entry: ReporterRegistryEntry = {
      name: 'my-reporter',
      factory: () => makeReporter({ name: 'my-reporter' }),
    }
    const reporter = entry.factory({})
    expect(reporter.name).toBe('my-reporter')
  })

  it('factory passes options through', () => {
    const entry: ReporterRegistryEntry = {
      name: 'opt',
      factory: (opts) => ({
        name: 'opt',
        format: () => String(opts.verbose),
        report: () => {},
      }),
    }
    expect(entry.factory({ verbose: true }).format(makeViolation())).toBe('true')
    expect(entry.factory({ verbose: false }).format(makeViolation())).toBe('false')
  })

  it('can be stored in a Map', () => {
    const registry = new Map<string, ReporterRegistryEntry>()
    const entry: ReporterRegistryEntry = {
      name: 'map-test',
      factory: () => makeReporter(),
    }
    registry.set(entry.name, entry)
    expect(registry.get('map-test')).toBe(entry)
  })

  it('can be stored in a Record', () => {
    const registry: Record<string, ReporterRegistryEntry> = {}
    registry['json'] = {
      name: 'json',
      description: 'JSON reporter',
      factory: () => makeReporter({ name: 'json' }),
    }
    expect(registry['json'].name).toBe('json')
  })

  it('can be part of an array', () => {
    const entries: ReporterRegistryEntry[] = [
      { name: 'a', factory: () => makeReporter() },
      { name: 'b', factory: () => makeReporter() },
      { name: 'c', factory: () => makeReporter() },
    ]
    expect(entries).toHaveLength(3)
    expect(entries.map((e) => e.name)).toEqual(['a', 'b', 'c'])
  })

  it('can be looked up by name in an array', () => {
    const entries: ReporterRegistryEntry[] = [
      { name: 'json', factory: () => makeReporter() },
      { name: 'html', factory: () => makeReporter() },
    ]
    const found = entries.find((e) => e.name === 'html')
    expect(found).toBeDefined()
    expect(found!.name).toBe('html')
  })

  it('can be serialized to JSON', () => {
    const entry: ReporterRegistryEntry = {
      name: 'ser',
      description: 'serializable',
      factory: () => makeReporter(),
    }
    const json = JSON.stringify({ name: entry.name, description: entry.description })
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('ser')
    expect(parsed.description).toBe('serializable')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Integration / Cross-type interactions
// ═══════════════════════════════════════════════════════════════════════

describe('Cross-type integration', () => {
  it('Reporter.format receives Violation and returns string', () => {
    const r = makeReporter({
      format: (v) => `${v.filePath}:${v.line}:${v.column} ${v.severity} ${v.ruleId} ${v.message}`,
    })
    const output = r.format(
      makeViolation({
        filePath: '/a.ts',
        line: 5,
        column: 10,
        severity: 'error',
        ruleId: 'r1',
        message: 'oops',
      }),
    )
    expect(output).toBe('/a.ts:5:10 error r1 oops')
  })

  it('Reporter.report receives AnalysisResult with nested data', () => {
    let received: AnalysisResult | undefined
    const r: Reporter = {
      name: 'capture',
      format: () => '',
      report: (res) => {
        received = res
      },
    }
    const input = makeAnalysisResult({
      files: [
        makeFileResult({
          violations: [
            makeViolation({ severity: 'error' }),
            makeViolation({ severity: 'warning' }),
          ],
        }),
      ],
      summary: {
        errorCount: 1,
        filesWithViolations: 1,
        infoCount: 0,
        totalFiles: 1,
        totalTime: 50,
        warningCount: 1,
      },
    })
    r.report(input)
    expect(received).toBe(input)
    expect(received!.files[0].violations).toHaveLength(2)
  })

  it('ReporterFactory creates Reporter that can process AnalysisResult', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'integr',
      format: (v) => `${v.ruleId}: ${v.message}`,
      report: (res) => {
        const msgs = res.files.flatMap((f) => f.violations.map((v) => f.filePath + ':' + v.message))
        if (opts.verbose) console.log(msgs)
      },
    })
    const reporter = factory({ verbose: true })
    const result = reporter.format(makeViolation({ ruleId: 'r1', message: 'm1' }))
    expect(result).toBe('r1: m1')
  })

  it('ReporterRegistryEntry.factory creates working Reporter', () => {
    const entry: ReporterRegistryEntry = {
      name: 'integration',
      description: 'Integration test reporter',
      factory: (opts) => ({
        name: 'integration',
        format: (v) => (opts.pretty ? JSON.stringify(v, null, 2) : JSON.stringify(v)),
        report: (res) => {
          if (!opts.quiet) {
            res.files.forEach((f) =>
              f.violations.forEach((v) => {
                void v
              }),
            )
          }
        },
      }),
    }
    const reporter = entry.factory({ pretty: false, quiet: true })
    const output = reporter.format(makeViolation())
    const parsed = JSON.parse(output)
    expect(parsed.severity).toBe('error')
  })

  it('full pipeline: violations → file result → analysis result → reporter', () => {
    const v1 = makeViolation({ severity: 'error', ruleId: 'r1', message: 'error 1' })
    const v2 = makeViolation({ severity: 'warning', ruleId: 'r2', message: 'warning 1' })
    const v3 = makeViolation({ severity: 'info', ruleId: 'r3', message: 'info 1' })
    const fileResult = makeFileResult({
      filePath: '/src/app.ts',
      stats: makeStats({ analysisTime: 100, parseTime: 50, totalTime: 150 }),
      violations: [v1, v2, v3],
    })
    const analysisResult = makeAnalysisResult({
      files: [fileResult],
      summary: {
        errorCount: 1,
        filesWithViolations: 1,
        infoCount: 1,
        totalFiles: 1,
        totalTime: 150,
        warningCount: 1,
      },
      version: '1.0.0',
    })

    let reportCalled = false
    const reporter: Reporter = {
      name: 'pipeline',
      format: (v) => `[${v.severity}] ${v.ruleId}: ${v.message}`,
      report: (res) => {
        reportCalled = true
        expect(res.files[0].violations).toHaveLength(3)
      },
    }

    expect(reporter.format(v1)).toBe('[error] r1: error 1')
    expect(reporter.format(v2)).toBe('[warning] r2: warning 1')
    expect(reporter.format(v3)).toBe('[info] r3: info 1')
    reporter.report(analysisResult)
    expect(reportCalled).toBe(true)
  })

  it('multiple reporters can process the same AnalysisResult', () => {
    const result = makeAnalysisResult({
      files: [makeFileResult({ violations: [makeViolation()] })],
    })
    const outputs: string[] = []

    const reporters: Reporter[] = [
      {
        name: 'r1',
        format: (v) => `R1: ${v.message}`,
        report: (r) => outputs.push(`R1 processed ${r.files.length} files`),
      },
      {
        name: 'r2',
        format: (v) => `R2: ${v.message}`,
        report: (r) => outputs.push(`R2 processed ${r.files.length} files`),
      },
    ]

    reporters.forEach((r) => r.report(result))
    expect(outputs).toEqual(['R1 processed 1 files', 'R2 processed 1 files'])
  })

  it('registry can create multiple reporter types', () => {
    const registry: ReporterRegistryEntry[] = [
      {
        name: 'json',
        factory: () => ({
          name: 'json',
          format: (v) => JSON.stringify(v),
          report: () => {},
        }),
      },
      {
        name: 'text',
        factory: () => ({
          name: 'text',
          format: (v) => v.message,
          report: () => {},
        }),
      },
    ]

    const jsonReporter = registry[0].factory({})
    const textReporter = registry[1].factory({})

    const v = makeViolation({ message: 'hello' })
    expect(JSON.parse(jsonReporter.format(v)).message).toBe('hello')
    expect(textReporter.format(v)).toBe('hello')
  })

  it('options control reporter behavior end-to-end', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'e2e',
      format: (v) => {
        if (opts.errorsOnly && v.severity !== 'error') return ''
        const prefix = opts.color ? '\x1b[31m' : ''
        const suffix = opts.color ? '\x1b[0m' : ''
        return `${prefix}${v.severity}: ${v.message}${suffix}`
      },
      report: () => {},
    })

    const ciReporter = factory({ errorsOnly: true, color: false })
    const devReporter = factory({ errorsOnly: false, color: true })

    const error = makeViolation({ severity: 'error', message: 'bad' })
    const warning = makeViolation({ severity: 'warning', message: 'meh' })

    expect(ciReporter.format(error)).toBe('error: bad')
    expect(ciReporter.format(warning)).toBe('')
    expect(devReporter.format(error)).toContain('\x1b[31m')
    expect(devReporter.format(warning)).toBe('\x1b[31mwarning: meh\x1b[0m')
  })

  it('AnalysisResult with empty files still has valid summary', () => {
    const result = makeAnalysisResult({ files: [] })
    expect(result.summary.totalFiles).toBe(0)
    expect(result.files).toHaveLength(0)
    expect(typeof result.timestamp).toBe('string')
  })

  it('Violation.meta can carry arbitrary diagnostic data', () => {
    const v = makeViolation({
      meta: {
        fixable: true,
        fixRange: { start: 0, end: 10 },
        suggestions: ['fix a', 'fix b'],
        deprecated: true,
        replacedBy: ['new-rule'],
      },
    })
    expect(v.meta?.fixable).toBe(true)
    expect((v.meta?.suggestions as string[]).length).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Immutability & object behavior
// ═══════════════════════════════════════════════════════════════════════

describe('Object behavior and immutability patterns', () => {
  it('Violation optional fields default to undefined', () => {
    const v: Violation = {
      column: 1,
      filePath: 'a.ts',
      line: 1,
      message: 'm',
      ruleId: 'r',
      severity: 'error',
    }
    const optionalKeys = ['endColumn', 'endLine', 'meta', 'source', 'suggestion']
    optionalKeys.forEach((key) => {
      expect((v as Record<string, unknown>)[key]).toBeUndefined()
    })
  })

  it('AnalysisStats has exactly 3 keys', () => {
    const s = makeStats()
    expect(Object.keys(s)).toHaveLength(3)
  })

  it('FileAnalysisResult has exactly 3 keys', () => {
    const r = makeFileResult()
    expect(Object.keys(r)).toHaveLength(3)
  })

  it('AnalysisResult has exactly 3 required keys', () => {
    const r = makeAnalysisResult()
    expect(Object.keys(r)).toHaveLength(3)
  })

  it('AnalysisResult has 4 keys when version is present', () => {
    const r = makeAnalysisResult({ version: '1.0.0' })
    expect(Object.keys(r)).toHaveLength(4)
  })

  it('AnalysisResult summary has exactly 6 keys', () => {
    const s = makeAnalysisResult().summary
    expect(Object.keys(s)).toHaveLength(6)
  })

  it('ReporterOptions has 0 keys when empty', () => {
    const o: ReporterOptions = {}
    expect(Object.keys(o)).toHaveLength(0)
  })

  it('ReporterOptions has 7 keys when all set', () => {
    const o: ReporterOptions = {
      color: true,
      errorsOnly: true,
      includeSource: true,
      outputPath: 'o',
      pretty: true,
      quiet: true,
      verbose: true,
    }
    expect(Object.keys(o)).toHaveLength(7)
  })

  it('ReporterRegistryEntry has 2 keys without description', () => {
    const e: ReporterRegistryEntry = { name: 'n', factory: () => makeReporter() }
    expect(Object.keys(e)).toHaveLength(2)
  })

  it('ReporterRegistryEntry has 3 keys with description', () => {
    const e: ReporterRegistryEntry = {
      name: 'n',
      description: 'd',
      factory: () => makeReporter(),
    }
    expect(Object.keys(e)).toHaveLength(3)
  })

  it('Reporter name is string type', () => {
    const r = makeReporter()
    expect(typeof r.name).toBe('string')
    expect(r.name.length).toBeGreaterThan(0)
  })

  it('Severity values are distinct strings', () => {
    const values: Severity[] = ['error', 'warning', 'info']
    const unique = new Set(values)
    expect(unique.size).toBe(3)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// NEW TESTS — Edge cases
// ═══════════════════════════════════════════════════════════════════════

describe('Edge cases', () => {
  it('Violation with column 0', () => {
    const v = makeViolation({ column: 0 })
    expect(v.column).toBe(0)
  })

  it('Violation with line 0', () => {
    const v = makeViolation({ line: 0 })
    expect(v.line).toBe(0)
  })

  it('Violation with negative column (unusual but typed as number)', () => {
    const v = makeViolation({ column: -1 })
    expect(v.column).toBe(-1)
  })

  it('Violation with very large line number', () => {
    const v = makeViolation({ line: Number.MAX_SAFE_INTEGER })
    expect(v.line).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('Violation with very large column number', () => {
    const v = makeViolation({ column: Number.MAX_SAFE_INTEGER })
    expect(v.column).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('AnalysisStats with Infinity', () => {
    const s: AnalysisStats = {
      analysisTime: Infinity,
      parseTime: Infinity,
      totalTime: Infinity,
    }
    expect(s.analysisTime).toBe(Infinity)
  })

  it('Violation filePath with special characters', () => {
    const v = makeViolation({ filePath: '/path/with spaces/and-dashes/file.ts' })
    expect(v.filePath).toContain(' ')
  })

  it('Violation filePath with unicode', () => {
    const v = makeViolation({ filePath: '/路径/文件.ts' })
    expect(v.filePath).toContain('/路径/')
  })

  it('Violation ruleId with dots', () => {
    const v = makeViolation({ ruleId: 'security.eval.no-unsafe' })
    expect(v.ruleId).toContain('.')
  })

  it('Violation message with special characters', () => {
    const v = makeViolation({ message: 'Unexpected token `=>` at line 5' })
    expect(v.message).toContain('`=>`')
  })

  it('Violation source with multi-line code', () => {
    const v = makeViolation({
      source: 'function foo() {\n  return bar\n}',
    })
    expect(v.source!.split('\n')).toHaveLength(3)
  })

  it('AnalysisResult timestamp can be any ISO string', () => {
    const ts = '1999-12-31T23:59:59.999Z'
    const r = makeAnalysisResult({ timestamp: ts })
    expect(r.timestamp).toBe(ts)
  })

  it('FileAnalysisResult with many violations', () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ message: `violation ${i}` }),
    )
    const r = makeFileResult({ violations })
    expect(r.violations).toHaveLength(100)
  })

  it('AnalysisResult with many files', () => {
    const files = Array.from({ length: 50 }, (_, i) => makeFileResult({ filePath: `/file${i}.ts` }))
    const r = makeAnalysisResult({ files })
    expect(r.files).toHaveLength(50)
  })

  it('ReporterFactory with all options set to false', () => {
    const factory: ReporterFactory = (opts) => ({
      name: 'all-false',
      format: () => '',
      report: () => {},
    })
    const reporter = factory({
      color: false,
      errorsOnly: false,
      includeSource: false,
      pretty: false,
      quiet: false,
      verbose: false,
    })
    expect(reporter.name).toBe('all-false')
  })

  it('Violation meta with empty object', () => {
    const v = makeViolation({ meta: {} })
    expect(v.meta).toEqual({})
    expect(Object.keys(v.meta!)).toHaveLength(0)
  })

  it('Violation meta with deeply nested data', () => {
    const v = makeViolation({
      meta: { level1: { level2: { level3: 'deep' } } },
    })
    expect((v.meta as Record<string, unknown>).level1).toBeDefined()
  })

  it('Reporter init and dispose can both be sync', () => {
    let state = 'created'
    const r: Reporter = {
      name: 'sync-lifecycle',
      format: () => '',
      report: () => {},
      init: () => {
        state = 'initialized'
      },
      dispose: () => {
        state = 'disposed'
      },
    }
    r.init?.()
    expect(state).toBe('initialized')
    r.dispose?.()
    expect(state).toBe('disposed')
  })

  it('Reporter init and dispose can both be async', async () => {
    let state = 'created'
    const r: Reporter = {
      name: 'async-lifecycle',
      format: () => '',
      report: () => {},
      init: async () => {
        state = 'initialized'
      },
      dispose: async () => {
        state = 'disposed'
      },
    }
    await r.init?.()
    expect(state).toBe('initialized')
    await r.dispose?.()
    expect(state).toBe('disposed')
  })

  it('Reporter format can return empty string', () => {
    const r: Reporter = {
      name: 'empty-format',
      format: () => '',
      report: () => {},
    }
    expect(r.format(makeViolation())).toBe('')
  })

  it('Reporter report can be a no-op', () => {
    const r: Reporter = {
      name: 'noop',
      format: () => '',
      report: () => {},
    }
    expect(() => r.report(makeAnalysisResult())).not.toThrow()
  })

  it('AnalysisResult with version as empty string', () => {
    const r = makeAnalysisResult({ version: '' })
    expect(r.version).toBe('')
  })

  it('AnalysisResult with version as prerelease string', () => {
    const r = makeAnalysisResult({ version: '2.0.0-beta.1' })
    expect(r.version).toContain('beta')
  })

  it('ReporterOptions outputPath can be empty string', () => {
    const o: ReporterOptions = { outputPath: '' }
    expect(o.outputPath).toBe('')
  })

  it('ReporterRegistryEntry name can contain hyphens', () => {
    const e: ReporterRegistryEntry = {
      name: 'my-custom-reporter',
      factory: () => makeReporter(),
    }
    expect(e.name).toContain('-')
  })

  it('Multiple Violations with same ruleId can be distinguished', () => {
    const v1 = makeViolation({ ruleId: 'dup', line: 5, message: 'first' })
    const v2 = makeViolation({ ruleId: 'dup', line: 10, message: 'second' })
    expect(v1.line).not.toBe(v2.line)
    expect(v1.message).not.toBe(v2.message)
  })

  it('Violation suggestion can be empty string', () => {
    const v = makeViolation({ suggestion: '' })
    expect(v.suggestion).toBe('')
  })

  it('Violation source can be empty string', () => {
    const v = makeViolation({ source: '' })
    expect(v.source).toBe('')
  })

  it('Summary counts can be non-zero with empty files array', () => {
    const r = makeAnalysisResult({
      files: [],
      summary: {
        errorCount: 10,
        filesWithViolations: 5,
        infoCount: 3,
        totalFiles: 0,
        totalTime: 0,
        warningCount: 7,
      },
    })
    expect(r.files).toHaveLength(0)
    expect(r.summary.errorCount).toBe(10)
  })
})
