import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { HTMLReporter } from '../../../src/reporters/html-reporter.js'
import type { AnalysisResult, Violation, FileAnalysisResult } from '../../../src/reporters/types.js'

vi.mock('fs')
vi.mock('path')

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation message',
    filePath: 'test.ts',
    line: 10,
    column: 5,
    ...overrides,
  }
}

function createMockFileResult(
  filePath: string,
  violations: Violation[] = [],
  stats: FileAnalysisResult['stats'] = { parseTime: 10, analysisTime: 20, totalTime: 30 },
): FileAnalysisResult {
  return {
    filePath,
    violations,
    stats,
  }
}

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      totalFiles: 0,
      filesWithViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalTime: 100,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function getHtml(reporter: HTMLReporter, results: AnalysisResult): string {
  const mockFsExists = vi.mocked(fs.existsSync).mockReturnValue(true)
  reporter.report(results)
  mockFsExists.mockRestore()
  const html = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string
  return html
}

function getHtmlWithDir(
  reporter: HTMLReporter,
  results: AnalysisResult,
  dirExists: boolean,
): string {
  vi.mocked(fs.existsSync).mockReturnValue(dirExists)
  reporter.report(results)
  return vi.mocked(fs.writeFileSync).mock.calls[0][1] as string
}

function createEmptySummary() {
  return {
    totalFiles: 0,
    filesWithViolations: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    totalTime: 0,
  }
}

function createResultsWithFiles(
  files: FileAnalysisResult[],
  summaryOverrides: Partial<AnalysisResult['summary']> = {},
) {
  return createMockAnalysisResult({
    files,
    summary: { ...createEmptySummary(), ...summaryOverrides },
  })
}

