import { describe, test, expect } from 'vitest'
import { createViolation } from '../../../src/rules/types'
import type {
  RuleOptions,
  RuleDocs,
  RuleMeta,
  RuleDefinition,
  RuleContext,
  RuleSeverity,
  RuleConfig,
} from '../../../src/rules/types'
import {
  PluginError,
  PluginLoadError,
  RuleExecutionError,
  TransformExecutionError,
  HookExecutionError,
} from '../../../src/plugins/types'
import type {
  Severity as PluginSeverity,
  RuleType,
  RuleSchema,
  RuleMeta as PluginRuleMeta,
  Position as PluginPosition,
  Range as PluginRange,
  SourceLocation,
  ReportDescriptor,
  FixDescriptor,
  SuggestionDescriptor,
  RuleVisitor,
  RuleDefinition as PluginRuleDefinition,
  TransformContext,
  TransformFunction,
  TransformDefinition,
  HookContext,
  PluginHooks,
  Logger,
  PluginConfig,
  Plugin,
  PluginManifest,
  PluginContext,
  RuleContext as PluginRuleContext,
} from '../../../src/plugins/types'

describe('createViolation', () => {
  describe('with simple range format', () => {
    test('creates violation with { line, column } format', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test violation message',
        { line: 10, column: 5 },
        'test-rule',
      )

      expect(violation).toEqual({
        filePath: '/test/file.ts',
        message: 'Test violation message',
        ruleId: 'test-rule',
        severity: 'error',
        range: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 6 },
        },
        suggestion: undefined,
      })
    })

    test('normalizes simple range to start and end positions', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 5, column: 12 },
        'rule-1',
      )

      expect(violation.range.start).toEqual({ line: 5, column: 12 })
      expect(violation.range.end).toEqual({ line: 5, column: 13 })
    })

    test('handles zero column value', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.range.start.column).toBe(0)
      expect(violation.range.end.column).toBe(1)
    })

    test('handles large line and column values', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 9999, column: 1000 },
        'rule-1',
      )

      expect(violation.range.start.line).toBe(9999)
      expect(violation.range.start.column).toBe(1000)
      expect(violation.range.end.line).toBe(9999)
      expect(violation.range.end.column).toBe(1001)
    })
  })

  describe('with Range object format', () => {
    test('creates violation with { start, end } Range format', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test violation message',
        {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 15 },
        },
        'test-rule',
      )

      expect(violation).toEqual({
        filePath: '/test/file.ts',
        message: 'Test violation message',
        ruleId: 'test-rule',
        severity: 'error',
        range: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 15 },
        },
        suggestion: undefined,
      })
    })

    test('preserves Range object without modification', () => {
      const range = {
        start: { line: 3, column: 2 },
        end: { line: 5, column: 10 },
      }
      const violation = createViolation('/test/file.ts', 'Test', range, 'rule-1')

      expect(violation.range).toEqual(range)
    })

    test('handles multi-line Range object', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        {
          start: { line: 10, column: 0 },
          end: { line: 20, column: 50 },
        },
        'rule-1',
      )

      expect(violation.range.start.line).toBe(10)
      expect(violation.range.end.line).toBe(20)
    })
  })

  describe('severity levels', () => {
    test('defaults to "error" severity when not specified', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.severity).toBe('error')
    })

    test('creates violation with "error" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
      )

      expect(violation.severity).toBe('error')
    })

    test('creates violation with "warning" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'warning',
      )

      expect(violation.severity).toBe('warning')
    })

    test('creates violation with "info" severity', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'info',
      )

      expect(violation.severity).toBe('info')
    })
  })

  describe('suggestion parameter', () => {
    test('creates violation with suggestion', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        'Consider using const instead of let',
      )

      expect(violation.suggestion).toBe('Consider using const instead of let')
    })

    test('creates violation without suggestion when omitted', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.suggestion).toBeUndefined()
    })

    test('handles empty string suggestion', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        '',
      )

      expect(violation.suggestion).toBe('')
    })

    test('handles multiline suggestion text', () => {
      const suggestion = 'Line 1 suggestion\nLine 2 suggestion\nLine 3 suggestion'
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 1, column: 0 },
        'rule-1',
        'error',
        suggestion,
      )

      expect(violation.suggestion).toBe(suggestion)
    })
  })

  describe('required parameters', () => {
    test('includes filePath in violation', () => {
      const violation = createViolation(
        '/path/to/file.ts',
        'Test',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.filePath).toBe('/path/to/file.ts')
    })

    test('includes message in violation', () => {
      const violation = createViolation(
        '/test.ts',
        'Custom violation message',
        { line: 1, column: 0 },
        'rule-1',
      )

      expect(violation.message).toBe('Custom violation message')
    })

    test('includes ruleId in violation', () => {
      const violation = createViolation(
        '/test.ts',
        'Test',
        { line: 1, column: 0 },
        'custom-rule-id',
      )

      expect(violation.ruleId).toBe('custom-rule-id')
    })

    test('handles empty string for required parameters', () => {
      const violation = createViolation('', '', { line: 0, column: 0 }, '')

      expect(violation.filePath).toBe('')
      expect(violation.message).toBe('')
      expect(violation.ruleId).toBe('')
    })
  })

  describe('return value structure', () => {
    test('returns complete RuleViolation object', () => {
      const violation = createViolation(
        '/test/file.ts',
        'Test message',
        { line: 5, column: 10 },
        'test-rule',
        'warning',
        'Fix suggestion',
      )

      expect(violation).toHaveProperty('filePath')
      expect(violation).toHaveProperty('message')
      expect(violation).toHaveProperty('ruleId')
      expect(violation).toHaveProperty('severity')
      expect(violation).toHaveProperty('range')
      expect(violation).toHaveProperty('suggestion')
    })

    test('range object has start and end properties', () => {
      const violation = createViolation('/test.ts', 'Test', { line: 1, column: 0 }, 'rule-1')

      expect(violation.range).toHaveProperty('start')
      expect(violation.range).toHaveProperty('end')
    })

    test('range start and end have line and column properties', () => {
      const violation = createViolation('/test.ts', 'Test', { line: 10, column: 5 }, 'rule-1')

      expect(violation.range.start).toHaveProperty('line')
      expect(violation.range.start).toHaveProperty('column')
      expect(violation.range.end).toHaveProperty('line')
      expect(violation.range.end).toHaveProperty('column')
    })
  })

  describe('simple range normalization edge cases', () => {
    test('start column equals provided column', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 3, column: 7 }, 'r')
      expect(violation.range.start.column).toBe(7)
    })

    test('end column is one more than provided column', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 3, column: 7 }, 'r')
      expect(violation.range.end.column).toBe(8)
    })

    test('start line equals provided line', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 42, column: 0 }, 'r')
      expect(violation.range.start.line).toBe(42)
    })

    test('end line equals provided line for simple range', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 42, column: 0 }, 'r')
      expect(violation.range.end.line).toBe(42)
    })

    test('handles column value of 1', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 1 }, 'r')
      expect(violation.range.start.column).toBe(1)
      expect(violation.range.end.column).toBe(2)
    })

    test('handles very large line number', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 100000, column: 0 }, 'r')
      expect(violation.range.start.line).toBe(100000)
    })

    test('handles very large column number', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 99999 }, 'r')
      expect(violation.range.start.column).toBe(99999)
      expect(violation.range.end.column).toBe(100000)
    })
  })

  describe('Range object format edge cases', () => {
    test('preserves single-line range with same start and end line', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { start: { line: 5, column: 3 }, end: { line: 5, column: 10 } },
        'r',
      )
      expect(violation.range.start.line).toBe(5)
      expect(violation.range.end.line).toBe(5)
    })

    test('preserves range where end column equals start column', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { start: { line: 1, column: 5 }, end: { line: 1, column: 5 } },
        'r',
      )
      expect(violation.range.start.column).toBe(5)
      expect(violation.range.end.column).toBe(5)
    })

    test('preserves range spanning many lines', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { start: { line: 1, column: 0 }, end: { line: 500, column: 20 } },
        'r',
      )
      expect(violation.range.start.line).toBe(1)
      expect(violation.range.end.line).toBe(500)
    })

    test('preserves range with zero values', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        'r',
      )
      expect(violation.range.start.line).toBe(0)
      expect(violation.range.start.column).toBe(0)
      expect(violation.range.end.line).toBe(0)
      expect(violation.range.end.column).toBe(0)
    })
  })

  describe('all severity values', () => {
    test('"error" severity produces correct value', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'r', 'error')
      expect(violation.severity).toBe('error')
    })

    test('"warning" severity produces correct value', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'r', 'warning')
      expect(violation.severity).toBe('warning')
    })

    test('"info" severity produces correct value', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'r', 'info')
      expect(violation.severity).toBe('info')
    })
  })

  describe('suggestion edge cases', () => {
    test('suggestion with unicode characters', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { line: 1, column: 0 },
        'r',
        'error',
        'Use → arrow operator',
      )
      expect(violation.suggestion).toBe('Use → arrow operator')
    })

    test('suggestion with very long text', () => {
      const longText = 'A'.repeat(1000)
      const violation = createViolation(
        '/f.ts',
        'msg',
        { line: 1, column: 0 },
        'r',
        'error',
        longText,
      )
      expect(violation.suggestion).toBe(longText)
    })

    test('suggestion with special regex characters', () => {
      const text = 'Replace .* with \\w+'
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'r', 'error', text)
      expect(violation.suggestion).toBe(text)
    })
  })

  describe('filePath variations', () => {
    test('handles relative path', () => {
      const violation = createViolation('./src/file.ts', 'msg', { line: 1, column: 0 }, 'r')
      expect(violation.filePath).toBe('./src/file.ts')
    })

    test('handles absolute path', () => {
      const violation = createViolation(
        '/home/user/project/src/file.ts',
        'msg',
        { line: 1, column: 0 },
        'r',
      )
      expect(violation.filePath).toBe('/home/user/project/src/file.ts')
    })

    test('handles Windows-style path', () => {
      const violation = createViolation(
        'C:\\Users\\project\\file.ts',
        'msg',
        { line: 1, column: 0 },
        'r',
      )
      expect(violation.filePath).toBe('C:\\Users\\project\\file.ts')
    })

    test('handles file path with spaces', () => {
      const violation = createViolation(
        '/path/with spaces/file.ts',
        'msg',
        { line: 1, column: 0 },
        'r',
      )
      expect(violation.filePath).toBe('/path/with spaces/file.ts')
    })

    test('handles file path with unicode', () => {
      const violation = createViolation('/путь/файл.ts', 'msg', { line: 1, column: 0 }, 'r')
      expect(violation.filePath).toBe('/путь/файл.ts')
    })
  })

  describe('message variations', () => {
    test('handles message with interpolation placeholder', () => {
      const violation = createViolation(
        '/f.ts',
        'Expected {{type}} but got {{actual}}',
        { line: 1, column: 0 },
        'r',
      )
      expect(violation.message).toBe('Expected {{type}} but got {{actual}}')
    })

    test('handles message with backticks', () => {
      const violation = createViolation(
        '/f.ts',
        'Use `const` instead of `let`',
        { line: 1, column: 0 },
        'r',
      )
      expect(violation.message).toBe('Use `const` instead of `let`')
    })

    test('handles very long message', () => {
      const longMsg = 'Violation '.repeat(100)
      const violation = createViolation('/f.ts', longMsg, { line: 1, column: 0 }, 'r')
      expect(violation.message).toBe(longMsg)
    })

    test('handles message with newlines', () => {
      const msg = 'Line 1\nLine 2\nLine 3'
      const violation = createViolation('/f.ts', msg, { line: 1, column: 0 }, 'r')
      expect(violation.message).toBe(msg)
    })
  })

  describe('ruleId variations', () => {
    test('handles kebab-case rule id', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'no-unused-vars')
      expect(violation.ruleId).toBe('no-unused-vars')
    })

    test('handles slash-separated rule id', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'plugin/rule-name')
      expect(violation.ruleId).toBe('plugin/rule-name')
    })

    test('handles camelCase rule id', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'noUnusedVars')
      expect(violation.ruleId).toBe('noUnusedVars')
    })

    test('handles snake_case rule id', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'no_unused_vars')
      expect(violation.ruleId).toBe('no_unused_vars')
    })

    test('handles at-prefixed rule id', () => {
      const violation = createViolation(
        '/f.ts',
        'msg',
        { line: 1, column: 0 },
        '@typescript-eslint/no-explicit-any',
      )
      expect(violation.ruleId).toBe('@typescript-eslint/no-explicit-any')
    })
  })

  describe('combined parameters', () => {
    test('all parameters with simple range and suggestion', () => {
      const violation = createViolation(
        '/src/index.ts',
        'Unexpected any',
        { line: 10, column: 5 },
        'no-any',
        'warning',
        'Use a specific type',
      )
      expect(violation.filePath).toBe('/src/index.ts')
      expect(violation.message).toBe('Unexpected any')
      expect(violation.ruleId).toBe('no-any')
      expect(violation.severity).toBe('warning')
      expect(violation.range.start).toEqual({ line: 10, column: 5 })
      expect(violation.range.end).toEqual({ line: 10, column: 6 })
      expect(violation.suggestion).toBe('Use a specific type')
    })

    test('all parameters with Range object and suggestion', () => {
      const violation = createViolation(
        '/src/index.ts',
        'Complex function',
        { start: { line: 5, column: 0 }, end: { line: 15, column: 20 } },
        'max-complexity',
        'error',
        'Break into smaller functions',
      )
      expect(violation.filePath).toBe('/src/index.ts')
      expect(violation.message).toBe('Complex function')
      expect(violation.ruleId).toBe('max-complexity')
      expect(violation.severity).toBe('error')
      expect(violation.range).toEqual({
        start: { line: 5, column: 0 },
        end: { line: 15, column: 20 },
      })
      expect(violation.suggestion).toBe('Break into smaller functions')
    })

    test('minimal parameters - only required', () => {
      const violation = createViolation('/f.ts', 'msg', { line: 1, column: 0 }, 'r')
      expect(violation.severity).toBe('error')
      expect(violation.suggestion).toBeUndefined()
    })
  })
})

