import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SARIFReporter } from '../../../src/reporters/sarif-reporter.js'
import type { AnalysisResult, FileAnalysisResult, Violation } from '../../../src/reporters/types.js'

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 5,
    filePath: 'test.ts',
    line: 10,
    message: 'Test violation',
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function createMockFileResult(filePath: string, violations: Violation[] = []): FileAnalysisResult {
  return {
    filePath,
    stats: { analysisTime: 20, parseTime: 10, totalTime: 30 },
    violations,
  }
}

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 100,
      warningCount: 0,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function getReportOutput(consoleSpy: ReturnType<typeof vi.spyOn>): Record<string, unknown> {
  const raw = consoleSpy.mock.calls[0][0] as string
  return JSON.parse(raw.replace(/\n$/, ''))
}

describe('SARIFReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new SARIFReporter()
      expect(reporter.name).toBe('sarif')
    })

    test('should accept pretty option', () => {
      const reporter = new SARIFReporter({ pretty: true })
      expect(reporter.name).toBe('sarif')
    })

    test('should accept outputPath option', () => {
      const reporter = new SARIFReporter({ outputPath: '/tmp/sarif.json' })
      expect(reporter.name).toBe('sarif')
    })

    test('should accept empty options object', () => {
      const reporter = new SARIFReporter({})
      expect(reporter.name).toBe('sarif')
    })

    test('should accept combined pretty and outputPath options', () => {
      const reporter = new SARIFReporter({ pretty: true, outputPath: '/tmp/out.json' })
      expect(reporter.name).toBe('sarif')
    })

    test('should have readonly name property', () => {
      const reporter = new SARIFReporter()
      expect(reporter.name).toBe('sarif')
    })

    test('should default pretty to false', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw).not.toContain('\n  ')
    })

    test('should produce indented output when pretty is true', () => {
      const reporter = new SARIFReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw).toContain('\n  ')
    })
  })

  describe('format', () => {
    test('should format violation as JSON string', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.ruleId).toBe('test-rule')
      expect(parsed.level).toBe('error')
    })

    test('should map severity correctly', () => {
      const reporter = new SARIFReporter()

      const errorOutput = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(errorOutput.level).toBe('error')

      const warningOutput = JSON.parse(
        reporter.format(createMockViolation({ severity: 'warning' })),
      )
      expect(warningOutput.level).toBe('warning')

      const infoOutput = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(infoOutput.level).toBe('note')
    })

    test('should include location', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({ filePath: 'src/app.ts', line: 42 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('src/app.ts')
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(42)
    })

    test('should include fixes when suggestion provided', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({ suggestion: 'Fix suggestion' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.fixes).toBeDefined()
      expect(parsed.fixes).toHaveLength(1)
    })

    test('should produce valid JSON', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should not include fixes when no suggestion', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.fixes).toBeUndefined()
    })

    test('should map error severity to error level', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.level).toBe('error')
    })

    test('should map warning severity to warning level', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'warning' })))
      expect(parsed.level).toBe('warning')
    })

    test('should map info severity to note level', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(parsed.level).toBe('note')
    })

    test('should include ruleId in output', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'my-custom-rule' })))
      expect(parsed.ruleId).toBe('my-custom-rule')
    })

    test('should include message object with text', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Something is wrong' })),
      )
      expect(parsed.message).toEqual({ text: 'Something is wrong' })
    })

    test('should include locations array', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(Array.isArray(parsed.locations)).toBe(true)
      expect(parsed.locations).toHaveLength(1)
    })

    test('should include physicalLocation in location', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(parsed.locations[0].physicalLocation).toBeDefined()
    })

    test('should include artifactLocation with uri', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'src/utils/helpers.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('src/utils/helpers.ts')
    })

    test('should include region with startLine', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 99 })))
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(99)
    })

    test('should include region with startColumn', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 15 })))
      expect(parsed.locations[0].physicalLocation.region.startColumn).toBe(15)
    })

    test('should include endLine when provided', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ endLine: 20 })))
      expect(parsed.locations[0].physicalLocation.region.endLine).toBe(20)
    })

    test('should include endColumn when provided', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ endColumn: 30 })))
      expect(parsed.locations[0].physicalLocation.region.endColumn).toBe(30)
    })

    test('should not include endLine when not provided', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(parsed.locations[0].physicalLocation.region.endLine).toBeUndefined()
    })

    test('should not include endColumn when not provided', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(parsed.locations[0].physicalLocation.region.endColumn).toBeUndefined()
    })

    test('should include both endLine and endColumn when both provided', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ endLine: 25, endColumn: 40 })),
      )
      expect(parsed.locations[0].physicalLocation.region.endLine).toBe(25)
      expect(parsed.locations[0].physicalLocation.region.endColumn).toBe(40)
    })
  })

  describe('format - fixes', () => {
    test('should produce fixes array with one element', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: 'Use const' })))
      expect(parsed.fixes).toHaveLength(1)
    })

    test('should include artifactChanges in fix', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: 'Use const' })))
      expect(parsed.fixes[0].artifactChanges).toBeDefined()
      expect(Array.isArray(parsed.fixes[0].artifactChanges)).toBe(true)
    })

    test('should include artifactLocation in artifactChange', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'foo.ts', suggestion: 'Fix it' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].artifactLocation.uri).toBe('foo.ts')
    })

    test('should include replacements array in artifactChange', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: 'Fix' })))
      expect(parsed.fixes[0].artifactChanges[0].replacements).toBeDefined()
      expect(Array.isArray(parsed.fixes[0].artifactChanges[0].replacements)).toBe(true)
    })

    test('should include deletedRegion in replacement', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({ line: 5, column: 10, suggestion: 'fix' })
      const parsed = JSON.parse(reporter.format(violation))
      const replacement = parsed.fixes[0].artifactChanges[0].replacements[0]
      expect(replacement.deletedRegion.startLine).toBe(5)
      expect(replacement.deletedRegion.startColumn).toBe(10)
    })

    test('should include insertedContent with suggestion text', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: 'Use let instead' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        'Use let instead',
      )
    })

    test('should include description with text Suggested fix', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: 'something' })))
      expect(parsed.fixes[0].description).toEqual({ text: 'Suggested fix' })
    })

    test('should not include fixes for empty string suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: '' })))
      expect(parsed.fixes).toBeUndefined()
    })

    test('should handle long suggestion text', () => {
      const reporter = new SARIFReporter()
      const longText = 'a'.repeat(5000)
      const parsed = JSON.parse(reporter.format(createMockViolation({ suggestion: longText })))
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(longText)
    })
  })

  describe('format - file paths', () => {
    test('should preserve relative file path', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: './src/index.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('./src/index.ts')
    })

    test('should preserve absolute file path', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: '/home/user/project/src/app.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe(
        '/home/user/project/src/app.ts',
      )
    })

    test('should preserve Windows-style file path', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'C:\\Projects\\app\\src\\main.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe(
        'C:\\Projects\\app\\src\\main.ts',
      )
    })

    test('should preserve file path with spaces', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'src/my components/Button.tsx' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/my components/Button.tsx',
      )
    })

    test('should preserve URI-encoded file path', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'src/%20space.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('src/%20space.ts')
    })

    test('should handle deeply nested file path', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ filePath: 'a/b/c/d/e/f/g/h/i/j/k/file.ts' })),
      )
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe(
        'a/b/c/d/e/f/g/h/i/j/k/file.ts',
      )
    })

    test('should handle single character file name', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'a.ts' })))
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('a.ts')
    })
  })

  describe('format - line and column values', () => {
    test('should handle line 1', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 1 })))
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(1)
    })

    test('should handle column 1', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 1 })))
      expect(parsed.locations[0].physicalLocation.region.startColumn).toBe(1)
    })

    test('should handle large line number', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 100000 })))
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(100000)
    })

    test('should handle large column number', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 99999 })))
      expect(parsed.locations[0].physicalLocation.region.startColumn).toBe(99999)
    })

    test('should handle endLine greater than startLine', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 10, endLine: 15 })))
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(10)
      expect(parsed.locations[0].physicalLocation.region.endLine).toBe(15)
    })

    test('should handle endColumn greater than startColumn', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 5, endColumn: 20 })))
      expect(parsed.locations[0].physicalLocation.region.startColumn).toBe(5)
      expect(parsed.locations[0].physicalLocation.region.endColumn).toBe(20)
    })
  })

  describe('format - message content', () => {
    test('should preserve message text exactly', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Exact message here' })),
      )
      expect(parsed.message.text).toBe('Exact message here')
    })

    test('should handle message with special characters', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Use <T> instead of "any"' })),
      )
      expect(parsed.message.text).toBe('Use <T> instead of "any"')
    })

    test('should handle message with unicode', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Avoid émojis 🎉 in code' })),
      )
      expect(parsed.message.text).toBe('Avoid émojis 🎉 in code')
    })

    test('should handle empty message', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: '' })))
      expect(parsed.message.text).toBe('')
    })

    test('should handle multiline message', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Line 1\nLine 2\nLine 3' })),
      )
      expect(parsed.message.text).toBe('Line 1\nLine 2\nLine 3')
    })

    test('should handle message with tabs', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Column1\tColumn2\tColumn3' })),
      )
      expect(parsed.message.text).toBe('Column1\tColumn2\tColumn3')
    })

    test('should handle message with backslashes', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Path: C:\\Users\\dev' })),
      )
      expect(parsed.message.text).toBe('Path: C:\\Users\\dev')
    })

    test('should handle message with single quotes', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: "Don't use 'any'" })),
      )
      expect(parsed.message.text).toBe("Don't use 'any'")
    })

    test('should handle very long message', () => {
      const reporter = new SARIFReporter()
      const longMsg = 'x'.repeat(10000)
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: longMsg })))
      expect(parsed.message.text).toBe(longMsg)
    })

    test('should handle message with JSON-like content', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: '{"key": "value"}' })),
      )
      expect(parsed.message.text).toBe('{"key": "value"}')
    })

    test('should handle message with HTML entities', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Use &amp; instead of & in HTML' })),
      )
      expect(parsed.message.text).toBe('Use &amp; instead of & in HTML')
    })

    test('should handle message with CRLF line endings', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Line 1\r\nLine 2' })),
      )
      expect(parsed.message.text).toBe('Line 1\r\nLine 2')
    })
  })

  describe('format - ruleId values', () => {
    test('should preserve hyphenated rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ ruleId: 'no-circular-deps' })),
      )
      expect(parsed.ruleId).toBe('no-circular-deps')
    })

    test('should preserve namespaced rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ ruleId: '@typescript-eslint/no-explicit-any' })),
      )
      expect(parsed.ruleId).toBe('@typescript-eslint/no-explicit-any')
    })

    test('should preserve camelCase rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'preferConst' })))
      expect(parsed.ruleId).toBe('preferConst')
    })

    test('should preserve snake_case rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'max_params' })))
      expect(parsed.ruleId).toBe('max_params')
    })

    test('should preserve numeric suffix rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'rule-123' })))
      expect(parsed.ruleId).toBe('rule-123')
    })

    test('should preserve single character rule ID', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'x' })))
      expect(parsed.ruleId).toBe('x')
    })
  })

  describe('format - round-trip integrity', () => {
    test('should survive JSON parse and stringify round-trip', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({
        column: 10,
        filePath: 'src/app.ts',
        line: 25,
        message: 'Test',
        ruleId: 'test-rule',
        severity: 'error',
      })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      const reStringified = JSON.stringify(parsed)
      const reparsed = JSON.parse(reStringified)
      expect(reparsed).toEqual(parsed)
    })

    test('should produce consistent output for same violation', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation()
      const output1 = reporter.format(violation)
      const output2 = reporter.format(violation)
      expect(output1).toBe(output2)
    })

    test('should produce different output for different violations', () => {
      const reporter = new SARIFReporter()
      const v1 = createMockViolation({ message: 'First' })
      const v2 = createMockViolation({ message: 'Second' })
      expect(reporter.format(v1)).not.toBe(reporter.format(v2))
    })
  })

  describe('report', () => {
    test('should output SARIF format', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.$schema).toContain('sarif-schema-2.1.0')
      expect(output.version).toBe('2.1.0')
      expect(output.runs).toHaveLength(1)
    })

    test('should include tool information', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.runs[0].tool.driver.name).toBe('CodeForge')
    })

    test('should output to stdout when no outputPath', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('should not write to stdout when outputPath is set', () => {
      const reporter = new SARIFReporter({ outputPath: '/tmp/out.json' })
      const results = createMockAnalysisResult()
      reporter.report(results)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should append newline to stdout output', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw.endsWith('\n')).toBe(true)
    })

    test('should output valid JSON', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    test('should output compact JSON when pretty is false', () => {
      const reporter = new SARIFReporter({ pretty: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(raw).not.toContain('\n ')
    })

    test('should output pretty JSON when pretty is true', () => {
      const reporter = new SARIFReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw).toContain('  "version"')
    })
  })

  describe('report - SARIF log structure', () => {
    test('should include $schema property', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.$schema).toBe(
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      )
    })

    test('should set version to 2.1.0', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.version).toBe('2.1.0')
    })

    test('should have runs as array', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(Array.isArray(output.runs)).toBe(true)
    })

    test('should have exactly one run', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs).toHaveLength(1)
    })

    test('should have results array in run', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(Array.isArray(output.runs[0].results)).toBe(true)
    })

    test('should have tool object in run', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool).toBeDefined()
      expect(typeof output.runs[0].tool).toBe('object')
    })

    test('should have driver in tool', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver).toBeDefined()
    })

    test('should produce empty results for empty files array', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toEqual([])
    })

    test('should produce empty results for files with no violations', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('clean.ts', [])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toEqual([])
    })
  })

  describe('report - tool driver', () => {
    test('should set driver name to CodeForge', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.name).toBe('CodeForge')
    })

    test('should set default version to 0.1.0', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('0.1.0')
    })

    test('should include informationUri', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.informationUri).toBe(
        'https://github.com/codeforge-dev/codeforge',
      )
    })

    test('should include rules array', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(Array.isArray(output.runs[0].tool.driver.rules)).toBe(true)
    })

    test('should have empty rules when no violations', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toEqual([])
    })

    test('should update version from results.version', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '2.5.0' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('2.5.0')
    })

    test('should not update version when results has no version', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('0.1.0')
    })

    test('should not update version when results version is empty string', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('0.1.0')
    })

    test('should use prerelease version string', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '3.0.0-alpha.1' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('3.0.0-alpha.1')
    })
  })

  describe('report - rules deduplication', () => {
    test('should add one rule for unique rule ID', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'rule-a' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toHaveLength(1)
      expect(output.runs[0].tool.driver.rules[0].id).toBe('rule-a')
    })

    test('should deduplicate rules with same ID', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ ruleId: 'no-console' }),
              createMockViolation({ ruleId: 'no-console' }),
              createMockViolation({ ruleId: 'no-console' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toHaveLength(1)
    })

    test('should add separate rules for different IDs', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ ruleId: 'rule-a' }),
              createMockViolation({ ruleId: 'rule-b' }),
              createMockViolation({ ruleId: 'rule-c' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toHaveLength(3)
    })

    test('should deduplicate across multiple files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: 'shared-rule' })]),
            createMockFileResult('b.ts', [createMockViolation({ ruleId: 'shared-rule' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toHaveLength(1)
    })

    test('should set rule id to match violation ruleId', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'my-rule' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules[0].id).toBe('my-rule')
    })

    test('should set shortDescription for rule', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'max-lines' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules[0].shortDescription).toEqual({
        text: 'Rule: max-lines',
      })
    })

    test('should keep first occurrence when duplicate across files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: 'dup' })]),
            createMockFileResult('b.ts', [createMockViolation({ ruleId: 'dup' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const rules = output.runs[0].tool.driver.rules
      expect(rules).toHaveLength(1)
      expect(rules[0].id).toBe('dup')
    })
  })

  describe('report - results content', () => {
    test('should produce one result per violation', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation(),
              createMockViolation(),
              createMockViolation(),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(3)
    })

    test('should produce correct total results across files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation(), createMockViolation()]),
            createMockFileResult('b.ts', [
              createMockViolation(),
              createMockViolation(),
              createMockViolation(),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(5)
    })

    test('should include violation ruleId in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'specific-rule' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].ruleId).toBe('specific-rule')
    })

    test('should include violation message in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ message: 'Expected semicolon' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('Expected semicolon')
    })

    test('should map error severity in result level', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ severity: 'error' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].level).toBe('error')
    })

    test('should map warning severity in result level', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ severity: 'warning' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].level).toBe('warning')
    })

    test('should map info severity to note level in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ severity: 'info' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].level).toBe('note')
    })

    test('should include location with file path in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/main.ts', [createMockViolation({ filePath: 'src/main.ts' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/main.ts',
      )
    })

    test('should include region with line and column in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ line: 42, column: 8 })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const region = output.runs[0].results[0].locations[0].physicalLocation.region
      expect(region.startLine).toBe(42)
      expect(region.startColumn).toBe(8)
    })

    test('should include fixes in result when violation has suggestion', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ suggestion: 'Replace with const' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes).toBeDefined()
      expect(output.runs[0].results[0].fixes).toHaveLength(1)
    })

    test('should not include fixes when violation has no suggestion', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes).toBeUndefined()
    })

    test('should handle mixed severities across results', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ severity: 'error' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'info' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].level).toBe('error')
      expect(output.runs[0].results[1].level).toBe('warning')
      expect(output.runs[0].results[2].level).toBe('note')
    })

    test('should handle endLine and endColumn in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ line: 5, column: 3, endLine: 10, endColumn: 15 }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const region = output.runs[0].results[0].locations[0].physicalLocation.region
      expect(region.startLine).toBe(5)
      expect(region.startColumn).toBe(3)
      expect(region.endLine).toBe(10)
      expect(region.endColumn).toBe(15)
    })
  })

  describe('report - multiple files', () => {
    test('should aggregate violations from multiple files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: 'r1' })]),
            createMockFileResult('b.ts', [createMockViolation({ ruleId: 'r2' })]),
            createMockFileResult('c.ts', [createMockViolation({ ruleId: 'r3' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(3)
    })

    test('should preserve file paths across files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/a.ts', [createMockViolation({ filePath: 'src/a.ts' })]),
            createMockFileResult('lib/b.ts', [createMockViolation({ filePath: 'lib/b.ts' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/a.ts',
      )
      expect(output.runs[0].results[1].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'lib/b.ts',
      )
    })

    test('should handle file with zero violations', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('clean.ts', []),
            createMockFileResult('dirty.ts', [createMockViolation()]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(1)
    })

    test('should handle many files each with one violation', () => {
      const reporter = new SARIFReporter()
      const files = Array.from({ length: 50 }, (_, i) =>
        createMockFileResult(`file${i}.ts`, [
          createMockViolation({ filePath: `file${i}.ts`, ruleId: `rule-${i}` }),
        ]),
      )
      reporter.report(createMockAnalysisResult({ files }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(50)
    })
  })

  describe('report - edge cases', () => {
    test('should handle results with undefined version', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult()
      results.version = undefined
      reporter.report(results)
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('0.1.0')
    })

    test('should handle violation with line 0', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ line: 0 })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBe(0)
    })

    test('should handle violation with column 0', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ column: 0 })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.region.startColumn).toBe(0)
    })

    test('should handle empty files array', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ files: [] }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toEqual([])
      expect(output.runs[0].tool.driver.rules).toEqual([])
    })

    test('should handle multiple violations from same rule across files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ ruleId: 'no-console', message: 'Msg 1' }),
            ]),
            createMockFileResult('b.ts', [
              createMockViolation({ ruleId: 'no-console', message: 'Msg 2' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(2)
      expect(output.runs[0].results[0].message.text).toBe('Msg 1')
      expect(output.runs[0].results[1].message.text).toBe('Msg 2')
    })

    test('should handle violation with special characters in filePath', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/[id].tsx', [
              createMockViolation({ filePath: 'src/[id].tsx' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/[id].tsx',
      )
    })

    test('should handle violation with unicode filePath', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/日本語.ts', [
              createMockViolation({ filePath: 'src/日本語.ts' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/日本語.ts',
      )
    })

    test('should handle violation with emoji in message', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ message: '🚨 Critical error found!' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('🚨 Critical error found!')
    })

    test('should handle version persistence across reports', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '5.0.0' }))
      const output1 = getReportOutput(consoleSpy)
      expect(output1.runs[0].tool.driver.version).toBe('5.0.0')
    })

    test('should handle single file single violation', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(1)
      expect(output.runs[0].tool.driver.rules).toHaveLength(1)
    })

    test('should handle file with only clean files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', []), createMockFileResult('b.ts', [])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toEqual([])
      expect(output.runs[0].tool.driver.rules).toEqual([])
    })
  })

  describe('report - special characters in violations', () => {
    test('should handle message with newlines', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ message: 'Line1\nLine2\nLine3' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('Line1\nLine2\nLine3')
    })

    test('should handle message with double quotes', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ message: 'Use "strict" mode' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('Use "strict" mode')
    })

    test('should handle message with angle brackets', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ message: 'Expected <T> but got any' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('Expected <T> but got any')
    })

    test('should handle message with ampersand', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ message: 'A & B must be separated' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('A & B must be separated')
    })

    test('should handle suggestion with special characters', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ suggestion: 'Use <T extends string>' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(
        output.runs[0].results[0].fixes[0].artifactChanges[0].replacements[0].insertedContent.text,
      ).toBe('Use <T extends string>')
    })

    test('should handle filePath with parentheses', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/utils (legacy)/helper.ts', [
              createMockViolation({ filePath: 'src/utils (legacy)/helper.ts' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        'src/utils (legacy)/helper.ts',
      )
    })

    test('should handle ruleId with special characters', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: 'rule/slash:colons' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].ruleId).toBe('rule/slash:colons')
      expect(output.runs[0].tool.driver.rules[0].id).toBe('rule/slash:colons')
    })
  })

  describe('report - large data sets', () => {
    test('should handle 100 violations', () => {
      const reporter = new SARIFReporter()
      const violations = Array.from({ length: 100 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}`, message: `Violation ${i}` }),
      )
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('big.ts', violations)],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(100)
    })

    test('should handle 100 unique rules', () => {
      const reporter = new SARIFReporter()
      const violations = Array.from({ length: 100 }, (_, i) =>
        createMockViolation({ ruleId: `unique-rule-${i}` }),
      )
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('big.ts', violations)],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules).toHaveLength(100)
    })

    test('should handle 50 files each with 10 violations', () => {
      const reporter = new SARIFReporter()
      const files = Array.from({ length: 50 }, (_, fileIdx) =>
        createMockFileResult(
          `file${fileIdx}.ts`,
          Array.from({ length: 10 }, (_, vIdx) =>
            createMockViolation({
              filePath: `file${fileIdx}.ts`,
              ruleId: `rule-${fileIdx}-${vIdx}`,
              line: vIdx + 1,
              column: vIdx + 1,
            }),
          ),
        ),
      )
      reporter.report(createMockAnalysisResult({ files }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results).toHaveLength(500)
    })

    test('should handle violations with all fields populated', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({
                column: 1,
                endColumn: 20,
                endLine: 15,
                filePath: 'src/deep/nested/file.ts',
                line: 5,
                message: 'Complex violation with all fields',
                ruleId: 'complex-rule',
                severity: 'error',
                suggestion: 'Replace entire block with simplified version',
              }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const result = output.runs[0].results[0]
      expect(result.ruleId).toBe('complex-rule')
      expect(result.level).toBe('error')
      expect(result.message.text).toBe('Complex violation with all fields')
      expect(result.fixes).toHaveLength(1)
      const region = result.locations[0].physicalLocation.region
      expect(region.startLine).toBe(5)
      expect(region.startColumn).toBe(1)
      expect(region.endLine).toBe(15)
      expect(region.endColumn).toBe(20)
    })
  })

  describe('report - SARIF schema compliance', () => {
    test('should have correct $schema URL', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.$schema).toBe(
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      )
    })

    test('should have version string exactly 2.1.0', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.version).toBe('2.1.0')
      expect(typeof output.version).toBe('string')
    })

    test('should have only $schema, runs, and version at top level', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      const keys = Object.keys(output)
      expect(keys).toHaveLength(3)
      expect(keys).toContain('$schema')
      expect(keys).toContain('runs')
      expect(keys).toContain('version')
    })

    test('should have only results and tool in run', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      const runKeys = Object.keys(output.runs[0])
      expect(runKeys).toContain('results')
      expect(runKeys).toContain('tool')
    })

    test('should have only driver in tool', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      const toolKeys = Object.keys(output.runs[0].tool)
      expect(toolKeys).toEqual(['driver'])
    })

    test('should have required driver properties', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const driver = output.runs[0].tool.driver
      expect(driver.name).toBe('CodeForge')
      expect(driver.version).toBe('0.1.0')
      expect(driver.informationUri).toBeDefined()
      expect(driver.rules).toBeDefined()
    })

    test('should have required result properties', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const result = output.runs[0].results[0]
      expect(result.ruleId).toBeDefined()
      expect(result.level).toBeDefined()
      expect(result.message).toBeDefined()
      expect(result.locations).toBeDefined()
    })

    test('should have message with text property in result', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(typeof output.runs[0].results[0].message.text).toBe('string')
    })

    test('should have valid location structure', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const loc = output.runs[0].results[0].locations[0]
      expect(loc.physicalLocation).toBeDefined()
      expect(loc.physicalLocation.artifactLocation).toBeDefined()
      expect(loc.physicalLocation.artifactLocation.uri).toBeDefined()
      expect(loc.physicalLocation.region).toBeDefined()
      expect(loc.physicalLocation.region.startLine).toBeDefined()
      expect(loc.physicalLocation.region.startColumn).toBeDefined()
    })

    test('should have valid level values', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ severity: 'error' }),
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'info' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const validLevels = ['error', 'warning', 'note', 'none']
      for (const result of output.runs[0].results) {
        expect(validLevels).toContain(result.level)
      }
    })

    test('should have rule with id and shortDescription', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'test' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const rule = output.runs[0].tool.driver.rules[0]
      expect(rule.id).toBe('test')
      expect(rule.shortDescription).toBeDefined()
      expect(rule.shortDescription.text).toBe('Rule: test')
    })
  })

  describe('report - fixes in results', () => {
    test('should include fixes for violation with suggestion', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ suggestion: 'Fix it' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes).toHaveLength(1)
    })

    test('should include correct fix description', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ suggestion: 'Change to const' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes[0].description.text).toBe('Suggested fix')
    })

    test('should include artifactLocation in fix', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ filePath: 'a.ts', suggestion: 'x' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes[0].artifactChanges[0].artifactLocation.uri).toBe(
        'a.ts',
      )
    })

    test('should include deletedRegion in fix', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ line: 10, column: 5, suggestion: 'fix' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const del =
        output.runs[0].results[0].fixes[0].artifactChanges[0].replacements[0].deletedRegion
      expect(del.startLine).toBe(10)
      expect(del.startColumn).toBe(5)
    })

    test('should include insertedContent with suggestion', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ suggestion: 'Use strict mode' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const ins =
        output.runs[0].results[0].fixes[0].artifactChanges[0].replacements[0].insertedContent
      expect(ins.text).toBe('Use strict mode')
    })

    test('should handle mixed violations with and without suggestions', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ suggestion: 'Fix A' }),
              createMockViolation(),
              createMockViolation({ suggestion: 'Fix C' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].fixes).toBeDefined()
      expect(output.runs[0].results[1].fixes).toBeUndefined()
      expect(output.runs[0].results[2].fixes).toBeDefined()
    })
  })

  describe('report - report method output format', () => {
    test('should produce output that is valid JSON after stripping newline', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    test('should call stdout.write exactly once', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('should produce identical output for same input', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output1 = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      consoleSpy.mockClear()
      reporter.report(results)
      const output2 = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output1).toBe(output2)
    })
  })

  describe('format - various violation combinations', () => {
    test('should handle error with suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'error', suggestion: 'Fix the error' })),
      )
      expect(parsed.level).toBe('error')
      expect(parsed.fixes).toBeDefined()
    })

    test('should handle warning with suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(
          createMockViolation({ severity: 'warning', suggestion: 'Fix the warning' }),
        ),
      )
      expect(parsed.level).toBe('warning')
      expect(parsed.fixes).toBeDefined()
    })

    test('should handle info with suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'info', suggestion: 'Consider fixing' })),
      )
      expect(parsed.level).toBe('note')
      expect(parsed.fixes).toBeDefined()
    })

    test('should handle error without suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.level).toBe('error')
      expect(parsed.fixes).toBeUndefined()
    })

    test('should handle warning without suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'warning' })))
      expect(parsed.level).toBe('warning')
      expect(parsed.fixes).toBeUndefined()
    })

    test('should handle info without suggestion', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(parsed.level).toBe('note')
      expect(parsed.fixes).toBeUndefined()
    })

    test('should handle violation at line 1 column 1', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 1, column: 1 })))
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(1)
      expect(parsed.locations[0].physicalLocation.region.startColumn).toBe(1)
    })

    test('should handle violation with multiline range', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ line: 1, column: 1, endLine: 50, endColumn: 30 })),
      )
      const region = parsed.locations[0].physicalLocation.region
      expect(region.startLine).toBe(1)
      expect(region.startColumn).toBe(1)
      expect(region.endLine).toBe(50)
      expect(region.endColumn).toBe(30)
    })

    test('should handle violation with only endLine', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ endLine: 100 })))
      const region = parsed.locations[0].physicalLocation.region
      expect(region.endLine).toBe(100)
      expect(region.endColumn).toBeUndefined()
    })

    test('should handle violation with only endColumn', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ endColumn: 50 })))
      const region = parsed.locations[0].physicalLocation.region
      expect(region.endLine).toBeUndefined()
      expect(region.endColumn).toBe(50)
    })
  })

  describe('format - JSON output shape', () => {
    test('should have exactly ruleId, level, locations, message at minimum', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(parsed).toHaveProperty('ruleId')
      expect(parsed).toHaveProperty('level')
      expect(parsed).toHaveProperty('locations')
      expect(parsed).toHaveProperty('message')
    })

    test('should have fixes property only when suggestion is present', () => {
      const reporter = new SARIFReporter()
      const withoutSuggestion = JSON.parse(reporter.format(createMockViolation()))
      expect(withoutSuggestion).not.toHaveProperty('fixes')
      const withSuggestion = JSON.parse(reporter.format(createMockViolation({ suggestion: 'fix' })))
      expect(withSuggestion).toHaveProperty('fixes')
    })

    test('should have locations as array of length 1', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(parsed.locations).toHaveLength(1)
    })

    test('should have message as object with text property', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.message).toBe('object')
      expect(parsed.message).toHaveProperty('text')
    })

    test('should have level as string', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.level).toBe('string')
    })

    test('should have ruleId as string', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.ruleId).toBe('string')
    })
  })

  describe('report - consistent output', () => {
    test('should always have runs array even with no data', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(Array.isArray(output.runs)).toBe(true)
      expect(output.runs).toHaveLength(1)
    })

    test('should always produce a single run', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation()]),
            createMockFileResult('b.ts', [createMockViolation()]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs).toHaveLength(1)
    })

    test('should always have tool.driver with name CodeForge', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.name).toBe('CodeForge')
    })

    test('should always have correct informationUri', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.informationUri).toBe(
        'https://github.com/codeforge-dev/codeforge',
      )
    })

    test('should produce same JSON structure for empty and populated results', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const emptyOutput = getReportOutput(consoleSpy)
      consoleSpy.mockClear()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const populatedOutput = getReportOutput(consoleSpy)
      expect(Object.keys(emptyOutput)).toEqual(Object.keys(populatedOutput))
      expect(Object.keys(emptyOutput.runs[0])).toEqual(Object.keys(populatedOutput.runs[0]))
      expect(Object.keys(emptyOutput.runs[0].tool)).toEqual(
        Object.keys(populatedOutput.runs[0].tool),
      )
    })
  })

  describe('format - suggestion with special characters', () => {
    test('should handle suggestion with newlines', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: 'line1\nline2' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        'line1\nline2',
      )
    })

    test('should handle suggestion with quotes', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: 'Use "strict"' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        'Use "strict"',
      )
    })

    test('should handle suggestion with unicode', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: '日本語のコード' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        '日本語のコード',
      )
    })

    test('should handle suggestion with backslashes', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: 'path\\to\\file' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        'path\\to\\file',
      )
    })

    test('should handle suggestion with angle brackets', () => {
      const reporter = new SARIFReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ suggestion: '<T extends unknown>' })),
      )
      expect(parsed.fixes[0].artifactChanges[0].replacements[0].insertedContent.text).toBe(
        '<T extends unknown>',
      )
    })
  })

  describe('report - results order preservation', () => {
    test('should preserve file order in results', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ filePath: 'a.ts', message: 'first' }),
            ]),
            createMockFileResult('b.ts', [
              createMockViolation({ filePath: 'b.ts', message: 'second' }),
            ]),
            createMockFileResult('c.ts', [
              createMockViolation({ filePath: 'c.ts', message: 'third' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('first')
      expect(output.runs[0].results[1].message.text).toBe('second')
      expect(output.runs[0].results[2].message.text).toBe('third')
    })

    test('should preserve violation order within a file', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ message: 'v1' }),
              createMockViolation({ message: 'v2' }),
              createMockViolation({ message: 'v3' }),
              createMockViolation({ message: 'v4' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('v1')
      expect(output.runs[0].results[1].message.text).toBe('v2')
      expect(output.runs[0].results[2].message.text).toBe('v3')
      expect(output.runs[0].results[3].message.text).toBe('v4')
    })

    test('should interleave results from multiple files', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ filePath: 'a.ts', message: 'A1' }),
              createMockViolation({ filePath: 'a.ts', message: 'A2' }),
            ]),
            createMockFileResult('b.ts', [
              createMockViolation({ filePath: 'b.ts', message: 'B1' }),
            ]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].results[0].message.text).toBe('A1')
      expect(output.runs[0].results[1].message.text).toBe('A2')
      expect(output.runs[0].results[2].message.text).toBe('B1')
    })
  })

  describe('report - rule metadata', () => {
    test('should generate rule shortDescription with ruleId', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'my-rule' })])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const rule = output.runs[0].tool.driver.rules[0]
      expect(rule.shortDescription.text).toBe('Rule: my-rule')
    })

    test('should not include fullDescription in rule', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const rule = output.runs[0].tool.driver.rules[0]
      expect(rule.fullDescription).toBeUndefined()
    })

    test('should not include helpUri in rule', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
        }),
      )
      const output = getReportOutput(consoleSpy)
      const rule = output.runs[0].tool.driver.rules[0]
      expect(rule.helpUri).toBeUndefined()
    })

    test('should have rule id match violation ruleId exactly', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: '@ns/custom-rule-name' })]),
          ],
        }),
      )
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.rules[0].id).toBe('@ns/custom-rule-name')
    })
  })

  describe('report - version handling', () => {
    test('should default to 0.1.0 on first report', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('0.1.0')
    })

    test('should update version from results', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '3.2.1' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('3.2.1')
    })

    test('should retain version from previous report', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '2.0.0' }))
      consoleSpy.mockClear()
      reporter.report(createMockAnalysisResult())
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('2.0.0')
    })

    test('should update version when results provide different version', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '1.0.0' }))
      consoleSpy.mockClear()
      reporter.report(createMockAnalysisResult({ version: '2.0.0' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('2.0.0')
    })

    test('should handle semantic version with prerelease tag', () => {
      const reporter = new SARIFReporter()
      reporter.report(createMockAnalysisResult({ version: '4.0.0-beta.2+build.123' }))
      const output = getReportOutput(consoleSpy)
      expect(output.runs[0].tool.driver.version).toBe('4.0.0-beta.2+build.123')
    })
  })
})
