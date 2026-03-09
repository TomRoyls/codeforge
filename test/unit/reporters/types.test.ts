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
