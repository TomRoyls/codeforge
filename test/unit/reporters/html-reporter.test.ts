import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { HTMLReporter } from '../../../src/reporters/html-reporter.js';
import type { AnalysisResult, Violation, FileAnalysisResult } from '../../../src/reporters/types.js';

vi.mock('fs');
vi.mock('path');

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation message',
    filePath: 'test.ts',
    line: 10,
    column: 5,
    ...overrides,
  };
}

function createMockFileResult(
  filePath: string,
  violations: Violation[] = [],
  stats: FileAnalysisResult['stats'] = { parseTime: 10, analysisTime: 20, totalTime: 30 }
): FileAnalysisResult {
  return {
    filePath,
    violations,
    stats,
  };
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
  };
}

describe('HTMLReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let fsExistsSyncMock: ReturnType<typeof vi.fn>;
  let fsMkdirSyncMock: ReturnType<typeof vi.fn>;
  let fsWriteFileSyncMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    fsExistsSyncMock = vi.mocked(fs.existsSync);
    fsMkdirSyncMock = vi.mocked(fs.mkdirSync);
    fsWriteFileSyncMock = vi.mocked(fs.writeFileSync);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new HTMLReporter();
      expect(reporter.name).toBe('html');
    });

    test('should use default output path', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        'codeforge-report.html',
        expect.any(String),
        'utf8'
      );
    });

    test('should accept custom output path', () => {
      const reporter = new HTMLReporter({ outputPath: './custom-report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        './custom-report.html',
        expect.any(String),
        'utf8'
      );
    });

    test('should handle empty options object', () => {
      const reporter = new HTMLReporter({});
      expect(reporter.name).toBe('html');
    });
  });

  describe('format', () => {
    test('should format violation as escaped HTML', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation();
      const output = reporter.format(violation);
      expect(output).toContain('test.ts:10:5');
      expect(output).toContain('ERROR');
      expect(output).toContain('Test violation message');
    });

    test('should escape HTML special characters in message', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ message: '<script>alert("xss")</script>' });
      const output = reporter.format(violation);
      expect(output).toContain('&lt;script&gt;');
      expect(output).toContain('&quot;xss&quot;');
      expect(output).not.toContain('<script>');
    });

    test('should escape ampersands', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ message: 'Use && instead of &amp;' });
      const output = reporter.format(violation);
      expect(output).toContain('&amp;&amp;');
    });

    test('should escape less than and greater than', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ message: 'Value must be < 10 and > 0' });
      const output = reporter.format(violation);
      expect(output).toContain('&lt;');
      expect(output).toContain('&gt;');
    });

    test('should format warning severity', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ severity: 'warning' });
      const output = reporter.format(violation);
      expect(output).toContain('WARNING');
    });

    test('should format info severity', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ severity: 'info' });
      const output = reporter.format(violation);
      expect(output).toContain('INFO');
    });
  });

  describe('report', () => {
    test('should write HTML file', () => {
      const reporter = new HTMLReporter({ outputPath: './report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalled();
    });

    test('should print console message after generation', () => {
      const reporter = new HTMLReporter({ outputPath: './report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalledWith('HTML report generated: ./report.html');
    });

    test('should create directory if it does not exist', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/nested/report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(false);
      vi.mocked(path.dirname).mockReturnValue('./reports/nested');
      reporter.report(results);
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/nested', { recursive: true });
    });

    test('should not create directory if it exists', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      vi.mocked(path.dirname).mockReturnValue('./reports');
      reporter.report(results);
      expect(fsMkdirSyncMock).not.toHaveBeenCalled();
    });
  });

  describe('HTML structure', () => {
    test('should generate valid HTML document', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    test('should include title', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<title>CodeForge Analysis Report</title>');
    });

    test('should include timestamp in header', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        timestamp: '2024-03-15T12:30:00.000Z',
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('2024-03-15T12:30:00.000Z');
    });

    test('should include version when provided', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        version: '2.0.0',
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('Version: 2.0.0');
    });

    test('should not include version section when not provided', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).not.toContain('Version:');
    });

    test('should include CSS styles', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<style>');
      expect(html).toContain(':root');
      expect(html).toContain('--error-color');
    });

    test('should include JavaScript', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<script>');
      expect(html).toContain('filterBy');
    });
  });

  describe('summary section', () => {
    test('should display error count', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 5, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="summary-count">5</span>');
      expect(html).toContain('<span class="summary-label">Errors</span>');
    });

    test('should display warning count', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 3, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="summary-count">3</span>');
      expect(html).toContain('<span class="summary-label">Warnings</span>');
    });

    test('should display info count', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 0, infoCount: 7, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="summary-count">7</span>');
      expect(html).toContain('<span class="summary-label">Info</span>');
    });

    test('should display file count', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: { totalFiles: 10, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="summary-count">10</span>');
      expect(html).toContain('<span class="summary-label">Files</span>');
    });

    test('should add has-errors class when errors exist', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('summary-card has-errors');
    });

    test('should add has-warnings class when warnings exist', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 1, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('summary-card has-warnings');
    });
  });

  describe('file sections', () => {
    test('should render file section for files with violations', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/app.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('src/app.ts');
      expect(html).toContain('file-section');
    });

    test('should not render file section for files without violations', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('No problems found!');
    });

    test('should display badges for error count in file', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [
          createMockViolation({ severity: 'error' }),
          createMockViolation({ severity: 'error' }),
        ])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 2, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="badge error">2</span>');
    });

    test('should display badges for warning count in file', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 1, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="badge warning">1</span>');
    });

    test('should display badges for info count in file', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 0, infoCount: 1, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<span class="badge info">1</span>');
    });
  });

  describe('violation rendering', () => {
    test('should render violation details', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({
        ruleId: 'no-unused-vars',
        message: 'Variable x is declared but never used',
        line: 42,
        column: 10,
      });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('no-unused-vars');
      expect(html).toContain('Variable x is declared but never used');
      expect(html).toContain('Line 42, Col 10');
    });

    test('should render source code when provided', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ source: 'const x = 1;' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('<pre class="source-code">');
      expect(html).toContain('const x = 1;');
    });

    test('should not render source code section when not provided', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).not.toContain('<pre class="source-code">');
    });

    test('should render suggestion when provided', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ suggestion: 'Remove the unused variable' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('suggestion');
      expect(html).toContain('Remove the unused variable');
    });

    test('should not render suggestion section when not provided', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).not.toContain('class="suggestion"');
    });

    test('should show end line when different from start line', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ line: 10, endLine: 15 });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('- Line 15');
    });

    test('should not show end line when same as start line', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ line: 10, endLine: 10 });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).not.toContain('- Line 10');
    });

    test('should include data attributes for filtering', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ ruleId: 'test-rule' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('data-severity="error"');
      expect(html).toContain('data-rule="test-rule"');
      expect(html).toContain('data-file="test.ts"');
    });
  });

  describe('time formatting', () => {
    test('should display time in milliseconds for short durations', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 500 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('500ms');
    });

    test('should display time in seconds for longer durations', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 2500 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('2.50s');
    });
  });

  describe('controls section', () => {
    test('should include filter buttons', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('filter-btn');
      expect(html).toContain('data-filter="all"');
      expect(html).toContain('data-filter="error"');
      expect(html).toContain('data-filter="warning"');
      expect(html).toContain('data-filter="info"');
    });

    test('should include sort select', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('id="sort-select"');
      expect(html).toContain('value="severity"');
      expect(html).toContain('value="file"');
      expect(html).toContain('value="rule"');
    });

    test('should include expand/collapse buttons', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('id="expand-all"');
      expect(html).toContain('id="collapse-all"');
    });
  });

  describe('edge cases', () => {
    test('should escape special characters in file path', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/<test>.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('&lt;test&gt;');
    });

    test('should handle multiple files with violations', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation()]),
          createMockFileResult('b.ts', [createMockViolation()]),
          createMockFileResult('c.ts', [createMockViolation()]),
        ],
        summary: { totalFiles: 3, filesWithViolations: 3, errorCount: 3, warningCount: 0, infoCount: 0, totalTime: 150 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('a.ts');
      expect(html).toContain('b.ts');
      expect(html).toContain('c.ts');
    });

    test('should handle empty results', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('No problems found!');
      expect(html).toContain('All files passed analysis.');
    });

    test('should handle file with multiple violations of different severities', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('mixed.ts', [
          createMockViolation({ severity: 'error', ruleId: 'err1' }),
          createMockViolation({ severity: 'warning', ruleId: 'warn1' }),
          createMockViolation({ severity: 'info', ruleId: 'info1' }),
        ])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 1, infoCount: 1, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const html = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(html).toContain('data-severity="error"');
      expect(html).toContain('data-severity="warning"');
      expect(html).toContain('data-severity="info"');
    });

    test('should use utf-8 encoding for file write', () => {
      const reporter = new HTMLReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'utf8'
      );
    });

    test('should handle deeply nested output path', () => {
      const reporter = new HTMLReporter({ outputPath: './reports/2024/01/15/deep/report.html' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(false);
      vi.mocked(path.dirname).mockReturnValue('./reports/2024/01/15/deep');
      reporter.report(results);
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/2024/01/15/deep', { recursive: true });
    });

    test('should escape single quotes', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ message: "It's a problem" });
      const output = reporter.format(violation);
      expect(output).toContain('&#039;');
    });

    test('should escape double quotes', () => {
      const reporter = new HTMLReporter();
      const violation = createMockViolation({ message: 'Say "hello"' });
      const output = reporter.format(violation);
      expect(output).toContain('&quot;');
    });
  });
});