describe('RuleSeverity type', () => {
  test('"error" is a valid RuleSeverity value', () => {
    const severity: RuleSeverity = 'error'
    expect(severity).toBe('error')
  })

  test('"warning" is a valid RuleSeverity value', () => {
    const severity: RuleSeverity = 'warning'
    expect(severity).toBe('warning')
  })

  test('"info" is a valid RuleSeverity value', () => {
    const severity: RuleSeverity = 'info'
    expect(severity).toBe('info')
  })

  test('RuleSeverity values are string types', () => {
    const severities: RuleSeverity[] = ['error', 'warning', 'info']
    severities.forEach((s) => expect(typeof s).toBe('string'))
  })

  test('RuleSeverity has exactly 3 valid values', () => {
    const severities: RuleSeverity[] = ['error', 'warning', 'info']
    expect(severities).toHaveLength(3)
  })
})

describe('RuleOptions interface', () => {
  test('accepts empty object', () => {
    const options: RuleOptions = {}
    expect(Object.keys(options)).toHaveLength(0)
  })

  test('accepts max property', () => {
    const options: RuleOptions = { max: 10 }
    expect(options.max).toBe(10)
  })

  test('accepts arbitrary string keys', () => {
    const options: RuleOptions = { customFlag: true, threshold: 5 }
    expect(options.customFlag).toBe(true)
    expect(options.threshold).toBe(5)
  })

  test('accepts undefined max', () => {
    const options: RuleOptions = {}
    expect(options.max).toBeUndefined()
  })

  test('accepts max with zero value', () => {
    const options: RuleOptions = { max: 0 }
    expect(options.max).toBe(0)
  })

  test('accepts max with negative value', () => {
    const options: RuleOptions = { max: -1 }
    expect(options.max).toBe(-1)
  })

  test('accepts nested object values', () => {
    const options: RuleOptions = { config: { nested: true } }
    expect(options.config).toEqual({ nested: true })
  })
})

