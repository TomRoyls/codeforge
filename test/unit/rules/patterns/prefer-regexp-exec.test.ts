import { describe, test, expect, vi } from 'vitest'
import { preferRegexpExecRule } from '../../../../src/rules/patterns/prefer-regexp-exec.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'str.match(/test/g);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createStringMatchCall(
  objectName: string,
  regexPattern: string,
  regexFlags: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'match',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: `/${regexPattern}/${regexFlags}`,
        regex: {
          pattern: regexPattern,
          flags: regexFlags,
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createLiteralWithRawOnly(raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: null,
    raw,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('prefer-regexp-exec rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRegexpExecRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRegexpExecRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRegexpExecRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRegexpExecRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRegexpExecRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferRegexpExecRule.meta.fixable).toBe('code')
    })

    test('should mention exec or matchAll in description', () => {
      const desc = preferRegexpExecRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('exec') || desc.includes('matchall')).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting string.match with global flag', () => {
    test('should report str.match(/test/g)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'test', 'g')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('exec')
    })

    test('should report str.match(/pattern/gi) with multiple flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'gi')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.match(/pattern/ig) with global flag in any position', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'ig')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report str.match(/pattern/) without global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'i')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.match(/pattern/) with no flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', '')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method is not match', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'test' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not a member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'match' },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when argument is not a regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'regex' }],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('regex literal parsing', () => {
    test('should detect global flag from raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [createLiteralWithRawOnly('/test/g')],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when raw has no global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [createLiteralWithRawOnly('/test/i')],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'test', 'g', 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention exec in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports[0].message.toLowerCase()).toContain('exec')
    })

    test('should mention matchAll in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports[0].message.toLowerCase()).toContain('matchall')
    })
  })
})
