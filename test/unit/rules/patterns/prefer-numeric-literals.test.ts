import { describe, test, expect, vi } from 'vitest'
import { preferNumericLiteralsRule } from '../../../../src/rules/patterns/prefer-numeric-literals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'parseInt("111110", 2);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createParseIntCall(strValue: string, radix: number, line = 1, column = 0): unknown {
  const endColumn = column + 25
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'parseInt',
    },
    arguments: [
      { type: 'Literal', value: strValue },
      { type: 'Literal', value: radix },
    ],
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

function createCallExpression(calleeName: string, args: unknown[], line = 1, column = 0): unknown {
  const endColumn = column + 25
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: endColumn },
    },
  }
}

describe('prefer-numeric-literals rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNumericLiteralsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNumericLiteralsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferNumericLiteralsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(preferNumericLiteralsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNumericLiteralsRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferNumericLiteralsRule.meta.fixable).toBe('code')
    })

    test('should mention numeric literals in description', () => {
      expect(preferNumericLiteralsRule.meta.docs?.description.toLowerCase()).toContain('numeric')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting binary literals (radix 2)', () => {
    test('should report parseInt with radix 2', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('111110', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0b')
    })

    test('should mention radix 2 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 2')
    })
  })

  describe('detecting octal literals (radix 8)', () => {
    test('should report parseInt with radix 8', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('123456', 8)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0o')
    })

    test('should mention radix 8 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('765432', 8)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 8')
    })
  })

  describe('detecting hexadecimal literals (radix 16)', () => {
    test('should report parseInt with radix 16', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('ABCDEF', 16)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0x')
    })

    test('should mention radix 16 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('deadbeef', 16)
      visitor.CallExpression(node)

      expect(reports[0].message).toContain('radix 16')
    })
  })

  describe('negative tests - should NOT report', () => {
    test('should not report parseInt with radix 10', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('12345', 10)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt without radix', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [{ type: 'Literal', value: '12345' }])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 36', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('xyz', 36)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt with radix 3', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('102', 3)
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-parseInt calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseFloat', [
        { type: 'Literal', value: '123.45' },
        { type: 'Literal', value: 10 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is not a string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Identifier', name: 'str' },
        { type: 'Literal', value: 2 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101010' },
        { type: 'Identifier', name: 'radix' },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when radix is not an integer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createCallExpression('parseInt', [
        { type: 'Literal', value: '101010' },
        { type: 'Literal', value: 2.5 },
      ])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          { type: 'Literal', value: '111110' },
          { type: 'Literal', value: 2 },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2, 10, 5)
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('101010', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      const node = createParseIntCall('', 2)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for parseInt("101010", 2)', () => {
      const source = 'parseInt("101010", 2)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: '101010', range: [11, 19] },
          { type: 'Literal', value: 2, range: [21, 22] },
        ],
        range: [0, 24] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 24 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('0b101010')
    })

    test('should provide fix for parseInt("755", 8)', () => {
      const source = 'parseInt("755", 8)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: '755', range: [11, 15] },
          { type: 'Literal', value: 8, range: [17, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0o755')
    })

    test('should provide fix for parseInt("FF", 16)', () => {
      const source = 'parseInt("FF", 16)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferNumericLiteralsRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'parseInt',
        },
        arguments: [
          { type: 'Literal', value: 'FF', range: [11, 14] },
          { type: 'Literal', value: 16, range: [16, 18] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('0xFF')
    })
  })

  describe('multiple calls', () => {
    test('should report multiple parseInt calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101010', 2))
      visitor.CallExpression(createParseIntCall('123456', 8))
      visitor.CallExpression(createParseIntCall('ABCDEF', 16))

      expect(reports.length).toBe(3)
    })

    test('should only report valid radixes in multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumericLiteralsRule.create(context)

      visitor.CallExpression(createParseIntCall('101010', 2))
      visitor.CallExpression(createParseIntCall('12345', 10))
      visitor.CallExpression(createParseIntCall('123456', 8))

      expect(reports.length).toBe(2)
    })
  })
})
