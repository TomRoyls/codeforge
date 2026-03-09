import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { JSONReporter, type JsonOutput, type JsonViolation } from '../../../src/reporters/json-reporter.js';
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

describe('JSONReporter', () => {
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
      const reporter = new JSONReporter();
      expect(reporter.name).toBe('json');
    });

    test('should accept pretty option', () => {
      const reporter = new JSONReporter({ pretty: true });
      expect(reporter.name).toBe('json');
    });

    test('should accept outputPath option', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' });
      expect(reporter.name).toBe('json');
    });

    test('should handle empty options object', () => {
      const reporter = new JSONReporter({});
      expect(reporter.name).toBe('json');
    });

    test('should accept all options combined', () => {
      const reporter = new JSONReporter({ pretty: true, outputPath: './output/report.json' });
      expect(reporter.name).toBe('json');
    });
  });

  describe('format', () => {
    test('should format violation as JSON string', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation();
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.ruleId).toBe('test-rule');
      expect(parsed.severity).toBe('error');
      expect(parsed.message).toBe('Test violation message');
    });

    test('should include location in formatted output', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ filePath: 'src/app.ts', line: 42, column: 10 });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.location.file).toBe('src/app.ts');
      expect(parsed.location.line).toBe(42);
      expect(parsed.location.column).toBe(10);
    });

    test('should include optional endLine and endColumn', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ endLine: 50, endColumn: 20 });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.location.endLine).toBe(50);
      expect(parsed.location.endColumn).toBe(20);
    });

    test('should include source when provided', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ source: 'const x = 1;' });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.source).toBe('const x = 1;');
    });

    test('should include suggestion when provided', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ suggestion: 'Use const instead' });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.suggestion).toBe('Use const instead');
    });

    test('should include meta when provided', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ meta: { complexity: 15, type: 'cognitive' } });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.meta?.complexity).toBe(15);
      expect(parsed.meta?.type).toBe('cognitive');
    });

    test('should handle warning severity', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ severity: 'warning' });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.severity).toBe('warning');
    });

    test('should handle info severity', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ severity: 'info' });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.severity).toBe('info');
    });

    test('should produce valid JSON', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation();
      const output = reporter.format(violation);
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });

  describe('report to console', () => {
    test('should output JSON to console when no outputPath', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(output)).not.toThrow();
    });

    test('should output compact JSON by default', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).not.toContain('\n');
    });

    test('should output pretty JSON with pretty option', () => {
      const reporter = new JSONReporter({ pretty: true });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain('\n');
      expect(output).toContain('  ');
    });

    test('should include version in output', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        version: '2.0.0',
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.version).toBe('2.0.0');
    });

    test('should use default version when not provided', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.version).toBe('1.0.0');
    });

    test('should include timestamp in output', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        timestamp: '2024-03-15T12:30:00.000Z',
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.timestamp).toBe('2024-03-15T12:30:00.000Z');
    });

    test('should include summary in output', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 10, filesWithViolations: 3, errorCount: 5, warningCount: 2, infoCount: 1, totalTime: 500 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.summary.totalFiles).toBe(10);
      expect(output.summary.filesWithViolations).toBe(3);
      expect(output.summary.errorCount).toBe(5);
      expect(output.summary.warningCount).toBe(2);
      expect(output.summary.infoCount).toBe(1);
      expect(output.summary.totalTime).toBe(500);
    });

    test('should include files array in output', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('file1.ts', [createMockViolation()]),
          createMockFileResult('file2.ts', []),
        ],
        summary: { totalFiles: 2, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 100 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.files).toHaveLength(2);
      expect(output.files[0].filePath).toBe('file1.ts');
      expect(output.files[1].filePath).toBe('file2.ts');
    });
  });

  describe('report to file', () => {
    test('should write to file when outputPath is provided', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalled();
    });

    test('should create directory if it does not exist', () => {
      const reporter = new JSONReporter({ outputPath: './reports/nested/report.json' });
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
      const reporter = new JSONReporter({ outputPath: './reports/report.json' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      vi.mocked(path.dirname).mockReturnValue('./reports');
      reporter.report(results);
      expect(fsMkdirSyncMock).not.toHaveBeenCalled();
    });

    test('should write correct content to file', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'my-rule' })])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 1, warningCount: 0, infoCount: 0, totalTime: 50 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent) as JsonOutput;
      expect(parsed.files[0].violations[0].ruleId).toBe('my-rule');
    });

    test('should write pretty JSON to file with pretty option', () => {
      const reporter = new JSONReporter({ outputPath: './report.json', pretty: true });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string;
      expect(writtenContent).toContain('\n');
    });

    test('should use utf-8 encoding', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        './report.json',
        expect.any(String),
        'utf8'
      );
    });
  });

  describe('transformResults', () => {
    test('should transform violations correctly', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({
        ruleId: 'no-unused-vars',
        severity: 'warning',
        message: 'Variable x is declared but never used',
        filePath: 'src/utils.ts',
        line: 15,
        column: 7,
        endLine: 15,
        endColumn: 8,
        source: 'const x = 5;',
        suggestion: 'Remove the unused variable',
        meta: { fixable: true },
      });
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/utils.ts', [violation])],
        summary: { totalFiles: 1, filesWithViolations: 1, errorCount: 0, warningCount: 1, infoCount: 0, totalTime: 50 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      const transformed = output.files[0].violations[0];
      expect(transformed.ruleId).toBe('no-unused-vars');
      expect(transformed.severity).toBe('warning');
      expect(transformed.message).toBe('Variable x is declared but never used');
      expect(transformed.location.file).toBe('src/utils.ts');
      expect(transformed.location.line).toBe(15);
      expect(transformed.location.column).toBe(7);
      expect(transformed.location.endLine).toBe(15);
      expect(transformed.location.endColumn).toBe(8);
      expect(transformed.source).toBe('const x = 5;');
      expect(transformed.suggestion).toBe('Remove the unused variable');
      expect(transformed.meta?.fixable).toBe(true);
    });

    test('should include file stats in output', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [], { parseTime: 5, analysisTime: 15, totalTime: 20 })],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 20 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.files[0].stats.parseTime).toBe(5);
      expect(output.files[0].stats.analysisTime).toBe(15);
      expect(output.files[0].stats.totalTime).toBe(20);
    });

    test('should handle empty files array', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.files).toEqual([]);
    });

    test('should handle multiple files with multiple violations', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'rule1' }),
            createMockViolation({ ruleId: 'rule2', severity: 'warning' }),
          ]),
          createMockFileResult('b.ts', [
            createMockViolation({ ruleId: 'rule3', severity: 'info' }),
          ]),
        ],
        summary: { totalFiles: 2, filesWithViolations: 2, errorCount: 1, warningCount: 1, infoCount: 1, totalTime: 100 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.files).toHaveLength(2);
      expect(output.files[0].violations).toHaveLength(2);
      expect(output.files[1].violations).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    test('should handle violation without optional fields', () => {
      const reporter = new JSONReporter();
      const minimalViolation: Violation = {
        ruleId: 'minimal',
        severity: 'error',
        message: 'Minimal violation',
        filePath: 'test.ts',
        line: 1,
        column: 1,
      };
      const output = reporter.format(minimalViolation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.location.endLine).toBeUndefined();
      expect(parsed.location.endColumn).toBeUndefined();
      expect(parsed.source).toBeUndefined();
      expect(parsed.suggestion).toBeUndefined();
      expect(parsed.meta).toBeUndefined();
    });

    test('should handle deeply nested file path', () => {
      const reporter = new JSONReporter({ outputPath: './reports/2024/01/15/deep/nested/report.json' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(false);
      vi.mocked(path.dirname).mockReturnValue('./reports/2024/01/15/deep/nested');
      reporter.report(results);
      expect(fsMkdirSyncMock).toHaveBeenCalled();
    });

    test('should handle special characters in violation message', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({
        message: 'Error: "quotes" and \'apostrophes\' with \n newlines \t tabs',
      });
      const output = reporter.format(violation);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    test('should handle unicode in file path', () => {
      const reporter = new JSONReporter();
      const violation = createMockViolation({ filePath: 'src/文件/测试.ts' });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(parsed.location.file).toBe('src/文件/测试.ts');
    });

    test('should handle large meta object', () => {
      const reporter = new JSONReporter();
      const largeMeta: Record<string, unknown> = {};
      for (let i = 0; i < 100; i++) {
        largeMeta[`key${i}`] = `value${i}`;
      }
      const violation = createMockViolation({ meta: largeMeta });
      const output = reporter.format(violation);
      const parsed = JSON.parse(output) as JsonViolation;
      expect(Object.keys(parsed.meta ?? {}).length).toBe(100);
    });

    test('should handle file with empty violations array', () => {
      const reporter = new JSONReporter();
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: { totalFiles: 1, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 10 },
      });
      reporter.report(results);
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string) as JsonOutput;
      expect(output.files[0].violations).toEqual([]);
    });

    test('should handle root path output', () => {
      const reporter = new JSONReporter({ outputPath: '/tmp/report.json' });
      const results = createMockAnalysisResult({
        files: [],
        summary: { totalFiles: 0, filesWithViolations: 0, errorCount: 0, warningCount: 0, infoCount: 0, totalTime: 0 },
      });
      fsExistsSyncMock.mockReturnValue(true);
      vi.mocked(path.dirname).mockReturnValue('/tmp');
      reporter.report(results);
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith('/tmp/report.json', expect.any(String), 'utf8');
    });
  });
});