describe('RuleDocs interface', () => {
  test('accepts empty object', () => {
    const docs: RuleDocs = {}
    expect(Object.keys(docs)).toHaveLength(0)
  })

  test('accepts description property', () => {
    const docs: RuleDocs = { description: 'A test rule' }
    expect(docs.description).toBe('A test rule')
  })

  test('accepts fixable "code"', () => {
    const docs: RuleDocs = { fixable: 'code' }
    expect(docs.fixable).toBe('code')
  })

  test('accepts fixable "whitespace"', () => {
    const docs: RuleDocs = { fixable: 'whitespace' }
    expect(docs.fixable).toBe('whitespace')
  })

  test('accepts recommended true', () => {
    const docs: RuleDocs = { recommended: true }
    expect(docs.recommended).toBe(true)
  })

  test('accepts recommended false', () => {
    const docs: RuleDocs = { recommended: false }
    expect(docs.recommended).toBe(false)
  })

  test('accepts severity property', () => {
    const docs: RuleDocs = { severity: 'error' }
    expect(docs.severity).toBe('error')
  })

  test('accepts url property', () => {
    const docs: RuleDocs = { url: 'https://example.com/rule' }
    expect(docs.url).toBe('https://example.com/rule')
  })

  test('accepts all properties together', () => {
    const docs: RuleDocs = {
      description: 'Test',
      fixable: 'code',
      recommended: true,
      severity: 'warning',
      url: 'https://example.com',
    }
    expect(docs.description).toBe('Test')
    expect(docs.fixable).toBe('code')
    expect(docs.recommended).toBe(true)
    expect(docs.severity).toBe('warning')
    expect(docs.url).toBe('https://example.com')
  })
})

