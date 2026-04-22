import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fileWriterModule from '../../../src/utils/file-writer.js'
import { CSVReporter, createCSVReporter } from '../../../src/reporters/csv-reporter.js'
import type { AnalysisResult, Violation } from '../../../src/reporters/types.js'

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    filePath: '/src/test.ts',
    line: 1,
    column: 1,
    severity: 'error',
    ruleId: 'test-rule',
    message: 'Test violation',
    ...overrides,
  }
}

function createMockResult(violations: Violation[] = []): AnalysisResult {
  return {
    files: violations.map((v) => ({
      filePath: v.filePath,
      stats: {
        analysisTime: 1,
        parseTime: 1,
        totalTime: 2,
      },
      violations: [v],
    })),
    summary: {
      totalFiles: violations.length,
      filesWithViolations: violations.length,
      errorCount: violations.filter((v) => v.severity === 'error').length,
      warningCount: violations.filter((v) => v.severity === 'warning').length,
      infoCount: violations.filter((v) => v.severity === 'info').length,
      totalTime: 100,
    },
    timestamp: '2026-03-17T00:00:00.000Z',
    version: '1.0.0',
  }
}

describe('CSVReporter', () => {
  describe('constructor', () => {
    test('creates reporter with default options', () => {
      const reporter = new CSVReporter({})
      expect(reporter.name).toBe('csv')
    })

    test('creates reporter with output path', () => {
      const reporter = new CSVReporter({ outputPath: '/tmp/output.csv' })
      expect(reporter.name).toBe('csv')
    })

    test('creates reporter with no options', () => {
      const reporter = new CSVReporter()
      expect(reporter.name).toBe('csv')
    })

    test('creates reporter with empty options object', () => {
      const reporter = new CSVReporter({})
      expect(reporter).toBeDefined()
    })

    test('name property is readonly string', () => {
      const reporter = new CSVReporter({})
      expect(typeof reporter.name).toBe('string')
    })
  })

  describe('format', () => {
    test('formats single violation', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation()
      const formatted = reporter.format(violation)
      expect(formatted).toContain('/src/test.ts')
      expect(formatted).toContain('1')
      expect(formatted).toContain('error')
      expect(formatted).toContain('test-rule')
      expect(formatted).toContain('Test violation')
    })

    test('escapes fields with commas', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        message: 'Error, with comma',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('"Error, with comma"')
    })

    test('escapes fields with quotes', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        message: 'Error "quoted" text',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('"Error ""quoted"" text"')
    })

    test('handles null values', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        source: undefined,
        suggestion: undefined,
      })
      const formatted = reporter.format(violation)
      expect(formatted).toBeDefined()
    })

    test('produces comma-separated fields', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: '/src/a.ts',
        line: 10,
        column: 5,
        severity: 'error',
        ruleId: 'no-console',
        message: 'Unexpected console',
      })
      const formatted = reporter.format(violation)
      const fields = formatted.split(',')
      expect(fields.length).toBeGreaterThanOrEqual(10)
    })

    test('includes all 10 columns in output', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        endLine: 20,
        endColumn: 30,
        source: 'console.log("x")',
        suggestion: 'Remove console.log',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('/src/test.ts')
      expect(formatted).toContain('error')
      expect(formatted).toContain('test-rule')
      expect(formatted).toContain('Test violation')
      expect(formatted).toContain('20')
      expect(formatted).toContain('30')
      expect(formatted).toContain('console.log(""x"")')
      expect(formatted).toContain('Remove console.log')
    })

    test('formats file path as first field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: '/src/index.ts' })
      const formatted = reporter.format(violation)
      expect(formatted.startsWith('/src/index.ts')).toBe(true)
    })

    test('formats line number as second field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: 'a', line: 42 })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[1]).toBe('42')
    })

    test('formats column number as third field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: 'a', column: 15 })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[2]).toBe('15')
    })

    test('formats severity as fourth field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: 'a', severity: 'warning' })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[3]).toBe('warning')
    })

    test('formats ruleId as fifth field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: 'a', ruleId: 'my-rule' })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[4]).toBe('my-rule')
    })

    test('formats message as sixth field', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ filePath: 'a', message: 'hello world' })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[5]).toBe('hello world')
    })

    test('leaves endLine empty when undefined', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endLine: undefined })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[6]).toBe('')
    })

    test('leaves endColumn empty when undefined', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endColumn: undefined })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[7]).toBe('')
    })

    test('leaves source empty when undefined', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ source: undefined })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[8]).toBe('')
    })

    test('leaves suggestion empty when undefined', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ suggestion: undefined })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[9]).toBe('')
    })

    test('includes endLine when provided', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endLine: 99 })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('99')
    })

    test('includes endColumn when provided', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endColumn: 77 })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('77')
    })

    test('includes source when provided', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ source: 'let x = 1' })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('let x = 1')
    })

    test('includes suggestion when provided', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ suggestion: 'Use const' })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('Use const')
    })
  })

  describe('format - severity levels', () => {
    test('formats error severity', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ severity: 'error' }))
      expect(formatted).toContain('error')
    })

    test('formats warning severity', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(formatted).toContain('warning')
    })

    test('formats info severity', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ severity: 'info' }))
      expect(formatted).toContain('info')
    })
  })

  describe('format - CSV escaping (RFC 4180)', () => {
    test('does not quote plain string', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'simple' }))
      expect(formatted).not.toContain('"simple"')
    })

    test('quotes field containing comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a,b' }))
      expect(formatted).toContain('"a,b"')
    })

    test('quotes field containing double quote and escapes it', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'say "hi"' }))
      expect(formatted).toContain('"say ""hi"""')
    })

    test('quotes field containing newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'line1\nline2' }))
      expect(formatted).toContain('"line1\nline2"')
    })

    test('quotes field containing carriage return', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'line1\rline2' }))
      expect(formatted).toContain('"line1\rline2"')
    })

    test('quotes field containing CRLF', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'line1\r\nline2' }))
      expect(formatted).toContain('"line1\r\nline2"')
    })

    test('handles multiple double quotes in field', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '"a" and "b"' }))
      expect(formatted).toContain('"""a"" and ""b"""')
    })

    test('handles comma and quote together', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a, "b" c' }))
      expect(formatted).toContain('"a, ""b"" c"')
    })

    test('handles comma and newline together', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a,\nb' }))
      expect(formatted).toContain('"a,\nb"')
    })

    test('handles field that is just a comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: ',' }))
      expect(formatted).toContain('","')
    })

    test('handles field that is just a double quote', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '"' }))
      expect(formatted).toContain('""""')
    })

    test('handles field that is just a newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '\n' }))
      expect(formatted).toContain('"\n"')
    })

    test('handles empty string message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '' }))
      expect(formatted).toBeDefined()
    })

    test('escapes filePath containing comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: '/src/my,file.ts' }))
      expect(formatted).toContain('"/src/my,file.ts"')
    })

    test('escapes filePath containing quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: '/src/"weird".ts' }))
      expect(formatted).toContain('"/src/""weird"".ts"')
    })

    test('escapes ruleId containing comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'rule,with,commas' }))
      expect(formatted).toContain('"rule,with,commas"')
    })

    test('escapes ruleId containing quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'rule"quoted"id' }))
      expect(formatted).toContain('"rule""quoted""id"')
    })

    test('escapes source containing comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: 'a, b, c' }))
      expect(formatted).toContain('"a, b, c"')
    })

    test('escapes source containing newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: 'line1\nline2' }))
      expect(formatted).toContain('"line1\nline2"')
    })

    test('escapes suggestion containing comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'fix a, then b' }))
      expect(formatted).toContain('"fix a, then b"')
    })

    test('escapes suggestion containing quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'use "strict"' }))
      expect(formatted).toContain('"use ""strict"""')
    })

    test('escapes suggestion containing newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'step1\nstep2' }))
      expect(formatted).toContain('"step1\nstep2"')
    })

    test('handles all special characters in one message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a,b\nc\r"d"' }))
      expect(formatted).toContain('"a,b\nc\r""d"""')
    })
  })

  describe('format - various line and column numbers', () => {
    test('handles line 0', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ line: 0 }))
      expect(formatted).toContain('0')
    })

    test('handles large line number', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ line: 99999 }))
      expect(formatted).toContain('99999')
    })

    test('handles column 0', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ column: 0 }))
      expect(formatted).toContain('0')
    })

    test('handles large column number', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ column: 50000 }))
      expect(formatted).toContain('50000')
    })

    test('handles endLine 0', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ endLine: 0 }))
      expect(formatted).toContain('0')
    })

    test('handles endColumn 0', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ endColumn: 0 }))
      expect(formatted).toContain('0')
    })

    test('handles large endLine', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ endLine: 100000 }))
      expect(formatted).toContain('100000')
    })

    test('handles large endColumn', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ endColumn: 80000 }))
      expect(formatted).toContain('80000')
    })

    test('handles line 1 column 1', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ line: 1, column: 1 }))
      const parts = formatted.split(',')
      expect(parts[1]).toBe('1')
      expect(parts[2]).toBe('1')
    })
  })

  describe('format - file paths', () => {
    test('handles Unix absolute path', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({ filePath: '/home/user/project/src/file.ts' }),
      )
      expect(formatted).toContain('/home/user/project/src/file.ts')
    })

    test('handles relative path', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: './src/file.ts' }))
      expect(formatted).toContain('./src/file.ts')
    })

    test('handles parent relative path', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: '../src/file.ts' }))
      expect(formatted).toContain('../src/file.ts')
    })

    test('handles simple filename', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: 'file.ts' }))
      expect(formatted).toContain('file.ts')
    })

    test('handles path with spaces', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: '/src/my file.ts' }))
      expect(formatted).toContain('/src/my file.ts')
    })

    test('handles Windows-style path', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({ filePath: 'C:\\Users\\project\\file.ts' }),
      )
      expect(formatted).toContain('C:\\Users\\project\\file.ts')
    })

    test('handles deeply nested path', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({ filePath: '/a/b/c/d/e/f/g/h/i/j/k/file.ts' }),
      )
      expect(formatted).toContain('/a/b/c/d/e/f/g/h/i/j/k/file.ts')
    })

    test('handles empty string filePath', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ filePath: '' }))
      expect(formatted).toBeDefined()
    })
  })

  describe('format - special characters in messages', () => {
    test('handles tab character', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'tab\there' }))
      expect(formatted).toContain('tab\there')
    })

    test('handles backslash', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'path\\to\\file' }))
      expect(formatted).toContain('path\\to\\file')
    })

    test('handles unicode characters', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'Error: 日本語テスト' }))
      expect(formatted).toContain('Error: 日本語テスト')
    })

    test('handles emoji in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '🚨 Critical error' }))
      expect(formatted).toContain('🚨 Critical error')
    })

    test('handles accented characters', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'Café résumé naïve' }))
      expect(formatted).toContain('Café résumé naïve')
    })

    test('handles HTML entities in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '<div>&nbsp;</div>' }))
      expect(formatted).toContain('<div>&nbsp;</div>')
    })

    test('handles single quotes in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: "it's a test" }))
      expect(formatted).toContain("it's a test")
    })

    test('handles multiple consecutive spaces', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'too   many    spaces' }))
      expect(formatted).toContain('too   many    spaces')
    })

    test('handles leading whitespace', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '  leading spaces' }))
      expect(formatted).toContain('  leading spaces')
    })

    test('handles trailing whitespace', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'trailing  ' }))
      expect(formatted).toContain('trailing  ')
    })

    test('handles parentheses', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'call() is invalid' }))
      expect(formatted).toContain('call() is invalid')
    })

    test('handles brackets', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'array[0] out of bounds' }))
      expect(formatted).toContain('array[0] out of bounds')
    })

    test('handles braces', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '{key: value}' }))
      expect(formatted).toContain('{key: value}')
    })

    test('handles pipe character', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a | b' }))
      expect(formatted).toContain('a | b')
    })

    test('handles semicolon', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a; b' }))
      expect(formatted).toContain('a; b')
    })

    test('handles at sign', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'user@example.com' }))
      expect(formatted).toContain('user@example.com')
    })

    test('handles hash character', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '# heading' }))
      expect(formatted).toContain('# heading')
    })

    test('handles dollar sign', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '$variable is unused' }))
      expect(formatted).toContain('$variable is unused')
    })

    test('handles percent sign', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '100% coverage' }))
      expect(formatted).toContain('100% coverage')
    })

    test('handles ampersand', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a && b' }))
      expect(formatted).toContain('a && b')
    })

    test('handles asterisk', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'glob/**/*.ts' }))
      expect(formatted).toContain('glob/**/*.ts')
    })

    test('handles plus sign', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a + b' }))
      expect(formatted).toContain('a + b')
    })

    test('handles equals sign', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a === b' }))
      expect(formatted).toContain('a === b')
    })

    test('handles exclamation mark', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'Error!' }))
      expect(formatted).toContain('Error!')
    })

    test('handles question mark', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'What?' }))
      expect(formatted).toContain('What?')
    })

    test('handles forward slash', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a / b' }))
      expect(formatted).toContain('a / b')
    })

    test('handles backtick', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '`code`' }))
      expect(formatted).toContain('`code`')
    })

    test('handles tilde', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '~/path' }))
      expect(formatted).toContain('~/path')
    })

    test('handles caret', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a ^ b' }))
      expect(formatted).toContain('a ^ b')
    })

    test('handles underscore', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'my_variable' }))
      expect(formatted).toContain('my_variable')
    })

    test('handles colon', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'key: value' }))
      expect(formatted).toContain('key: value')
    })

    test('handles very long message', () => {
      const reporter = new CSVReporter({})
      const longMessage = 'x'.repeat(5000)
      const formatted = reporter.format(createMockViolation({ message: longMessage }))
      expect(formatted).toContain(longMessage)
    })

    test('handles multiline source code', () => {
      const reporter = new CSVReporter({})
      const source = 'function foo() {\n  return 1;\n}'
      const formatted = reporter.format(createMockViolation({ source }))
      expect(formatted).toContain('"function foo() {\n  return 1;\n}"')
    })
  })

  describe('format - ruleId variations', () => {
    test('handles simple ruleId', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'no-console' }))
      expect(formatted).toContain('no-console')
    })

    test('handles ruleId with slashes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({ ruleId: '@typescript-eslint/no-explicit-any' }),
      )
      expect(formatted).toContain('@typescript-eslint/no-explicit-any')
    })

    test('handles ruleId with camelCase', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'noUnusedVars' }))
      expect(formatted).toContain('noUnusedVars')
    })

    test('handles ruleId with dots', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'security.eval' }))
      expect(formatted).toContain('security.eval')
    })

    test('handles empty ruleId', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: '' }))
      expect(formatted).toBeDefined()
    })

    test('handles numeric ruleId-like string', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ ruleId: 'rule-123' }))
      expect(formatted).toContain('rule-123')
    })
  })

  describe('report', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('reports multiple violations', () => {
      const reporter = new CSVReporter({})
      const violations = [
        createMockViolation({ line: 1, message: 'First error' }),
        createMockViolation({ line: 2, message: 'Second error' }),
      ]
      const result = createMockResult(violations)
      reporter.report(result)
      expect(consoleSpy).toHaveBeenCalled()
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('file,line,column')
      expect(output).toContain('First error')
      expect(output).toContain('Second error')
      expect(output).toContain('# Summary')
    })

    test('includes summary section', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 1')
      expect(output).toContain('# Info: 1')
      expect(output).toContain('# Total Time:')
    })

    test('outputs to stdout when no outputPath', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('output ends with newline', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output.endsWith('\n')).toBe(true)
    })

    test('includes header row', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain(
        'file,line,column,severity,rule,message,end_line,end_column,source,suggestion',
      )
    })

    test('header is first line of output', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      const firstLine = output.split('\n')[0]
      expect(firstLine).toBe(
        'file,line,column,severity,rule,message,end_line,end_column,source,suggestion',
      )
    })

    test('writes to file when outputPath is set', () => {
      const writeSpy = vi.spyOn(fileWriterModule, 'writeToFile').mockImplementation(() => {})
      const reporter = new CSVReporter({ outputPath: '/tmp/test-output.csv' })
      reporter.report(createMockResult([createMockViolation()]))

      expect(writeSpy).toHaveBeenCalledTimes(1)
      expect(writeSpy.mock.calls[0][0]).toBe('/tmp/test-output.csv')
      expect(writeSpy.mock.calls[0][1]).toContain('file,line,column')
      writeSpy.mockRestore()
    })

    test('handles empty results', () => {
      const reporter = new CSVReporter({})
      const emptyResult: AnalysisResult = {
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(emptyResult)
      expect(consoleSpy).toHaveBeenCalled()
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('file,line,column')
      expect(output).toContain('# Summary')
    })

    test('includes timestamp in summary', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.timestamp = '2026-06-15T12:30:45.000Z'
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Timestamp: 2026-06-15T12:30:45.000Z')
    })

    test('includes total time in summary', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalTime = 5432
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Time: 5432ms')
    })

    test('includes total files in summary', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalFiles = 42
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Files: 42')
    })

    test('includes files with violations in summary', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.filesWithViolations = 7
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Files with Violations: 7')
    })

    test('handles zero violations', () => {
      const reporter = new CSVReporter({})
      const result: AnalysisResult = {
        files: [],
        summary: {
          totalFiles: 10,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 0')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
      expect(output).toContain('# Total Files: 10')
    })

    test('handles single violation', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation({ message: 'Only one' })]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('Only one')
    })

    test('handles many violations', () => {
      const reporter = new CSVReporter({})
      const violations = Array.from({ length: 100 }, (_, i) =>
        createMockViolation({ line: i + 1, message: `Error ${i + 1}` }),
      )
      reporter.report(createMockResult(violations))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('Error 1')
      expect(output).toContain('Error 50')
      expect(output).toContain('Error 100')
    })

    test('handles violations from multiple files', () => {
      const reporter = new CSVReporter({})
      const v1 = createMockViolation({ filePath: '/src/a.ts', message: 'Error A' })
      const v2 = createMockViolation({ filePath: '/src/b.ts', message: 'Error B' })
      const result: AnalysisResult = {
        files: [
          {
            filePath: '/src/a.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [v1],
          },
          {
            filePath: '/src/b.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [v2],
          },
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 4,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('Error A')
      expect(output).toContain('Error B')
      expect(output).toContain('/src/a.ts')
      expect(output).toContain('/src/b.ts')
    })

    test('handles file with multiple violations', () => {
      const reporter = new CSVReporter({})
      const v1 = createMockViolation({ line: 1, message: 'Error 1' })
      const v2 = createMockViolation({ line: 5, message: 'Error 2' })
      const v3 = createMockViolation({ line: 10, message: 'Error 3' })
      const result: AnalysisResult = {
        files: [
          {
            filePath: '/src/a.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [v1, v2, v3],
          },
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 2,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('Error 1')
      expect(output).toContain('Error 2')
      expect(output).toContain('Error 3')
    })
  })

  describe('report - summary formatting', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('summary starts with comment marker', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Summary')
    })

    test('summary shows total files', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalFiles = 999
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Files: 999')
    })

    test('summary shows files with violations', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.filesWithViolations = 5
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Files with Violations: 5')
    })

    test('summary shows error count', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.errorCount = 10
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 10')
    })

    test('summary shows warning count', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.warningCount = 3
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Warnings: 3')
    })

    test('summary shows info count', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.infoCount = 7
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Info: 7')
    })

    test('summary shows total time with ms suffix', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalTime = 1234
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Time: 1234ms')
    })

    test('summary shows timestamp', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.timestamp = '2026-12-25T00:00:00.000Z'
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Timestamp: 2026-12-25T00:00:00.000Z')
    })

    test('summary with zero total time', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalTime = 0
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Time: 0ms')
    })

    test('summary with large total time', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([createMockViolation()])
      result.summary.totalTime = 999999
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Time: 999999ms')
    })

    test('summary with all zero counts', () => {
      const reporter = new CSVReporter({})
      const result: AnalysisResult = {
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Total Files: 0')
      expect(output).toContain('# Files with Violations: 0')
      expect(output).toContain('# Errors: 0')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
    })

    test('summary lines are comment-prefixed', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      const summarySection = output.split('# Summary')[1]
      const lines = summarySection.split('\n').filter((l: string) => l.trim().length > 0)
      for (const line of lines) {
        expect(line.startsWith('#')).toBe(true)
      }
    })

    test('summary is separated from data by blank line', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('\n\n# Summary')
    })
  })

  describe('header', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('contains all 10 column names', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('file')
      expect(output).toContain('line')
      expect(output).toContain('column')
      expect(output).toContain('severity')
      expect(output).toContain('rule')
      expect(output).toContain('message')
      expect(output).toContain('end_line')
      expect(output).toContain('end_column')
      expect(output).toContain('source')
      expect(output).toContain('suggestion')
    })

    test('header columns are comma-separated', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([]))
      const output = consoleSpy.mock.calls[0][0]
      const firstLine = output.split('\n')[0]
      expect(firstLine).toBe(
        'file,line,column,severity,rule,message,end_line,end_column,source,suggestion',
      )
    })

    test('header has exactly 10 columns', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([]))
      const output = consoleSpy.mock.calls[0][0]
      const firstLine = output.split('\n')[0]
      expect(firstLine.split(',').length).toBe(10)
    })

    test('header column order is correct', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([]))
      const output = consoleSpy.mock.calls[0][0]
      const firstLine = output.split('\n')[0]
      const columns = firstLine.split(',')
      expect(columns[0]).toBe('file')
      expect(columns[1]).toBe('line')
      expect(columns[2]).toBe('column')
      expect(columns[3]).toBe('severity')
      expect(columns[4]).toBe('rule')
      expect(columns[5]).toBe('message')
      expect(columns[6]).toBe('end_line')
      expect(columns[7]).toBe('end_column')
      expect(columns[8]).toBe('source')
      expect(columns[9]).toBe('suggestion')
    })

    test('header uses snake_case for multi-word columns', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('end_line')
      expect(output).toContain('end_column')
    })
  })

  describe('createCSVReporter', () => {
    test('creates reporter instance', () => {
      const reporter = createCSVReporter({})
      expect(reporter).toBeInstanceOf(CSVReporter)
      expect(reporter.name).toBe('csv')
    })

    test('passes options to reporter', () => {
      const reporter = createCSVReporter({ outputPath: '/tmp/test.csv' })
      expect(reporter).toBeInstanceOf(CSVReporter)
    })

    test('creates reporter with no options', () => {
      const reporter = createCSVReporter({})
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('csv')
    })

    test('returned reporter has format method', () => {
      const reporter = createCSVReporter({})
      expect(typeof reporter.format).toBe('function')
    })

    test('returned reporter has report method', () => {
      const reporter = createCSVReporter({})
      expect(typeof reporter.report).toBe('function')
    })

    test('returned reporter has name property', () => {
      const reporter = createCSVReporter({})
      expect(reporter.name).toBe('csv')
    })
  })

  describe('format - endLine and endColumn', () => {
    test('includes both endLine and endColumn when provided', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endLine: 25, endColumn: 40 })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('25')
      expect(formatted).toContain('40')
    })

    test('includes endLine but not endColumn', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endLine: 25, endColumn: undefined })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[6]).toBe('25')
      expect(parts[7]).toBe('')
    })

    test('includes endColumn but not endLine', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ endLine: undefined, endColumn: 40 })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[6]).toBe('')
      expect(parts[7]).toBe('40')
    })

    test('endLine equals line for single-line violation', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ line: 10, endLine: 10, column: 1, endColumn: 20 })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[1]).toBe('10')
      expect(parts[6]).toBe('10')
    })
  })

  describe('format - source field', () => {
    test('includes source when provided', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: 'const x = 1' }))
      expect(formatted).toContain('const x = 1')
    })

    test('omits source when undefined', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: undefined }))
      const parts = formatted.split(',')
      expect(parts[8]).toBe('')
    })

    test('handles empty source string', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: '' }))
      const parts = formatted.split(',')
      expect(parts[8]).toBe('')
    })

    test('escapes source with commas', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: 'let a, b, c' }))
      expect(formatted).toContain('"let a, b, c"')
    })

    test('escapes source with quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ source: 'console.log("hello")' }))
      expect(formatted).toContain('"console.log(""hello"")"')
    })
  })

  describe('format - suggestion field', () => {
    test('includes suggestion when provided', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'Use const instead' }))
      expect(formatted).toContain('Use const instead')
    })

    test('omits suggestion when undefined', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: undefined }))
      const parts = formatted.split(',')
      expect(parts[9]).toBe('')
    })

    test('handles empty suggestion string', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: '' }))
      const parts = formatted.split(',')
      expect(parts[9]).toBe('')
    })

    test('escapes suggestion with commas', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'fix a, then b' }))
      expect(formatted).toContain('"fix a, then b"')
    })

    test('escapes suggestion with newlines', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'step 1\nstep 2' }))
      expect(formatted).toContain('"step 1\nstep 2"')
    })

    test('escapes suggestion with quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ suggestion: 'use "strict mode"' }))
      expect(formatted).toContain('"use ""strict mode"""')
    })
  })

  describe('format - complete violation with all fields', () => {
    test('formats violation with all optional fields populated', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: '/src/utils.ts',
        line: 10,
        column: 5,
        severity: 'warning',
        ruleId: 'prefer-const',
        message: 'Use const instead of let',
        endLine: 10,
        endColumn: 20,
        source: 'let x = 1',
        suggestion: 'Replace with const',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('/src/utils.ts')
      expect(formatted).toContain('warning')
      expect(formatted).toContain('prefer-const')
      expect(formatted).toContain('Use const instead of let')
      expect(formatted).toContain('10')
      expect(formatted).toContain('5')
      expect(formatted).toContain('20')
      expect(formatted).toContain('let x = 1')
      expect(formatted).toContain('Replace with const')
    })

    test('formats minimal violation with no optional fields', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: 'a.ts',
        line: 1,
        column: 1,
        severity: 'error',
        ruleId: 'r',
        message: 'm',
      })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[0]).toBe('a.ts')
      expect(parts[1]).toBe('1')
      expect(parts[2]).toBe('1')
      expect(parts[3]).toBe('error')
      expect(parts[4]).toBe('r')
      expect(parts[5]).toBe('m')
      expect(parts[6]).toBe('')
      expect(parts[7]).toBe('')
      expect(parts[8]).toBe('')
      expect(parts[9]).toBe('')
    })
  })

  describe('format - field order', () => {
    test('field order matches header order', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: 'A',
        line: 1,
        column: 2,
        severity: 'error',
        ruleId: 'B',
        message: 'C',
        endLine: 3,
        endColumn: 4,
        source: 'D',
        suggestion: 'E',
      })
      const formatted = reporter.format(violation)
      const parts = formatted.split(',')
      expect(parts[0]).toBe('A')
      expect(parts[1]).toBe('1')
      expect(parts[2]).toBe('2')
      expect(parts[3]).toBe('error')
      expect(parts[4]).toBe('B')
      expect(parts[5]).toBe('C')
      expect(parts[6]).toBe('3')
      expect(parts[7]).toBe('4')
      expect(parts[8]).toBe('D')
      expect(parts[9]).toBe('E')
    })
  })

  describe('format - double quote edge cases', () => {
    test('handles field starting with double quote', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '"start' }))
      expect(formatted).toContain('"""start"')
    })

    test('handles field ending with double quote', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'end"' }))
      expect(formatted).toContain('"end"""')
    })

    test('handles field with only double quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '""""' }))
      expect(formatted).toContain('""""""""')
    })

    test('handles consecutive double quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a""b' }))
      expect(formatted).toContain('"a""""b"')
    })
  })

  describe('format - newline edge cases', () => {
    test('handles field starting with newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '\nstart' }))
      expect(formatted).toContain('"\nstart"')
    })

    test('handles field ending with newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'end\n' }))
      expect(formatted).toContain('"end\n"')
    })

    test('handles field with only newline', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: '\n' }))
      expect(formatted).toContain('"\n"')
    })

    test('handles multiple newlines', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a\n\n\nb' }))
      expect(formatted).toContain('"a\n\n\nb"')
    })
  })

  describe('format - comma edge cases', () => {
    test('handles field starting with comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: ',start' }))
      expect(formatted).toContain('",start"')
    })

    test('handles field ending with comma', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'end,' }))
      expect(formatted).toContain('"end,"')
    })

    test('handles field with only commas', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: ',,,' }))
      expect(formatted).toContain('",,,"')
    })

    test('handles multiple commas', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a,b,c,d' }))
      expect(formatted).toContain('"a,b,c,d"')
    })
  })

  describe('report - output structure', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('output starts with header', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output.startsWith('file,line,column')).toBe(true)
    })

    test('output has violation rows after header', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation({ message: 'test' })]))
      const output = consoleSpy.mock.calls[0][0]
      const lines = output.split('\n')
      expect(lines[0]).toContain('file')
      expect(lines[1]).toContain('/src/test.ts')
    })

    test('output has blank line before summary', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('\n\n# Summary')
    })

    test('output structure: header + violations + blank + summary', () => {
      const reporter = new CSVReporter({})
      const v = createMockViolation({ message: 'MyError' })
      reporter.report(createMockResult([v]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain(
        'file,line,column,severity,rule,message,end_line,end_column,source,suggestion',
      )
      expect(output).toContain('MyError')
      expect(output).toContain('# Summary')
      expect(output).toContain('# Timestamp:')
    })

    test('each violation is on its own line', () => {
      const reporter = new CSVReporter({})
      const v1 = createMockViolation({ filePath: '/a.ts', message: 'E1' })
      const v2 = createMockViolation({ filePath: '/b.ts', message: 'E2' })
      const result: AnalysisResult = {
        files: [
          {
            filePath: '/a.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [v1],
          },
          {
            filePath: '/b.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [v2],
          },
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 4,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      const lines = output.split('\n')
      const dataLines = lines.filter((l: string) => !l.startsWith('#') && l.trim().length > 0)
      expect(dataLines.length).toBe(3)
    })
  })

  describe('report - multiple files with violations', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('handles file with zero violations', () => {
      const reporter = new CSVReporter({})
      const result: AnalysisResult = {
        files: [
          {
            filePath: '/src/clean.ts',
            stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
            violations: [],
          },
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 2,
        },
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      const lines = output.split('\n')
      const dataLines = lines.filter((l: string) => !l.startsWith('#') && l.trim().length > 0)
      expect(dataLines.length).toBe(1)
    })

    test('mixed severity violations', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'error', message: 'E' }),
        createMockViolation({ severity: 'warning', message: 'W' }),
        createMockViolation({ severity: 'info', message: 'I' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain(',error,')
      expect(output).toContain(',warning,')
      expect(output).toContain(',info,')
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 1')
      expect(output).toContain('# Info: 1')
    })

    test('all errors', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'error', message: 'E1' }),
        createMockViolation({ severity: 'error', message: 'E2' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 2')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
    })

    test('all warnings', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'warning', message: 'W1' }),
        createMockViolation({ severity: 'warning', message: 'W2' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 0')
      expect(output).toContain('# Warnings: 2')
      expect(output).toContain('# Info: 0')
    })

    test('all info', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'info', message: 'I1' }),
        createMockViolation({ severity: 'info', message: 'I2' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 0')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 2')
    })
  })

  describe('format - escaping across different fields simultaneously', () => {
    test('filePath and message both have commas', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({
          filePath: '/src/my,file.ts',
          message: 'error, here',
        }),
      )
      expect(formatted).toContain('"/src/my,file.ts"')
      expect(formatted).toContain('"error, here"')
    })

    test('ruleId and message both have quotes', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({
          ruleId: 'rule"id',
          message: 'msg "val"',
        }),
      )
      expect(formatted).toContain('"rule""id"')
      expect(formatted).toContain('"msg ""val"""')
    })

    test('source has commas and suggestion has newlines', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({
          source: 'a, b, c',
          suggestion: 'step1\nstep2',
        }),
      )
      expect(formatted).toContain('"a, b, c"')
      expect(formatted).toContain('"step1\nstep2"')
    })

    test('all special characters in different fields', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(
        createMockViolation({
          filePath: '/path,file.ts',
          ruleId: 'rule"id',
          message: 'msg,with\nbreak',
          source: 'a\nb',
          suggestion: 'fix "this"',
        }),
      )
      expect(formatted).toContain('"/path,file.ts"')
      expect(formatted).toContain('"rule""id"')
      expect(formatted).toContain('"msg,with\nbreak"')
      expect(formatted).toContain('"a\nb"')
      expect(formatted).toContain('"fix ""this"""')
    })
  })

  describe('format - line breaks within fields', () => {
    test('preserves LF in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a\nb' }))
      expect(formatted).toContain('"a\nb"')
    })

    test('preserves CR in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a\rb' }))
      expect(formatted).toContain('"a\rb"')
    })

    test('preserves CRLF in message', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a\r\nb' }))
      expect(formatted).toContain('"a\r\nb"')
    })

    test('preserves mixed line endings', () => {
      const reporter = new CSVReporter({})
      const formatted = reporter.format(createMockViolation({ message: 'a\nb\rc\r\nd' }))
      expect(formatted).toContain('"a\nb\rc\r\nd"')
    })
  })

  describe('format - repeated calls produce consistent results', () => {
    test('same violation produces same output', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({ message: 'consistent' })
      const result1 = reporter.format(violation)
      const result2 = reporter.format(violation)
      expect(result1).toBe(result2)
    })

    test('different violations produce different output', () => {
      const reporter = new CSVReporter({})
      const v1 = createMockViolation({ message: 'first' })
      const v2 = createMockViolation({ message: 'second' })
      expect(reporter.format(v1)).not.toBe(reporter.format(v2))
    })
  })

  describe('format - output is valid CSV', () => {
    test('simple violation has exactly 10 comma-separated fields', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: 'simple.ts',
        line: 1,
        column: 1,
        severity: 'error',
        ruleId: 'rule',
        message: 'msg',
      })
      const formatted = reporter.format(violation)
      expect(formatted.split(',').length).toBe(10)
    })

    test('violation with quoted fields maintains correct field count', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        filePath: 'a.ts',
        line: 1,
        column: 1,
        severity: 'error',
        ruleId: 'rule',
        message: 'msg, with comma',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('"msg, with comma"')
    })
  })

  describe('report - stdout output', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('calls stdout.write once', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('passes string to stdout.write', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const arg = consoleSpy.mock.calls[0][0]
      expect(typeof arg).toBe('string')
    })

    test('output includes trailing newline via stdout', () => {
      const reporter = new CSVReporter({})
      reporter.report(createMockResult([createMockViolation()]))
      const output = consoleSpy.mock.calls[0][0]
      expect(output.endsWith('\n')).toBe(true)
    })
  })
})
