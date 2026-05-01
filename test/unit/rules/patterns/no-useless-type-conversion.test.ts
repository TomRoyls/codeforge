import { describe, expect, test, vi } from 'vitest'
import { noUselessTypeConversionRule } from '../../../../src/rules/patterns/no-useless-type-conversion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'Boolean(true)',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeCallNode(
  calleeName: string,
  argType: string,
  argValue: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 14,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: argType, value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-useless-type-conversion rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessTypeConversionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessTypeConversionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessTypeConversionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessTypeConversionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessTypeConversionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning type conversion', () => {
      const desc = noUselessTypeConversionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/type conversion/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessTypeConversionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-type-conversion',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessTypeConversionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessTypeConversionRule).toBeDefined()
      expect(noUselessTypeConversionRule.meta).toBeDefined()
      expect(noUselessTypeConversionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — BOOLEAN (7) =====

  describe('positive cases — Boolean conversion', () => {
    test('reports for Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', false))
      expect(reports.length).toBe(1)
    })

    test('report message for Boolean mentions already-boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports[0].message).toContain('Unnecessary Boolean()')
    })

    test('report message for Boolean is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports[0].message).toBe(
        'Unnecessary Boolean() call on already-boolean value.',
      )
    })

    test('report message for Boolean(false) is same as Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', false))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Boolean(true) with custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true, 5, 10, 5, 24))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports for multiple Boolean calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', false))
      expect(reports.length).toBe(2)
    })

  })

  // ===== POSITIVE CASES — NUMBER (8) =====

  describe('positive cases — Number conversion', () => {
    test('reports for Number(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 0))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', -1))
      expect(reports.length).toBe(1)
    })

    test('report message for Number mentions already-number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports[0].message).toContain('Unnecessary Number()')
    })

    test('report message for Number is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports[0].message).toBe(
        'Unnecessary Number() call on already-number value.',
      )
    })

    test('reports for Number(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', NaN))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 999))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — STRING (8) =====

  describe('positive cases — String conversion', () => {
    test('reports for String("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for String("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for String("x")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'x'))
      expect(reports.length).toBe(1)
    })

    test('reports for String("abc def")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'abc def'))
      expect(reports.length).toBe(1)
    })

    test('report message for String mentions already-string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports[0].message).toContain('Unnecessary String()')
    })

    test('report message for String is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports[0].message).toBe(
        'Unnecessary String() call on already-string value.',
      )
    })

    test('reports for String with multi-word value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello world'))
      expect(reports.length).toBe(1)
    })

    test('reports for String with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', '${foo}'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report for Boolean has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('report for Boolean has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports[0].node).toBeDefined()
    })

    test('report for Number has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports[0].loc).toBeDefined()
    })

    test('report for Number has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports[0].node).toBeDefined()
    })

    test('report for String has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report for String has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node for Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = makeCallNode('Boolean', 'Literal', true)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report node matches the input node for Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = makeCallNode('Number', 'Literal', 42)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report node matches the input node for String', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = makeCallNode('String', 'Literal', 'hello')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved for Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true, 5, 10, 5, 24))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('report loc values are preserved for Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42, 3, 5, 3, 16))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc values are preserved for String', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hi', 7, 2, 7, 16))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('different conversion types have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('all three conversion types produce unique messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression(makeCallNode('Number', 'Literal', 42))
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hi'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (26) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Boolean with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', 42))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', true))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', '42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for String with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', true))
      expect(reports.length).toBe(0)
    })

    test('does not report for String with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 42))
      expect(reports.length).toBe(0)
    })

    test('does not report for unknown function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('parseInt', 'Literal', '42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean with zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }, { type: 'Literal', value: false }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Literal argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessTypeConversionRule.create(ctx1)
      const visitor2 = noUselessTypeConversionRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor2.CallExpression(makeCallNode('Boolean', 'Literal', 42))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hello'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', true))
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', 42))
      visitor.CallExpression(makeCallNode('Number', 'Literal', 10))
      visitor.CallExpression(makeCallNode('String', 'Literal', 'hi'))
      visitor.CallExpression(makeCallNode('String', 'Literal', 99))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessTypeConversionRule.create(context)
      const visitor2 = noUselessTypeConversionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUselessTypeConversionRule.meta
      const meta2 = noUselessTypeConversionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 12),
        range: [0, 12],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'a' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      const node = makeCallNode('Boolean', 'Literal', true)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUselessTypeConversionRule).toBeDefined()
      expect(typeof noUselessTypeConversionRule.create).toBe('function')
      expect(typeof noUselessTypeConversionRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: false }],
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee.type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', null))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Boolean', 'Literal', undefined))
      expect(reports.length).toBe(0)
    })

    test('handles Number(Infinity) as number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('Number', 'Literal', Infinity))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessTypeConversionRule.create(context)
      visitor.CallExpression(makeCallNode('String', 'Literal', 'test', 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })
  })
})