describe('RuleMeta interface', () => {
  test('accepts valid category values', () => {
    const categories = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'style',
    ]
    categories.forEach((category) => {
      const meta: RuleMeta = {
        category: category as RuleMeta['category'],
        description: 'test',
        name: 'test-rule',
        recommended: true,
      }
      expect(meta.category).toBe(category)
    })
  })

  test('requires category field', () => {
    const meta: RuleMeta = {
      category: 'complexity',
      description: 'test',
      name: 'r',
      recommended: true,
    }
    expect(meta.category).toBe('complexity')
  })

  test('requires description field', () => {
    const meta: RuleMeta = {
      category: 'complexity',
      description: 'A rule',
      name: 'r',
      recommended: true,
    }
    expect(meta.description).toBe('A rule')
  })

  test('requires name field', () => {
    const meta: RuleMeta = {
      category: 'complexity',
      description: 'test',
      name: 'my-rule',
      recommended: true,
    }
    expect(meta.name).toBe('my-rule')
  })

  test('requires recommended field', () => {
    const meta: RuleMeta = {
      category: 'complexity',
      description: 'test',
      name: 'r',
      recommended: false,
    }
    expect(meta.recommended).toBe(false)
  })

  test('accepts optional deprecated field', () => {
    const meta: RuleMeta = {
      category: 'style',
      description: 'test',
      name: 'r',
      recommended: true,
      deprecated: true,
    }
    expect(meta.deprecated).toBe(true)
  })

  test('accepts optional docs field', () => {
    const meta: RuleMeta = {
      category: 'style',
      description: 'test',
      name: 'r',
      recommended: true,
      docs: { description: 'docs', url: 'https://example.com' },
    }
    expect(meta.docs?.description).toBe('docs')
  })

  test('accepts optional fixable field', () => {
    const meta: RuleMeta = {
      category: 'style',
      description: 'test',
      name: 'r',
      recommended: true,
      fixable: 'code',
    }
    expect(meta.fixable).toBe('code')
  })

  test('accepts optional replacedBy field', () => {
    const meta: RuleMeta = {
      category: 'style',
      description: 'test',
      name: 'r',
      recommended: true,
      replacedBy: 'new-rule',
    }
    expect(meta.replacedBy).toBe('new-rule')
  })

  test('accepts optional severity field', () => {
    const meta: RuleMeta = {
      category: 'style',
      description: 'test',
      name: 'r',
      recommended: true,
      severity: 'warning',
    }
    expect(meta.severity).toBe('warning')
  })

  test('has exactly 7 valid category values', () => {
    const categories = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'style',
    ]
    expect(categories).toHaveLength(7)
  })
})

describe('RuleConfig interface', () => {
  test('accepts severity only', () => {
    const config: RuleConfig = { severity: 'error' }
    expect(config.severity).toBe('error')
  })

  test('accepts severity with options', () => {
    const config: RuleConfig = { severity: 'warning', options: { max: 5 } }
    expect(config.severity).toBe('warning')
    expect(config.options?.max).toBe(5)
  })

  test('accepts all severity values', () => {
    const configs: RuleConfig[] = [
      { severity: 'error' },
      { severity: 'warning' },
      { severity: 'info' },
    ]
    expect(configs[0]?.severity).toBe('error')
    expect(configs[1]?.severity).toBe('warning')
    expect(configs[2]?.severity).toBe('info')
  })

  test('options can be undefined', () => {
    const config: RuleConfig = { severity: 'error' }
    expect(config.options).toBeUndefined()
  })

  test('options can be empty object', () => {
    const config: RuleConfig = { severity: 'error', options: {} }
    expect(config.options).toEqual({})
  })
})

describe('PluginError class', () => {
  test('constructs with pluginName, message, and code', () => {
    const error = new PluginError('test-plugin', 'something broke', 'TEST_CODE')
    expect(error.message).toBe('[test-plugin] something broke')
    expect(error.pluginName).toBe('test-plugin')
    expect(error.code).toBe('TEST_CODE')
  })

  test('constructs with optional cause', () => {
    const cause = new Error('root cause')
    const error = new PluginError('plugin', 'msg', 'CODE', cause)
    expect(error.cause).toBe(cause)
  })

  test('cause is undefined when not provided', () => {
    const error = new PluginError('plugin', 'msg', 'CODE')
    expect(error.cause).toBeUndefined()
  })

  test('is instance of Error', () => {
    const error = new PluginError('plugin', 'msg', 'CODE')
    expect(error).toBeInstanceOf(Error)
  })

  test('is instance of PluginError', () => {
    const error = new PluginError('plugin', 'msg', 'CODE')
    expect(error).toBeInstanceOf(PluginError)
  })

  test('name property is set to PluginError', () => {
    const error = new PluginError('plugin', 'msg', 'CODE')
    expect(error.name).toBe('PluginError')
  })

  test('has correct stack trace', () => {
    const error = new PluginError('plugin', 'msg', 'CODE')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('PluginError')
  })

  test('pluginName is readonly string', () => {
    const error = new PluginError('my-plugin', 'msg', 'CODE')
    expect(typeof error.pluginName).toBe('string')
    expect(error.pluginName).toBe('my-plugin')
  })

  test('code is readonly string', () => {
    const error = new PluginError('p', 'msg', 'ERR_001')
    expect(typeof error.code).toBe('string')
    expect(error.code).toBe('ERR_001')
  })

  test('message format includes plugin name in brackets', () => {
    const error = new PluginError('my-plugin', 'failed', 'CODE')
    expect(error.message).toBe('[my-plugin] failed')
  })
})

describe('PluginLoadError class', () => {
  test('constructs with pluginName and message', () => {
    const error = new PluginLoadError('test-plugin', 'failed to load')
    expect(error.message).toBe('[test-plugin] failed to load')
    expect(error.pluginName).toBe('test-plugin')
  })

  test('sets code to PLUGIN_LOAD_ERROR', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error.code).toBe('PLUGIN_LOAD_ERROR')
  })

  test('constructs with optional cause', () => {
    const cause = new Error('file not found')
    const error = new PluginLoadError('p', 'msg', cause)
    expect(error.cause).toBe(cause)
  })

  test('is instance of Error', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error).toBeInstanceOf(Error)
  })

  test('is instance of PluginError', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error).toBeInstanceOf(PluginError)
  })

  test('is instance of PluginLoadError', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error).toBeInstanceOf(PluginLoadError)
  })

  test('name property is set to PluginLoadError', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error.name).toBe('PluginLoadError')
  })

  test('cause is undefined when not provided', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error.cause).toBeUndefined()
  })
})

