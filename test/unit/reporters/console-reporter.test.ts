import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConsoleReporter } from '../../../src/reporters/console-reporter.js';
import type { AnalysisResult, Violation, FileAnalysisResult, ReporterOptions } from '../../../src/reporters/types.js';

// ANSI codes for color testing
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Helper to create mock violation
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

// Helper to create mock file result
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

// Helper to create mock analysis result
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

describe('ConsoleReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new ConsoleReporter();
      expect(reporter.name).toBe('console');
    });

    test('should accept color option as true', () => {
      const reporter = new ConsoleReporter({ color: true });
      const violation = createMockViolation();
      const output = reporter.format(violation);
      expect(output).toContain(ANSI.red);
    });

    test('should accept color option as false', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violation = createMockViolation();
      const output = reporter.format(violation);
      expect(output).not.toContain(ANSI.red);
    });

    test('should accept quiet option', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should accept verbose option', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should accept includeSource option', () => {
      const reporter = new ConsoleReporter({ includeSource: false, color: false });
      const violationWithSource = createMockViolation({ source: 'const x = 1;' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => c.includes('const x = 1;'))).toBe(false);
    });

    test('should handle empty options object', () => {
      const reporter = new ConsoleReporter({});
      expect(reporter.name).toBe('console');
    });
  });

  describe('format', () => {
    test('should format error violation with color', () => {
      const reporter = new ConsoleReporter({ color: true });
      const violation = createMockViolation({ severity: 'error' });
      const output = reporter.format(violation);
      expect(output).toContain('✖');
      expect(output).toContain('ERROR');
      expect(output).toContain('test-rule');
      expect(output).toContain('test.ts:10:5');
    });

    test('should format warning violation with color', () => {
      const reporter = new ConsoleReporter({ color: true });
      const violation = createMockViolation({ severity: 'warning' });
      const output = reporter.format(violation);
      expect(output).toContain('⚠');
      expect(output).toContain('WARNING');
      expect(output).toContain(ANSI.yellow);
    });

    test('should format info violation with color', () => {
      const reporter = new ConsoleReporter({ color: true });
      const violation = createMockViolation({ severity: 'info' });
      const output = reporter.format(violation);
      expect(output).toContain('ℹ');
      expect(output).toContain('INFO');
      expect(output).toContain(ANSI.blue);
    });

    test('should format violation without color', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violation = createMockViolation();
      const output = reporter.format(violation);
      expect(output).toContain('✖');
      expect(output).toContain('ERROR');
      expect(output).not.toContain(ANSI.red);
    });

    test('should include all violation details', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violation = createMockViolation({
        ruleId: 'my-custom-rule',
        message: 'Variable must be declared before use',
        filePath: 'src/utils/helper.ts',
        line: 42,
        column: 15,
      });
      const output = reporter.format(violation);
      expect(output).toContain('my-custom-rule');
      expect(output).toContain('Variable must be declared before use');
      expect(output).toContain('src/utils/helper.ts:42:15');
    });
  });

  describe('report', () => {
    test('should print "No files analyzed" when files array is empty', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({ files: [] });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalledWith('No files analyzed.');
    });

    test('should report errors in full mode', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => c.includes('test.ts'))).toBe(true);
    });

    test('should report only errors in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false });
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning', ruleId: 'warn-rule' }),
          ]),
        ],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 1, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      const errorCalls = calls.filter((c) => c.includes('ERROR'));
      const warningCalls = calls.filter((c) => c.includes('warn-rule'));
      expect(errorCalls.length).toBeGreaterThan(0);
      expect(warningCalls.length).toBe(0);
    });

    test('should print source snippet when includeSource is true', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false });
      const violationWithSource = createMockViolation({ source: 'const x = 1;' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('const x = 1;'))).toBe(true);
    });

    test('should print suggestion when available', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violationWithSuggestion = createMockViolation({ suggestion: 'Consider using const instead' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSuggestion])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('Suggestion:'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('Consider using const instead'))).toBe(true);
    });

    test('should print verbose info when verbose mode is enabled', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()], { parseTime: 5, analysisTime: 10, totalTime: 15 })],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('--- Details ---'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('parse: 5ms'))).toBe(true);
    });

    test('should handle multiple files with violations', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('file1.ts', [createMockViolation({ ruleId: 'rule1' })]),
          createMockFileResult('file2.ts', [createMockViolation({ ruleId: 'rule2' })]),
        ],
        summary: { totalFiles: 2, filesWithViolations: 2, errorCount: 2, warningCount: 0, infoCount: 0, totalTime: 100 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('file1.ts'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('file2.ts'))).toBe(true);
    });

    test('should skip files without violations in full mode', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('clean.ts', []),
          createMockFileResult('dirty.ts', [createMockViolation()]),
        ],
        summary: { totalFiles: 2, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 100 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('clean.ts'))).toBe(false);
      expect(calls.some((c) => typeof c === 'string' && c.includes('dirty.ts'))).toBe(true);
    });
  });

  describe('summary output', () => {
    test('should display errors in summary', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 2, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('2 errors'))).toBe(true);
    });

    test('should display warnings in summary', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 3, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('3 warnings'))).toBe(true);
    });

    test('should display info in summary', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 0, infoCount: 5, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('5 info'))).toBe(true);
    });

    test('should display "No problems found" when no violations', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('No problems found'))).toBe(true);
    });

    test('should display singular form for single error', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 error'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 errors'))).toBe(false);
    });

    test('should display file count in summary', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: { totalFiles: 5, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('5 files analyzed'))).toBe(true);
    });

    test('should display singular file count', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 file analyzed'))).toBe(true);
    });
  });

  describe('time formatting', () => {
    test('should display time in milliseconds for short durations', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 500 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('500ms'))).toBe(true);
    });

    test('should display time in seconds for longer durations', () => {
      const reporter = new ConsoleReporter({ color: false });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 2500 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('2.50s'))).toBe(true);
    });
  });

  describe('color output', () => {
    test('should colorize file headers in color mode', () => {
      const reporter = new ConsoleReporter({ color: true });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes(ANSI.cyan) && c.includes('test.ts'))).toBe(true);
    });

    test('should colorize summary errors in color mode', () => {
      const reporter = new ConsoleReporter({ color: true });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes(ANSI.red) && c.includes('1 error'))).toBe(true);
    });

    test('should colorize summary warnings in color mode', () => {
      const reporter = new ConsoleReporter({ color: true });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 1, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes(ANSI.yellow) && c.includes('1 warning'))).toBe(true);
    });

    test('should colorize "No problems found" in green', () => {
      const reporter = new ConsoleReporter({ color: true });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes(ANSI.green) && c.includes('No problems found'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle violation with endLine and endColumn', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violation = createMockViolation({ endLine: 15, endColumn: 10 });
      const output = reporter.format(violation);
      expect(output).toContain('test.ts:10:5');
    });

    test('should handle multi-line source code', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false });
      const multiLineSource = 'line1\nline2\nline3\nline4\nline5';
      const violationWithSource = createMockViolation({ source: multiLineSource });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('line1'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('line2'))).toBe(true);
      expect(calls.some((c) => typeof c === 'string' && c.includes('line3'))).toBe(true);
    });

    test('should handle empty source string', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false });
      const violationWithEmptySource = createMockViolation({ source: '' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithEmptySource])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should handle undefined source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false });
      const violationWithoutSource = createMockViolation();
      delete (violationWithoutSource as Partial<Violation>).source;
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithoutSource])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should handle violation with meta data', () => {
      const reporter = new ConsoleReporter({ color: false });
      const violationWithMeta = createMockViolation({ meta: { complexity: 15 } });
      const output = reporter.format(violationWithMeta);
      expect(output).toContain('Test violation message');
    });

    test('should handle large number of files', () => {
      const reporter = new ConsoleReporter({ color: false });
      const files: FileAnalysisResult[] = [];
      for (let i = 0; i < 100; i++) {
        files.push(createMockFileResult(`file${i}.ts`, [createMockViolation({ ruleId: `rule${i}` })]));
      }
      const results = createMockAnalysisResult({
        files,
        summary: { totalFiles: 100, filesWithViolations: 100, errorCount: 100, warningCount: 0, infoCount: 0, totalTime: 1000 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[];
      expect(calls.some((c) => typeof c === 'string' && c.includes('100 files'))).toBe(true);
    });

    test('should handle violation at column 1', () => {
      const reporter = new ConsoleReporter({ color: false, includeSource: true });
      const violationAtCol1 = createMockViolation({ column: 1, source: 'const x = 1;' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationAtCol1])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