describe('HTMLReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let fsExistsSyncMock: ReturnType<typeof vi.fn>
  let fsMkdirSyncMock: ReturnType<typeof vi.fn>
  let fsWriteFileSyncMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    fsExistsSyncMock = vi.mocked(fs.existsSync)
    fsMkdirSyncMock = vi.mocked(fs.mkdirSync)
    fsWriteFileSyncMock = vi.mocked(fs.writeFileSync)
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    vi.clearAllMocks()
  })

  // ====================================================================
  // CONSTRUCTOR (4 tests)
  // ====================================================================
  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new HTMLReporter()
      expect(reporter.name).toBe('html')
    })

    test('should use default output path', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        'codeforge-report.html',
        expect.any(String),
        'utf8',
      )
    })

    test('should accept custom output path', () => {
      const reporter = new HTMLReporter({ outputPath: './custom-report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        './custom-report.html',
        expect.any(String),
        'utf8',
      )
    })

    test('should handle empty options object', () => {
      const reporter = new HTMLReporter({})
      expect(reporter.name).toBe('html')
    })
  })

  // ====================================================================
  // FORMAT METHOD (10 tests)
  // ====================================================================
  describe('format', () => {
    test('should format violation as escaped HTML', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain('test.ts:10:5')
      expect(output).toContain('ERROR')
      expect(output).toContain('Test violation message')
    })

    test('should escape HTML special characters in message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '<script>alert("xss")</script>' })
      const output = reporter.format(violation)
      expect(output).toContain('&lt;script&gt;')
      expect(output).toContain('&quot;xss&quot;')
      expect(output).not.toContain('<script>')
    })

    test('should escape ampersands', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Use && instead of &amp;' })
      const output = reporter.format(violation)
      expect(output).toContain('&amp;&amp;')
    })

    test('should escape less than and greater than', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Value must be < 10 and > 0' })
      const output = reporter.format(violation)
      expect(output).toContain('&lt;')
      expect(output).toContain('&gt;')
    })

    test('should format warning severity', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'warning' })
      const output = reporter.format(violation)
      expect(output).toContain('WARNING')
    })

    test('should format info severity', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'info' })
      const output = reporter.format(violation)
      expect(output).toContain('INFO')
    })

    test('should include file path in formatted output', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ filePath: 'src/utils/helper.ts' })
      const output = reporter.format(violation)
      expect(output).toContain('src/utils/helper.ts')
    })

    test('should include line and column in formatted output', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 42, column: 15 })
      const output = reporter.format(violation)
      expect(output).toContain(':42:15')
    })

    test('should format error severity as uppercase', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'error' })
      const output = reporter.format(violation)
      expect(output).toContain('ERROR')
      expect(output).not.toContain('error')
    })

    test('should escape single quotes', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: "It's a problem" })
      const output = reporter.format(violation)
      expect(output).toContain('&#039;')
    })
  })

  // ====================================================================
  // REPORT METHOD (8 tests)
  // ====================================================================
  describe('report', () => {
    test('should write HTML file', () => {
      const reporter = new HTMLReporter({ outputPath: './report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalled()
    })

    test('should print console message after generation', () => {
      const reporter = new HTMLReporter({ outputPath: './report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledWith('HTML report generated: ./report.html\n')
    })

    test('should create directory if it does not exist', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/nested/report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('./reports/nested')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/nested', { recursive: true })
    })

    test('should not create directory if it exists', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      vi.mocked(path.dirname).mockReturnValue('./reports')
      reporter.report(results)
      expect(fsMkdirSyncMock).not.toHaveBeenCalled()
    })

    test('should print output path in console message', () => {
      const reporter = new HTMLReporter({ outputPath: 'my-output.html' })
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledWith('HTML report generated: my-output.html\n')
    })

    test('should call writeFileSync once per report', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledTimes(1)
    })

    test('should use default output path when no option given', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        'codeforge-report.html',
        expect.any(String),
        'utf8',
      )
    })

    test('should handle deeply nested output path', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/2024/01/15/deep/report.html' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('./reports/2024/01/15/deep')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/2024/01/15/deep', { recursive: true })
    })
  })

  // ====================================================================
  // HTML DOCUMENT STRUCTURE (12 tests)
  // ====================================================================
  describe('HTML structure', () => {
    test('should generate valid HTML document', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('</html>')
    })

    test('should include title', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<title>CodeForge Analysis Report</title>')
    })

    test('should include timestamp in header', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-03-15T12:30:00.000Z',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('2024-03-15T12:30:00.000Z')
    })

    test('should include version when provided', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        version: '2.0.0',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Version: 2.0.0')
    })

    test('should not include version section when not provided', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('Version:')
    })

    test('should include CSS styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<style>')
      expect(html).toContain(':root')
      expect(html).toContain('--error-color')
    })

    test('should include JavaScript', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<script>')
      expect(html).toContain('filterBy')
    })

    test('should include meta charset', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<meta charset="UTF-8">')
    })

    test('should include viewport meta tag', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      )
    })

    test('should include header h1', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<h1>CodeForge Analysis Report</h1>')
    })

    test('should include footer with Powered by', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('Powered by CodeForge')
    })

    test('should include container div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="container"')
    })
  })

  // ====================================================================
  // SUMMARY SECTION (12 tests)
  // ====================================================================
  describe('summary section', () => {
    test('should display error count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 5,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="summary-count">5</span>')
      expect(html).toContain('<span class="summary-label">Errors</span>')
    })

    test('should display warning count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 3,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="summary-count">3</span>')
      expect(html).toContain('<span class="summary-label">Warnings</span>')
    })

    test('should display info count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 7,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="summary-count">7</span>')
      expect(html).toContain('<span class="summary-label">Info</span>')
    })

    test('should display file count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 10,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="summary-count">10</span>')
      expect(html).toContain('<span class="summary-label">Files</span>')
    })

    test('should add has-errors class when errors exist', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-card has-errors')
    })

    test('should add has-warnings class when warnings exist', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-card has-warnings')
    })

    test('should display zero counts when no violations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="summary-count">0</span>')
    })

    test('should display summary icons for each severity', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-icon error')
      expect(html).toContain('summary-icon warning')
      expect(html).toContain('summary-icon info')
    })

    test('should display file icon for files card', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-icon files')
    })

    test('should include onclick handlers for summary cards', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('onclick="filterBy(\'error\')"')
      expect(html).toContain('onclick="filterBy(\'warning\')"')
      expect(html).toContain('onclick="filterBy(\'info\')"')
      expect(html).toContain('onclick="filterBy(\'all\')"')
    })

    test('should not add has-errors class when error count is zero', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), warningCount: 1 },
      })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('summary-card has-errors')
    })

    test('should not add has-warnings class when warning count is zero', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), errorCount: 1 },
      })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('summary-card has-warnings')
    })
  })

  // ====================================================================
  // FILE SECTIONS (12 tests)
  // ====================================================================
  describe('file sections', () => {
    test('should render file section for files with violations', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/app.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/app.ts')
      expect(html).toContain('file-section')
    })

    test('should not render file section for files without violations', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles([createMockFileResult('clean.ts', [])], {
        totalFiles: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('No problems found!')
    })

    test('should display badges for error count in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 2 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="badge error">2</span>')
    })

    test('should display badges for warning count in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        { totalFiles: 1, filesWithViolations: 1, warningCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="badge warning">1</span>')
    })

    test('should display badges for info count in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        { totalFiles: 1, filesWithViolations: 1, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="badge info">1</span>')
    })

    test('should not display error badge when no errors in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        { totalFiles: 1, filesWithViolations: 1, warningCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).not.toContain('badge error')
    })

    test('should not display warning badge when no warnings in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).not.toContain('badge warning')
    })

    test('should not display info badge when no infos in file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).not.toContain('badge info')
    })

    test('should render file path in file-path class', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/deep/nested/file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="file-path">src/deep/nested/file.ts</span>')
    })

    test('should render file section as details element', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<details class="file-section"')
      expect(html).toContain('open')
    })

    test('should include toggle icon in file header', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('toggle-icon')
    })

    test('should render violations inside violations div', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('class="violations"')
    })
  })

  // ====================================================================
  // VIOLATION RENDERING (16 tests)
  // ====================================================================
  describe('violation rendering', () => {
    test('should render violation details', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({
        ruleId: 'no-unused-vars',
        message: 'Variable x is declared but never used',
        line: 42,
        column: 10,
      })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('no-unused-vars')
      expect(html).toContain('Variable x is declared but never used')
      expect(html).toContain('Line 42, Col 10')
    })

    test('should render source code when provided', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ source: 'const x = 1;' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<pre class="source-code">')
      expect(html).toContain('const x = 1;')
    })

    test('should not render source code section when not provided', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation()
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('<pre class="source-code">')
    })

    test('should render suggestion when provided', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ suggestion: 'Remove the unused variable' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('suggestion')
      expect(html).toContain('Remove the unused variable')
    })

    test('should not render suggestion section when not provided', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation()
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('class="suggestion"')
    })

    test('should show end line when different from start line', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 10, endLine: 15 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('- Line 15')
    })

    test('should not show end line when same as start line', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 10, endLine: 10 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('- Line 10')
    })

    test('should include data attributes for filtering', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: 'test-rule' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="error"')
      expect(html).toContain('data-rule="test-rule"')
      expect(html).toContain('data-file="test.ts"')
    })

    test('should render severity icon for error', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'error' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('severity-icon error')
      expect(html).toContain('✖')
    })

    test('should render severity icon for warning', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'warning' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        warningCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('severity-icon warning')
      expect(html).toContain('⚠')
    })

    test('should render severity icon for info', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ severity: 'info' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        infoCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('severity-icon info')
      expect(html).toContain('ℹ')
    })

    test('should render rule-id in rule-id class', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: 'my-custom-rule' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="rule-id">my-custom-rule</span>')
    })

    test('should render message in violation-message div', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Something is wrong' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<div class="violation-message">Something is wrong</div>')
    })

    test('should render source code inside code element', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ source: 'let x = 2;' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<code>let x = 2;</code>')
    })

    test('should include lightbulb emoji in suggestion', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ suggestion: 'Fix this' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('💡')
    })

    test('should render violation with all optional fields', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({
        source: 'const a = 1;',
        suggestion: 'Use let instead',
        endLine: 20,
      })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<pre class="source-code">')
      expect(html).toContain('class="suggestion"')
      expect(html).toContain('- Line 20')
    })
  })

  // ====================================================================
  // TIME FORMATTING (6 tests)
  // ====================================================================
  describe('time formatting', () => {
    test('should display time in milliseconds for short durations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 500 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('500ms')
    })

    test('should display time in seconds for longer durations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 2500 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('2.50s')
    })

    test('should display zero time as 0ms', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('0ms')
    })

    test('should display time at threshold boundary', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 999 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('999ms')
    })

    test('should display time just over threshold in seconds', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 1000 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('1.00s')
    })

    test('should display large time in seconds', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 60000 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('60.00s')
    })
  })

  // ====================================================================
  // CONTROLS SECTION (6 tests)
  // ====================================================================
  describe('controls section', () => {
    test('should include filter buttons', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('filter-btn')
      expect(html).toContain('data-filter="all"')
      expect(html).toContain('data-filter="error"')
      expect(html).toContain('data-filter="warning"')
      expect(html).toContain('data-filter="info"')
    })

    test('should include sort select', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('id="sort-select"')
      expect(html).toContain('value="severity"')
      expect(html).toContain('value="file"')
      expect(html).toContain('value="rule"')
    })

    test('should include expand/collapse buttons', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('id="expand-all"')
      expect(html).toContain('id="collapse-all"')
    })

    test('should have All button as active by default', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('filter-btn active')
    })

    test('should include sort label', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('Sort by:')
    })

    test('should include controls wrapper', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="controls"')
    })
  })

  // ====================================================================
  // EDGE CASES - XSS PREVENTION (10 tests)
  // ====================================================================
  describe('XSS prevention', () => {
    test('should escape script tags in violation messages', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '<script>alert("xss")</script>' })
      const output = reporter.format(violation)
      expect(output).toContain('&lt;script&gt;')
      expect(output).not.toContain('<script>')
    })

    test('should escape special characters in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/<test>.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('&lt;test&gt;')
    })

    test('should escape single quotes in messages', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: "It's a problem" })
      const output = reporter.format(violation)
      expect(output).toContain('&#039;')
    })

    test('should escape double quotes in messages', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Say "hello"' })
      const output = reporter.format(violation)
      expect(output).toContain('&quot;')
    })

    test('should escape HTML in suggestion', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ suggestion: '<b>Fix this</b>' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('&lt;b&gt;Fix this&lt;/b&gt;')
      expect(html).not.toContain('<b>Fix this</b>')
    })

    test('should escape HTML in source code', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ source: '<div onclick="evil()">' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('&lt;div onclick=&quot;evil()&quot;&gt;')
      expect(html).not.toContain('<div onclick')
    })

    test('should escape HTML in file path in violation rendering', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ filePath: 'src/<app>.ts' })
      const results = createResultsWithFiles([createMockFileResult('src/<app>.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-file="src/&lt;app&gt;.ts"')
    })

    test('should escape HTML in ruleId', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: 'rule<"evil">' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="rule&lt;&quot;evil&quot;&gt;"')
    })

    test('should escape mixed special characters', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({
        message: 'Use &amp; <tags> "properly" and \'safely\'',
      })
      const output = reporter.format(violation)
      expect(output).toContain('&amp;amp;')
      expect(output).toContain('&lt;tags&gt;')
      expect(output).toContain('&quot;properly&quot;')
      expect(output).toContain('&#039;safely&#039;')
    })

    test('should escape ampersand in ruleId', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: 'rule&constraint' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="rule&amp;constraint"')
    })
  })

  // ====================================================================
  // EDGE CASES - MULTIPLE FILES (8 tests)
  // ====================================================================
  describe('multiple files', () => {
    test('should handle multiple files with violations', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('a.ts', [createMockViolation()]),
          createMockFileResult('b.ts', [createMockViolation()]),
          createMockFileResult('c.ts', [createMockViolation()]),
        ],
        { totalFiles: 3, filesWithViolations: 3, errorCount: 3 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('a.ts')
      expect(html).toContain('b.ts')
      expect(html).toContain('c.ts')
    })

    test('should handle empty results', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('No problems found!')
      expect(html).toContain('All files passed analysis.')
    })

    test('should handle file with multiple violations of different severities', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('mixed.ts', [
            createMockViolation({ severity: 'error', ruleId: 'err1' }),
            createMockViolation({ severity: 'warning', ruleId: 'warn1' }),
            createMockViolation({ severity: 'info', ruleId: 'info1' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 1, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="error"')
      expect(html).toContain('data-severity="warning"')
      expect(html).toContain('data-severity="info"')
    })

    test('should use utf-8 encoding for file write', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'utf8',
      )
    })

    test('should handle mix of files with and without violations', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('clean.ts', []),
          createMockFileResult('dirty.ts', [createMockViolation()]),
          createMockFileResult('also-clean.ts', []),
        ],
        { totalFiles: 3, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('dirty.ts')
      expect(html).not.toContain('clean.ts')
      expect(html).not.toContain('also-clean.ts')
    })

    test('should render all violations from a file', () => {
      const reporter = new HTMLReporter()
      const violations = [
        createMockViolation({ ruleId: 'r1', line: 1 }),
        createMockViolation({ ruleId: 'r2', line: 2 }),
        createMockViolation({ ruleId: 'r3', line: 3 }),
      ]
      const results = createResultsWithFiles([createMockFileResult('test.ts', violations)], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 3,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="r1"')
      expect(html).toContain('data-rule="r2"')
      expect(html).toContain('data-rule="r3"')
    })

    test('should handle single file with single violation', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('single.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('single.ts')
      expect(html).toContain('violation')
    })

    test('should handle files with same name in different directories', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('src/utils/index.ts', [createMockViolation({ ruleId: 'r1' })]),
          createMockFileResult('src/components/index.ts', [createMockViolation({ ruleId: 'r2' })]),
        ],
        { totalFiles: 2, filesWithViolations: 2, errorCount: 2 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/utils/index.ts')
      expect(html).toContain('src/components/index.ts')
      expect(html).toContain('data-rule="r1"')
      expect(html).toContain('data-rule="r2"')
    })
  })

  // ====================================================================
  // VIOLATION WITH DIFFERENT SEVERITIES (12 tests)
  // ====================================================================
  describe('severity variations', () => {
    test('should render error violation with error class', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="error"')
    })

    test('should render warning violation with warning class', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        { totalFiles: 1, filesWithViolations: 1, warningCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="warning"')
    })

    test('should render info violation with info class', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        { totalFiles: 1, filesWithViolations: 1, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="info"')
    })

    test('should render multiple errors in same file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e1' }),
            createMockViolation({ severity: 'error', ruleId: 'e2' }),
            createMockViolation({ severity: 'error', ruleId: 'e3' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 3 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="e1"')
      expect(html).toContain('data-rule="e2"')
      expect(html).toContain('data-rule="e3"')
      expect(html).toContain('<span class="badge error">3</span>')
    })

    test('should render mixed severities with correct badges', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 2, warningCount: 3, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="badge error">2</span>')
      expect(html).toContain('<span class="badge warning">3</span>')
      expect(html).toContain('<span class="badge info">1</span>')
    })

    test('should display correct error count in summary for errors only', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      const html = getHtml(reporter, results)
      const matches = html.match(/summary-count.*?2.*?summary-label.*?Errors/s)
      expect(matches).toBeTruthy()
    })

    test('should handle large error count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: {
          ...createEmptySummary(),
          errorCount: 999,
          totalFiles: 100,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('>999<')
    })

    test('should handle large warning count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: {
          ...createEmptySummary(),
          warningCount: 500,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('>500<')
    })

    test('should handle large info count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: {
          ...createEmptySummary(),
          infoCount: 250,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('>250<')
    })

    test('should handle large total file count', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: {
          ...createEmptySummary(),
          totalFiles: 1000,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('>1000<')
    })

    test('should correctly count severities across multiple files', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ severity: 'error' })]),
          createMockFileResult('b.ts', [createMockViolation({ severity: 'warning' })]),
          createMockFileResult('c.ts', [createMockViolation({ severity: 'info' })]),
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 3,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 100,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="error"')
      expect(html).toContain('data-severity="warning"')
      expect(html).toContain('data-severity="info"')
    })
  })

  // ====================================================================
  // FILE PATHS AND RANGES (10 tests)
  // ====================================================================
  describe('file paths and ranges', () => {
    test('should render line and column in location', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 25, column: 8 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 25, Col 8')
    })

    test('should render line 1, column 1', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 1, column: 1 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 1, Col 1')
    })

    test('should handle large line numbers', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 9999, column: 1 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 9999, Col 1')
    })

    test('should handle large column numbers', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 1, column: 120 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 1, Col 120')
    })

    test('should render multi-line range with endLine', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 5, endLine: 10, column: 1 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 5, Col 1 - Line 10')
    })

    test('should not render endLine when undefined', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 5, column: 1 })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 5, Col 1')
      expect(html).not.toContain('- Line')
    })

    test('should handle deeply nested file paths', () => {
      const reporter = new HTMLReporter()
      const deepPath = 'src/modules/auth/controllers/user-controller.ts'
      const results = createResultsWithFiles(
        [createMockFileResult(deepPath, [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain(deepPath)
    })

    test('should handle file path with special characters', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/[test]/file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/[test]/file.ts')
    })

    test('should handle file path with spaces', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/my file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/my file.ts')
    })

    test('should handle file path with unicode', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/日本語.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/日本語.ts')
    })
  })

  // ====================================================================
  // CSS STYLES (12 tests)
  // ====================================================================
  describe('CSS styles', () => {
    test('should include error color CSS variable', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('--error-color: #ff6b6b')
    })

    test('should include warning color CSS variable', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('--warning-color: #ffd93d')
    })

    test('should include info color CSS variable', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('--info-color: #6bcfff')
    })

    test('should include success color CSS variable', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('--success-color')
    })

    test('should include body font-family', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('font-family:')
    })

    test('should include hidden class', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.hidden { display: none !important; }')
    })

    test('should include container max-width', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('max-width: 1200px')
    })

    test('should include summary card styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.summary-card {')
    })

    test('should include violation styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.violation {')
    })

    test('should include file-section styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.file-section {')
    })

    test('should include no-results styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.no-results {')
    })

    test('should include badge styles', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('.badge {')
    })
  })

  // ====================================================================
  // JAVASCRIPT CONTENT (8 tests)
  // ====================================================================
  describe('JavaScript content', () => {
    test('should include filterViolations function', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('filterViolations')
    })

    test('should include updateFilterButtons function', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('updateFilterButtons')
    })

    test('should include updateFileVisibility function', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('updateFileVisibility')
    })

    test('should include filterBy function exposed to window', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('window.filterBy')
    })

    test('should include sort select event listener', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('sort-select')
      expect(html).toContain('addEventListener')
    })

    test('should include expand all handler', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('expand-all')
    })

    test('should include collapse all handler', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('collapse-all')
    })

    test('should wrap script in IIFE', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('(function()')
    })
  })

  // ====================================================================
  // NO RESULTS STATE (6 tests)
  // ====================================================================
  describe('no results state', () => {
    test('should show success icon when no violations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('success-icon')
      expect(html).toContain('✓')
    })

    test('should show success heading when no violations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<h2>No problems found!</h2>')
    })

    test('should show success message when no violations', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('<p>All files passed analysis.</p>')
    })

    test('should not show no-results div when violations exist', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).not.toContain('No problems found!')
    })

    test('should show no-results div when files exist but have no violations', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('clean.ts', []), createMockFileResult('also-clean.ts', [])],
        { totalFiles: 2 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('No problems found!')
    })

    test('should show no-results div when files array is empty', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ files: [], summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('No problems found!')
    })
  })

  // ====================================================================
  // VIOLATION CONTENT (12 tests)
  // ====================================================================
  describe('violation content variations', () => {
    test('should handle violation with long message', () => {
      const reporter = new HTMLReporter()
      const longMsg = 'A'.repeat(500)
      const violation = createMockViolation({ message: longMsg })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain(longMsg)
    })

    test('should handle violation with long ruleId', () => {
      const reporter = new HTMLReporter()
      const longRuleId = 'very-long-rule-name-that-describes-something-specific'
      const violation = createMockViolation({ ruleId: longRuleId })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain(longRuleId)
    })

    test('should handle violation with long suggestion', () => {
      const reporter = new HTMLReporter()
      const longSuggestion =
        'Consider refactoring this code to use a more efficient algorithm '.repeat(5)
      const violation = createMockViolation({ suggestion: longSuggestion })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain(longSuggestion)
    })

    test('should handle violation with long source code', () => {
      const reporter = new HTMLReporter()
      const longSource = 'const x = '.repeat(50) + '1;'
      const violation = createMockViolation({ source: longSource })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain(longSource)
    })

    test('should handle violation with empty message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('<div class="violation-message"></div>')
    })

    test('should handle violation with multiline message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Line 1\nLine 2\nLine 3' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Line 1\nLine 2\nLine 3')
    })

    test('should handle violation with unicode message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '変数は使用されていません 🎉' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('変数は使用されていません 🎉')
    })

    test('should handle violation with special regex characters in message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Use $1 instead of $& in replacement' })
      const output = reporter.format(violation)
      expect(output).toContain('$1')
      expect(output).toContain('$&')
    })

    test('should handle violation with newlines in source code', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ source: 'line1\nline2\nline3' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('line1\nline2\nline3')
    })

    test('should handle violation with suggestion containing HTML entities', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ suggestion: 'Use &lt;template&gt; tag' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('&amp;lt;template&amp;gt;')
    })

    test('should handle multiple violations from same rule', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'no-console', line: 5 }),
            createMockViolation({ ruleId: 'no-console', line: 10 }),
            createMockViolation({ ruleId: 'no-console', line: 15 }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 3 },
      )
      const html = getHtml(reporter, results)
      const consoleCount = html.split('data-rule="no-console"').length - 1
      expect(consoleCount).toBe(3)
    })

    test('should handle violation with tabs in source code', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ source: '\tconst x = 1;\t' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('const x = 1;')
    })
  })

  // ====================================================================
  // TIMESTAMP AND VERSION (8 tests)
  // ====================================================================
  describe('timestamp and version', () => {
    test('should include provided timestamp', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-06-15T14:30:00.000Z',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('2024-06-15T14:30:00.000Z')
    })

    test('should include version when present', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        version: '3.5.2',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Version: 3.5.2')
    })

    test('should not include version span when absent', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).not.toContain('Version:')
    })

    test('should render timestamp in meta div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-01-01T00:00:00.000Z',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="meta"')
      expect(html).toContain('Generated: 2024-01-01T00:00:00.000Z')
    })

    test('should render both timestamp and version when both present', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-07-20T08:00:00.000Z',
        version: '1.2.3',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Generated: 2024-07-20T08:00:00.000Z')
      expect(html).toContain('Version: 1.2.3')
    })

    test('should handle ISO timestamp format', () => {
      const reporter = new HTMLReporter()
      const isoTimestamp = '2024-12-31T23:59:59.999Z'
      const results = createMockAnalysisResult({
        timestamp: isoTimestamp,
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain(isoTimestamp)
    })

    test('should handle version with prerelease tag', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        version: '2.0.0-beta.1',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Version: 2.0.0-beta.1')
    })

    test('should handle version with build metadata', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        version: '1.0.0+build.123',
        summary: createEmptySummary(),
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Version: 1.0.0+build.123')
    })
  })

  // ====================================================================
  // REPORTER INTERFACE (6 tests)
  // ====================================================================
  describe('Reporter interface compliance', () => {
    test('should have name property', () => {
      const reporter = new HTMLReporter()
      expect(reporter.name).toBe('html')
    })

    test('should have format method', () => {
      const reporter = new HTMLReporter()
      expect(typeof reporter.format).toBe('function')
    })

    test('should have report method', () => {
      const reporter = new HTMLReporter()
      expect(typeof reporter.report).toBe('function')
    })

    test('should return string from format', () => {
      const reporter = new HTMLReporter()
      const result = reporter.format(createMockViolation())
      expect(typeof result).toBe('string')
    })

    test('should not return from report method', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      fsExistsSyncMock.mockReturnValue(true)
      const result = reporter.report(results)
      expect(result).toBeUndefined()
    })

    test('should be reusable for multiple reports', () => {
      const reporter = new HTMLReporter()
      const results1 = createMockAnalysisResult({ summary: createEmptySummary() })
      const results2 = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results1)
      reporter.report(results2)
      expect(fsWriteFileSyncMock).toHaveBeenCalledTimes(2)
    })
  })

  // ====================================================================
  // SPECIAL CHARACTERS IN VARIOUS FIELDS (8 tests)
  // ====================================================================
  describe('special characters handling', () => {
    test('should handle ampersand in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/foo&bar.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/foo&amp;bar.ts')
    })

    test('should handle quotes in violation message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'Replace "foo" with \'bar\'' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('&quot;foo&quot;')
      expect(html).toContain('&#039;bar&#039;')
    })

    test('should handle angle brackets in ruleId', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: 'type<Generic>' })
      const results = createResultsWithFiles([createMockFileResult('test.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('type&lt;Generic&gt;')
    })

    test('should handle backslash in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src\\nested\\file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src\\nested\\file.ts')
    })

    test('should handle colon in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('C:/project/file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('C:/project/file.ts')
    })

    test('should handle parentheses in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/test (1).ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/test (1).ts')
    })

    test('should handle hash in file path', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/#internal/file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('src/#internal/file.ts')
    })

    test('should handle percent in message', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '100% coverage required' })
      const output = reporter.format(violation)
      expect(output).toContain('100% coverage required')
    })
  })

  // ====================================================================
  // FOOTER (6 tests)
  // ====================================================================
  describe('footer', () => {
    test('should include footer element', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="footer"')
    })

    test('should include total time in footer', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 250 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Total time: 250ms')
    })

    test('should include powered by text', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('Powered by CodeForge')
    })

    test('should show seconds in footer for long times', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: { ...createEmptySummary(), totalTime: 3500 },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('Total time: 3.50s')
    })

    test('should show zero time in footer', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('Total time: 0ms')
    })

    test('should place footer after results div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      const resultsPos = html.indexOf('class="results"')
      const footerPos = html.indexOf('class="footer"')
      expect(footerPos).toBeGreaterThan(resultsPos)
    })
  })

  // ====================================================================
  // DATA ATTRIBUTES (6 tests)
  // ====================================================================
  describe('data attributes', () => {
    test('should set data-file on file section', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/my-file.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-file="src/my-file.ts"')
    })

    test('should set data-severity on each violation', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-severity="error"')
      expect(html).toContain('data-severity="warning"')
    })

    test('should set data-rule on each violation', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'custom-rule' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="custom-rule"')
    })

    test('should set data-file on each violation', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('specific.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-file="specific.ts"')
    })

    test('should set data-filter on filter buttons', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-filter="all"')
      expect(html).toContain('data-filter="error"')
      expect(html).toContain('data-filter="warning"')
      expect(html).toContain('data-filter="info"')
    })

    test('should escape data attribute values', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ filePath: 'a&b.ts', ruleId: 'r<s>' })
      const results = createResultsWithFiles([createMockFileResult('a&b.ts', [violation])], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-file="a&amp;b.ts"')
      expect(html).toContain('data-rule="r&lt;s&gt;"')
    })
  })

  // ====================================================================
  // SCALABILITY (6 tests)
  // ====================================================================
  describe('scalability', () => {
    test('should handle many files with violations', () => {
      const reporter = new HTMLReporter()
      const files = Array.from({ length: 50 }, (_, i) =>
        createMockFileResult(`file${i}.ts`, [createMockViolation({ line: i + 1 })]),
      )
      const results = createResultsWithFiles(files, {
        totalFiles: 50,
        filesWithViolations: 50,
        errorCount: 50,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('file0.ts')
      expect(html).toContain('file49.ts')
    })

    test('should handle many violations in single file', () => {
      const reporter = new HTMLReporter()
      const violations = Array.from({ length: 30 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}`, line: i + 1 }),
      )
      const results = createResultsWithFiles([createMockFileResult('big.ts', violations)], {
        totalFiles: 1,
        filesWithViolations: 1,
        errorCount: 30,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('data-rule="rule-0"')
      expect(html).toContain('data-rule="rule-29"')
    })

    test('should handle many files without violations', () => {
      const reporter = new HTMLReporter()
      const files = Array.from({ length: 100 }, (_, i) => createMockFileResult(`clean${i}.ts`, []))
      const results = createResultsWithFiles(files, { totalFiles: 100 })
      const html = getHtml(reporter, results)
      expect(html).toContain('No problems found!')
    })

    test('should handle mix of clean and dirty files', () => {
      const reporter = new HTMLReporter()
      const files = [
        ...Array.from({ length: 20 }, (_, i) => createMockFileResult(`clean${i}.ts`, [])),
        ...Array.from({ length: 5 }, (_, i) =>
          createMockFileResult(`dirty${i}.ts`, [createMockViolation()]),
        ),
      ]
      const results = createResultsWithFiles(files, {
        totalFiles: 25,
        filesWithViolations: 5,
        errorCount: 5,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('dirty0.ts')
      expect(html).toContain('dirty4.ts')
      expect(html).not.toContain('clean0.ts')
    })

    test('should handle violation counts above 100', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({
        summary: {
          ...createEmptySummary(),
          totalFiles: 200,
          filesWithViolations: 150,
          errorCount: 100,
          warningCount: 80,
          infoCount: 50,
        },
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('>100<')
      expect(html).toContain('>80<')
      expect(html).toContain('>50<')
      expect(html).toContain('>200<')
    })

    test('should handle single violation among many clean files', () => {
      const reporter = new HTMLReporter()
      const files = [
        ...Array.from({ length: 49 }, (_, i) => createMockFileResult(`clean${i}.ts`, [])),
        createMockFileResult('problematic.ts', [createMockViolation({ ruleId: 'single-error' })]),
      ]
      const results = createResultsWithFiles(files, {
        totalFiles: 50,
        filesWithViolations: 1,
        errorCount: 1,
      })
      const html = getHtml(reporter, results)
      expect(html).toContain('problematic.ts')
      expect(html).toContain('data-rule="single-error"')
    })
  })

  // ====================================================================
  // SEVERITY ICONS (6 tests)
  // ====================================================================
  describe('severity icons', () => {
    test('should use ✖ icon for error', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-icon error')
      // The ✖ appears in both summary and violation
      const count = html.split('✖').length - 1
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should use ⚠ icon for warning', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        { totalFiles: 1, filesWithViolations: 1, warningCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-icon warning')
      const count = html.split('⚠').length - 1
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should use ℹ icon for info', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        { totalFiles: 1, filesWithViolations: 1, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('summary-icon info')
      const count = html.split('ℹ').length - 1
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should use 📄 icon for files card', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('📄')
    })

    test('should render severity icon in violation header', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('severity-icon error')
    })

    test('should render correct icon per severity in violation', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 1, infoCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('class="severity-icon error"')
      expect(html).toContain('class="severity-icon warning"')
      expect(html).toContain('class="severity-icon info"')
    })
  })

  // ====================================================================
  // HTML STRUCTURE ELEMENTS (8 tests)
  // ====================================================================
  describe('HTML structure elements', () => {
    test('should have results container div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="results"')
    })

    test('should have controls div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="controls"')
    })

    test('should have filters div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="filters"')
    })

    test('should have sort div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="sort"')
    })

    test('should have actions div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="actions"')
    })

    test('should have summary div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="summary"')
    })

    test('should have header div', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="header"')
    })

    test('should have meta div with display flex', () => {
      const reporter = new HTMLReporter()
      const results = createMockAnalysisResult({ summary: createEmptySummary() })
      const html = getHtml(reporter, results)
      expect(html).toContain('class="meta"')
    })
  })

  // ====================================================================
  // FILE SECTION DETAILS (4 tests)
  // ====================================================================
  describe('file section details', () => {
    test('should escape file path in data-file attribute of details', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('src/<weird>.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('data-file="src/&lt;weird&gt;.ts"')
    })

    test('should use summary element for file header', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation()])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<summary class="file-header">')
    })

    test('should include file-badges div', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 1 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('class="file-badges"')
    })

    test('should show combined badges for mixed severity file', () => {
      const reporter = new HTMLReporter()
      const results = createResultsWithFiles(
        [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        { totalFiles: 1, filesWithViolations: 1, errorCount: 2, warningCount: 1, infoCount: 2 },
      )
      const html = getHtml(reporter, results)
      expect(html).toContain('<span class="badge error">2</span>')
      expect(html).toContain('<span class="badge warning">1</span>')
      expect(html).toContain('<span class="badge info">2</span>')
    })
  })

  // ====================================================================
  // FORMAT METHOD EDGE CASES (6 tests)
  // ====================================================================
  describe('format method edge cases', () => {
    test('should format violation at line 0', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ line: 0, column: 0 })
      const output = reporter.format(violation)
      expect(output).toContain(':0:0')
    })

    test('should format violation with empty ruleId', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ ruleId: '' })
      const output = reporter.format(violation)
      expect(output).toContain('ERROR')
    })

    test('should format violation with empty file path', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ filePath: '' })
      const output = reporter.format(violation)
      expect(output).toContain(':10:5')
    })

    test('should format violation with all fields combined', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({
        filePath: 'src/index.ts',
        line: 100,
        column: 25,
        severity: 'warning',
        message: 'Consider using const',
      })
      const output = reporter.format(violation)
      expect(output).toContain('src/index.ts:100:25')
      expect(output).toContain('WARNING')
      expect(output).toContain('Consider using const')
    })

    test('should return escaped string from format', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: 'a < b > c & d "e" \'f\'' })
      const output = reporter.format(violation)
      expect(output).toContain('&lt;')
      expect(output).toContain('&gt;')
      expect(output).toContain('&amp;')
      expect(output).toContain('&quot;')
      expect(output).toContain('&#039;')
    })

    test('should not double-escape already escaped content', () => {
      const reporter = new HTMLReporter()
      const violation = createMockViolation({ message: '&lt;already escaped&gt;' })
      const output = reporter.format(violation)
      expect(output).toContain('&amp;lt;already escaped&amp;gt;')
    })
  })
})