describe('RuleExecutionError class', () => {
  test('constructs with pluginName, ruleName, and message', () => {
    const error = new RuleExecutionError('plugin', 'my-rule', 'failed')
    expect(error.ruleName).toBe('my-rule')
    expect(error.pluginName).toBe('plugin')
  })

  test('sets code to RULE_EXECUTION_ERROR', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error.code).toBe('RULE_EXECUTION_ERROR')
  })

  test('message includes rule name', () => {
    const error = new RuleExecutionError('p', 'my-rule', 'crashed')
    expect(error.message).toContain('my-rule')
  })

  test('message is formatted as [plugin] Rule "rule": msg', () => {
    const error = new RuleExecutionError('my-plugin', 'test-rule', 'boom')
    expect(error.message).toBe('[my-plugin] Rule "test-rule": boom')
  })

  test('constructs with optional cause', () => {
    const cause = new Error('inner')
    const error = new RuleExecutionError('p', 'rule', 'msg', cause)
    expect(error.cause).toBe(cause)
  })

  test('is instance of PluginError', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error).toBeInstanceOf(PluginError)
  })

  test('is instance of RuleExecutionError', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error).toBeInstanceOf(RuleExecutionError)
  })

  test('name property is set to RuleExecutionError', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error.name).toBe('RuleExecutionError')
  })

  test('ruleName is a readonly string', () => {
    const error = new RuleExecutionError('p', 'no-eval', 'msg')
    expect(typeof error.ruleName).toBe('string')
    expect(error.ruleName).toBe('no-eval')
  })
})

describe('TransformExecutionError class', () => {
  test('constructs with pluginName, transformName, and message', () => {
    const error = new TransformExecutionError('plugin', 'my-transform', 'failed')
    expect(error.transformName).toBe('my-transform')
    expect(error.pluginName).toBe('plugin')
  })

  test('sets code to TRANSFORM_EXECUTION_ERROR', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error.code).toBe('TRANSFORM_EXECUTION_ERROR')
  })

  test('message includes transform name', () => {
    const error = new TransformExecutionError('p', 'my-transform', 'crashed')
    expect(error.message).toContain('my-transform')
  })

  test('message is formatted as [plugin] Transform "t": msg', () => {
    const error = new TransformExecutionError('my-plugin', 'babel-transform', 'boom')
    expect(error.message).toBe('[my-plugin] Transform "babel-transform": boom')
  })

  test('constructs with optional cause', () => {
    const cause = new Error('inner')
    const error = new TransformExecutionError('p', 't', 'msg', cause)
    expect(error.cause).toBe(cause)
  })

  test('is instance of PluginError', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error).toBeInstanceOf(PluginError)
  })

  test('is instance of TransformExecutionError', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error).toBeInstanceOf(TransformExecutionError)
  })

  test('name property is set to TransformExecutionError', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error.name).toBe('TransformExecutionError')
  })

  test('transformName is a readonly string', () => {
    const error = new TransformExecutionError('p', 'esbuild', 'msg')
    expect(typeof error.transformName).toBe('string')
    expect(error.transformName).toBe('esbuild')
  })
})

describe('HookExecutionError class', () => {
  test('constructs with pluginName, hookName, and message', () => {
    const error = new HookExecutionError('plugin', 'beforeCheck', 'failed')
    expect(error.hookName).toBe('beforeCheck')
    expect(error.pluginName).toBe('plugin')
  })

  test('sets code to HOOK_EXECUTION_ERROR', () => {
    const error = new HookExecutionError('p', 'hook', 'msg')
    expect(error.code).toBe('HOOK_EXECUTION_ERROR')
  })

  test('message includes hook name', () => {
    const error = new HookExecutionError('p', 'afterCheck', 'crashed')
    expect(error.message).toContain('afterCheck')
  })

  test('message is formatted as [plugin] Hook "hook": msg', () => {
    const error = new HookExecutionError('my-plugin', 'onLoad', 'boom')
    expect(error.message).toBe('[my-plugin] Hook "onLoad": boom')
  })

  test('constructs with optional cause', () => {
    const cause = new Error('inner')
    const error = new HookExecutionError('p', 'hook', 'msg', cause)
    expect(error.cause).toBe(cause)
  })

  test('is instance of PluginError', () => {
    const error = new HookExecutionError('p', 'hook', 'msg')
    expect(error).toBeInstanceOf(PluginError)
  })

  test('is instance of HookExecutionError', () => {
    const error = new HookExecutionError('p', 'hook', 'msg')
    expect(error).toBeInstanceOf(HookExecutionError)
  })

  test('name property is set to HookExecutionError', () => {
    const error = new HookExecutionError('p', 'hook', 'msg')
    expect(error.name).toBe('HookExecutionError')
  })

  test('hookName is a readonly string', () => {
    const error = new HookExecutionError('p', 'onLoad', 'msg')
    expect(typeof error.hookName).toBe('string')
    expect(error.hookName).toBe('onLoad')
  })
})

describe('Error inheritance hierarchy', () => {
  test('PluginLoadError extends PluginError extends Error', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(PluginError)
    expect(error).toBeInstanceOf(PluginLoadError)
  })

  test('RuleExecutionError extends PluginError extends Error', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(PluginError)
    expect(error).toBeInstanceOf(RuleExecutionError)
  })

  test('TransformExecutionError extends PluginError extends Error', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(PluginError)
    expect(error).toBeInstanceOf(TransformExecutionError)
  })

  test('HookExecutionError extends PluginError extends Error', () => {
    const error = new HookExecutionError('p', 'hook', 'msg')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(PluginError)
    expect(error).toBeInstanceOf(HookExecutionError)
  })

  test('PluginLoadError is not instance of RuleExecutionError', () => {
    const error = new PluginLoadError('p', 'msg')
    expect(error).not.toBeInstanceOf(RuleExecutionError)
  })

  test('RuleExecutionError is not instance of TransformExecutionError', () => {
    const error = new RuleExecutionError('p', 'rule', 'msg')
    expect(error).not.toBeInstanceOf(TransformExecutionError)
  })

  test('TransformExecutionError is not instance of HookExecutionError', () => {
    const error = new TransformExecutionError('p', 't', 'msg')
    expect(error).not.toBeInstanceOf(HookExecutionError)
  })

  test('can catch all plugin errors via PluginError', () => {
    const errors = [
      new PluginLoadError('p', 'msg'),
      new RuleExecutionError('p', 'r', 'msg'),
      new TransformExecutionError('p', 't', 'msg'),
      new HookExecutionError('p', 'h', 'msg'),
    ]
    errors.forEach((e) => {
      expect(e).toBeInstanceOf(PluginError)
    })
  })
})

describe('Plugin types - Position', () => {
  test('creates a valid Position object', () => {
    const pos: PluginPosition = { line: 1, column: 0 }
    expect(pos.line).toBe(1)
    expect(pos.column).toBe(0)
  })

  test('Position line is a number', () => {
    const pos: PluginPosition = { line: 5, column: 10 }
    expect(typeof pos.line).toBe('number')
  })

  test('Position column is a number', () => {
    const pos: PluginPosition = { line: 5, column: 10 }
    expect(typeof pos.column).toBe('number')
  })
})

describe('Plugin types - Range', () => {
  test('creates a valid Range tuple', () => {
    const range: PluginRange = [0, 10] as const
    expect(range[0]).toBe(0)
    expect(range[1]).toBe(10)
  })

  test('Range has exactly 2 elements', () => {
    const range: PluginRange = [5, 15] as const
    expect(range).toHaveLength(2)
  })

  test('Range start can equal end', () => {
    const range: PluginRange = [10, 10] as const
    expect(range[0]).toBe(range[1])
  })
})

describe('Plugin types - SourceLocation', () => {
  test('creates a valid SourceLocation', () => {
    const loc: SourceLocation = {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    }
    expect(loc.start.line).toBe(1)
    expect(loc.end.column).toBe(10)
  })

  test('start and end are Position objects', () => {
    const loc: SourceLocation = {
      start: { line: 1, column: 0 },
      end: { line: 5, column: 20 },
    }
    expect(typeof loc.start.line).toBe('number')
    expect(typeof loc.start.column).toBe('number')
    expect(typeof loc.end.line).toBe('number')
    expect(typeof loc.end.column).toBe('number')
  })
})

describe('Plugin types - FixDescriptor', () => {
  test('creates a valid FixDescriptor', () => {
    const fix: FixDescriptor = { range: [0, 5], text: 'replacement' }
    expect(fix.range).toEqual([0, 5])
    expect(fix.text).toBe('replacement')
  })

  test('range is a tuple of two numbers', () => {
    const fix: FixDescriptor = { range: [10, 20], text: '' }
    expect(fix.range).toHaveLength(2)
    expect(typeof fix.range[0]).toBe('number')
    expect(typeof fix.range[1]).toBe('number')
  })

  test('text is a string', () => {
    const fix: FixDescriptor = { range: [0, 1], text: 'hello' }
    expect(typeof fix.text).toBe('string')
  })

  test('text can be empty string', () => {
    const fix: FixDescriptor = { range: [0, 5], text: '' }
    expect(fix.text).toBe('')
  })
})

describe('Plugin types - SuggestionDescriptor', () => {
  test('creates a valid SuggestionDescriptor', () => {
    const suggestion: SuggestionDescriptor = {
      desc: 'Use const',
      message: 'Prefer const declarations',
      fix: { range: [0, 3], text: 'const' },
    }
    expect(suggestion.desc).toBe('Use const')
    expect(suggestion.message).toBe('Prefer const declarations')
    expect(suggestion.fix.text).toBe('const')
  })

  test('has desc, message, and fix properties', () => {
    const suggestion: SuggestionDescriptor = {
      desc: 'desc',
      message: 'msg',
      fix: { range: [0, 1], text: 'x' },
    }
    expect(suggestion).toHaveProperty('desc')
    expect(suggestion).toHaveProperty('message')
    expect(suggestion).toHaveProperty('fix')
  })
})

describe('Plugin types - ReportDescriptor', () => {
  test('creates with required message', () => {
    const desc: ReportDescriptor = { message: 'Something is wrong' }
    expect(desc.message).toBe('Something is wrong')
  })

  test('creates with optional node', () => {
    const desc: ReportDescriptor = { message: 'msg', node: {} }
    expect(desc.node).toBeDefined()
  })

  test('creates with optional loc', () => {
    const desc: ReportDescriptor = {
      message: 'msg',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    }
    expect(desc.loc?.start.line).toBe(1)
  })

  test('creates with optional data', () => {
    const desc: ReportDescriptor = { message: 'msg', data: { name: 'test' } }
    expect(desc.data).toEqual({ name: 'test' })
  })

  test('creates with optional fix', () => {
    const desc: ReportDescriptor = {
      message: 'msg',
      fix: { range: [0, 5], text: 'fixed' },
    }
    expect(desc.fix?.text).toBe('fixed')
  })

  test('creates with optional suggest', () => {
    const desc: ReportDescriptor = {
      message: 'msg',
      suggest: [{ desc: 'Fix it', message: 'Apply fix', fix: { range: [0, 1], text: '' } }],
    }
    expect(desc.suggest).toHaveLength(1)
  })

  test('creates with all optional fields', () => {
    const desc: ReportDescriptor = {
      message: 'Error found',
      node: { type: 'Identifier' },
      loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 0 } },
      data: { key: 'value' },
      fix: { range: [0, 10], text: 'replacement' },
      suggest: [{ desc: 's1', message: 'm1', fix: { range: [0, 1], text: '' } }],
    }
    expect(desc.message).toBe('Error found')
    expect(desc.node).toBeDefined()
    expect(desc.loc).toBeDefined()
    expect(desc.data).toBeDefined()
    expect(desc.fix).toBeDefined()
    expect(desc.suggest).toBeDefined()
  })
})

describe('Plugin types - Logger', () => {
  test('implements Logger interface', () => {
    const logger: Logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    }
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  test('Logger methods accept message and args', () => {
    const messages: string[] = []
    const logger: Logger = {
      debug: (msg) => {
        messages.push(msg)
      },
      info: (msg) => {
        messages.push(msg)
      },
      warn: (msg) => {
        messages.push(msg)
      },
      error: (msg) => {
        messages.push(msg)
      },
    }
    logger.debug('debug-msg')
    logger.info('info-msg')
    logger.warn('warn-msg')
    logger.error('error-msg')
    expect(messages).toEqual(['debug-msg', 'info-msg', 'warn-msg', 'error-msg'])
  })
})

describe('Plugin types - HookContext', () => {
  test('creates a valid HookContext', () => {
    const ctx: HookContext = {
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      timestamp: new Date(),
    }
    expect(ctx.logger).toBeDefined()
    expect(ctx.timestamp).toBeInstanceOf(Date)
  })

  test('optional data field', () => {
    const ctx: HookContext = {
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      timestamp: new Date(),
      data: { key: 'value' },
    }
    expect(ctx.data).toEqual({ key: 'value' })
  })

  test('data can be undefined', () => {
    const ctx: HookContext = {
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      timestamp: new Date(),
    }
    expect(ctx.data).toBeUndefined()
  })
})

describe('Plugin types - PluginHooks', () => {
  const noop = async () => {}
  test('accepts empty hooks object', () => {
    const hooks: PluginHooks = {}
    expect(Object.keys(hooks)).toHaveLength(0)
  })

  test('accepts onLoad hook', () => {
    const hooks: PluginHooks = { onLoad: noop }
    expect(hooks.onLoad).toBeDefined()
  })

  test('accepts onUnload hook', () => {
    const hooks: PluginHooks = { onUnload: noop }
    expect(hooks.onUnload).toBeDefined()
  })

  test('accepts beforeCheck hook', () => {
    const hooks: PluginHooks = { beforeCheck: noop }
    expect(hooks.beforeCheck).toBeDefined()
  })

  test('accepts afterCheck hook', () => {
    const hooks: PluginHooks = { afterCheck: noop }
    expect(hooks.afterCheck).toBeDefined()
  })

  test('accepts beforeTransform hook', () => {
    const hooks: PluginHooks = { beforeTransform: noop }
    expect(hooks.beforeTransform).toBeDefined()
  })

  test('accepts afterTransform hook', () => {
    const hooks: PluginHooks = { afterTransform: noop }
    expect(hooks.afterTransform).toBeDefined()
  })

  test('accepts onError hook', () => {
    const hooks: PluginHooks = { onError: async () => {} }
    expect(hooks.onError).toBeDefined()
  })

  test('accepts all hooks together', () => {
    const hooks: PluginHooks = {
      onLoad: noop,
      onUnload: noop,
      beforeCheck: noop,
      afterCheck: noop,
      beforeTransform: noop,
      afterTransform: noop,
      onError: async () => {},
    }
    expect(Object.keys(hooks)).toHaveLength(7)
  })
})

describe('Plugin types - PluginConfig', () => {
  test('accepts empty config', () => {
    const config: PluginConfig = {}
    expect(Object.keys(config)).toHaveLength(0)
  })

  test('accepts options', () => {
    const config: PluginConfig = { options: { key: 'value' } }
    expect(config.options).toEqual({ key: 'value' })
  })

  test('accepts rules with severity strings', () => {
    const config: PluginConfig = { rules: { 'no-eval': 'error' } }
    expect(config.rules?.['no-eval']).toBe('error')
  })

  test('accepts rules with severity and options tuple', () => {
    const config: PluginConfig = { rules: { 'max-params': ['error', 3] } }
    expect(config.rules?.['max-params']).toEqual(['error', 3])
  })

  test('accepts transforms', () => {
    const config: PluginConfig = { transforms: ['transform-1', 'transform-2'] }
    expect(config.transforms).toHaveLength(2)
  })
})

describe('Plugin types - Plugin', () => {
  test('accepts minimal plugin', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0' }
    expect(plugin.name).toBe('test')
    expect(plugin.version).toBe('1.0.0')
  })

  test('accepts optional description', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', description: 'A test plugin' }
    expect(plugin.description).toBe('A test plugin')
  })

  test('accepts optional rules', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', rules: {} }
    expect(plugin.rules).toEqual({})
  })

  test('accepts optional transforms', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', transforms: {} }
    expect(plugin.transforms).toEqual({})
  })

  test('accepts optional hooks', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', hooks: {} }
    expect(plugin.hooks).toEqual({})
  })

  test('accepts optional dependencies', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', dependencies: ['dep1', 'dep2'] }
    expect(plugin.dependencies).toHaveLength(2)
  })

  test('accepts optional engines', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0', engines: { codeforge: '^1.0.0' } }
    expect(plugin.engines?.codeforge).toBe('^1.0.0')
  })

  test('all optional fields can be undefined', () => {
    const plugin: Plugin = { name: 'test', version: '1.0.0' }
    expect(plugin.description).toBeUndefined()
    expect(plugin.rules).toBeUndefined()
    expect(plugin.transforms).toBeUndefined()
    expect(plugin.hooks).toBeUndefined()
    expect(plugin.dependencies).toBeUndefined()
    expect(plugin.engines).toBeUndefined()
  })
})

describe('Plugin types - PluginManifest', () => {
  test('creates a valid manifest', () => {
    const manifest: PluginManifest = {
      name: 'my-plugin',
      version: '1.0.0',
      main: 'index.js',
    }
    expect(manifest.name).toBe('my-plugin')
    expect(manifest.version).toBe('1.0.0')
    expect(manifest.main).toBe('index.js')
  })

  test('accepts optional description', () => {
    const manifest: PluginManifest = {
      name: 'p',
      version: '1.0.0',
      main: 'index.js',
      description: 'desc',
    }
    expect(manifest.description).toBe('desc')
  })

  test('accepts optional peerDependencies', () => {
    const manifest: PluginManifest = {
      name: 'p',
      version: '1.0.0',
      main: 'index.js',
      peerDependencies: { codeforge: '^1.0.0' },
    }
    expect(manifest.peerDependencies?.codeforge).toBe('^1.0.0')
  })

  test('required fields are name, version, main', () => {
    const manifest: PluginManifest = { name: 'p', version: '2.0.0', main: 'dist/index.js' }
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('version')
    expect(manifest).toHaveProperty('main')
  })
})

describe('Plugin types - PluginContext', () => {
  test('creates a valid PluginContext', () => {
    const ctx: PluginContext = {
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      config: {},
      workspaceRoot: '/project',
    }
    expect(ctx.logger).toBeDefined()
    expect(ctx.config).toEqual({})
    expect(ctx.workspaceRoot).toBe('/project')
  })

  test('config can have rules', () => {
    const ctx: PluginContext = {
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      config: { rules: { 'no-eval': 'error' } },
      workspaceRoot: '/project',
    }
    expect(ctx.config.rules?.['no-eval']).toBe('error')
  })
})

describe('Plugin types - Severity', () => {
  test('"off" is a valid Severity', () => {
    const s: PluginSeverity = 'off'
    expect(s).toBe('off')
  })

  test('"warn" is a valid Severity', () => {
    const s: PluginSeverity = 'warn'
    expect(s).toBe('warn')
  })

  test('"error" is a valid Severity', () => {
    const s: PluginSeverity = 'error'
    expect(s).toBe('error')
  })

  test('Severity has exactly 3 values', () => {
    const values: PluginSeverity[] = ['off', 'warn', 'error']
    expect(values).toHaveLength(3)
  })
})

describe('Plugin types - RuleType', () => {
  test('"problem" is a valid RuleType', () => {
    const t: RuleType = 'problem'
    expect(t).toBe('problem')
  })

  test('"suggestion" is a valid RuleType', () => {
    const t: RuleType = 'suggestion'
    expect(t).toBe('suggestion')
  })

  test('"layout" is a valid RuleType', () => {
    const t: RuleType = 'layout'
    expect(t).toBe('layout')
  })

  test('RuleType has exactly 3 values', () => {
    const values: RuleType[] = ['problem', 'suggestion', 'layout']
    expect(values).toHaveLength(3)
  })
})

describe('Plugin types - RuleSchema', () => {
  test('accepts an array', () => {
    const schema: RuleSchema = [{ type: 'string' }]
    expect(Array.isArray(schema)).toBe(true)
  })

  test('accepts a record', () => {
    const schema: RuleSchema = { type: 'object', properties: {} }
    expect(typeof schema).toBe('object')
    expect(Array.isArray(schema)).toBe(false)
  })

  test('accepts empty array', () => {
    const schema: RuleSchema = []
    expect(schema).toEqual([])
  })

  test('accepts empty record', () => {
    const schema: RuleSchema = {}
    expect(schema).toEqual({})
  })
})

describe('Plugin types - TransformDefinition', () => {
  test('creates with required fields', () => {
    const def: TransformDefinition = {
      name: 'my-transform',
      transform: () => 'output',
    }
    expect(def.name).toBe('my-transform')
    expect(typeof def.transform).toBe('function')
  })

  test('accepts optional description', () => {
    const def: TransformDefinition = {
      name: 't',
      transform: () => '',
      description: 'A transform',
    }
    expect(def.description).toBe('A transform')
  })

  test('accepts optional filePatterns', () => {
    const def: TransformDefinition = {
      name: 't',
      transform: () => '',
      filePatterns: ['*.ts', '*.tsx'],
    }
    expect(def.filePatterns).toHaveLength(2)
  })

  test('transform can return a promise', () => {
    const def: TransformDefinition = {
      name: 't',
      transform: async () => 'async-output',
    }
    expect(def.transform('', {} as TransformContext)).toBeInstanceOf(Promise)
  })
})

describe('Plugin types - PluginRuleMeta', () => {
  test('creates with required type and severity', () => {
    const meta: PluginRuleMeta = {
      type: 'problem',
      severity: 'error',
    }
    expect(meta.type).toBe('problem')
    expect(meta.severity).toBe('error')
  })

  test('accepts optional docs', () => {
    const meta: PluginRuleMeta = {
      type: 'suggestion',
      severity: 'warn',
      docs: { description: 'A rule' },
    }
    expect(meta.docs?.description).toBe('A rule')
  })

  test('accepts optional fixable', () => {
    const meta: PluginRuleMeta = { type: 'problem', severity: 'error', fixable: 'code' }
    expect(meta.fixable).toBe('code')
  })

  test('accepts optional deprecated', () => {
    const meta: PluginRuleMeta = { type: 'problem', severity: 'error', deprecated: true }
    expect(meta.deprecated).toBe(true)
  })

  test('accepts optional schema', () => {
    const meta: PluginRuleMeta = { type: 'problem', severity: 'error', schema: [] }
    expect(meta.schema).toEqual([])
  })

  test('accepts optional replacedBy', () => {
    const meta: PluginRuleMeta = { type: 'problem', severity: 'error', replacedBy: ['new-rule'] }
    expect(meta.replacedBy).toEqual(['new-rule'])
  })

  test('accepts optional requiresTypeChecking', () => {
    const meta: PluginRuleMeta = { type: 'problem', severity: 'error', requiresTypeChecking: true }
    expect(meta.requiresTypeChecking).toBe(true)
  })
})

describe('Plugin types - PluginRuleDefinition', () => {
  test('creates with required meta and create', () => {
    const def: PluginRuleDefinition = {
      meta: { type: 'problem', severity: 'error' },
      create: () => ({}),
    }
    expect(def.meta.type).toBe('problem')
    expect(typeof def.create).toBe('function')
  })
})
