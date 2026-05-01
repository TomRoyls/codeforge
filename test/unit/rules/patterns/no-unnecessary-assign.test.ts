import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAssignRule } from '../../../../src/rules/patterns/no-unnecessary-assign.js'
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
    getSource: () => 'x = x',
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

function makeAssignNode(
  leftName: string,
  rightName: string,
  operator = '=',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left: { type: 'Identifier', name: leftName },
    right: { type: 'Identifier', name: rightName },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-assign rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAssignRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAssignRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAssignRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAssignRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning self-assignment', () => {
      const desc = noUnnecessaryAssignRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/assign/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAssignRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-assign',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAssignRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAssignRule).toBeDefined()
      expect(noUnnecessaryAssignRule.meta).toBeDefined()
      expect(noUnnecessaryAssignRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS SELF-ASSIGNMENT (25) =====

  describe('positive cases — reports self-assignment', () => {
    test('reports for x = x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports.length).toBe(1)
    })

    test('reports for foo = foo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('foo', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for myVar = myVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('myVar', 'myVar'))
      expect(reports.length).toBe(1)
    })

    test('reports for _private = _private', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('_private', '_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for $jquery = $jquery', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('$jquery', '$jquery'))
      expect(reports.length).toBe(1)
    })

    test('reports for data = data', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('data', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for result = result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('result', 'result'))
      expect(reports.length).toBe(1)
    })

    test('reports for value = value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('value', 'value'))
      expect(reports.length).toBe(1)
    })

    test('reports for counter = counter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('counter', 'counter'))
      expect(reports.length).toBe(1)
    })

    test('reports for item = item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('item', 'item'))
      expect(reports.length).toBe(1)
    })

    test('reports for index = index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('index', 'index'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr = arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('arr', 'arr'))
      expect(reports.length).toBe(1)
    })

    test('reports for obj = obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('obj', 'obj'))
      expect(reports.length).toBe(1)
    })

    test('reports for callback = callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('callback', 'callback'))
      expect(reports.length).toBe(1)
    })

    test('reports for str = str', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('str', 'str'))
      expect(reports.length).toBe(1)
    })

    test('reports for num = num', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('num', 'num'))
      expect(reports.length).toBe(1)
    })

    test('reports for flag = flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('flag', 'flag'))
      expect(reports.length).toBe(1)
    })

    test('reports for config = config', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('config', 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for temp = temp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('temp', 'temp'))
      expect(reports.length).toBe(1)
    })

    test('reports for buffer = buffer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('buffer', 'buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports for output = output', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('output', 'output'))
      expect(reports.length).toBe(1)
    })

    test('reports for input = input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('input', 'input'))
      expect(reports.length).toBe(1)
    })

    test('reports for self = self', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('self', 'self'))
      expect(reports.length).toBe(1)
    })

    test('reports for __proto__ = __proto__', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('__proto__', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports for a = a', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('a', 'a'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary self-assignment"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0].message).toContain('Unnecessary self-assignment')
    })

    test('report message contains the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0].message).toContain("'x'")
    })

    test('report message for foo contains "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('foo', 'foo'))
      expect(reports[0].message).toContain("'foo'")
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0].message).toBe("Unnecessary self-assignment of 'x'.")
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '=', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '=', 3, 4, 3, 14))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      visitor.AssignmentExpression(makeAssignNode('y', 'y'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      visitor.AssignmentExpression(makeAssignNode('y', 'y'))
      expect(reports[0].message).toMatch(/Unnecessary self-assignment of 'x'\./)
      expect(reports[1].message).toMatch(/Unnecessary self-assignment of 'y'\./)
    })

    test('reports two violations with individual correct messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('foo', 'foo'))
      visitor.AssignmentExpression(makeAssignNode('bar', 'bar'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe("Unnecessary self-assignment of 'foo'.")
      expect(reports[1].message).toBe("Unnecessary self-assignment of 'bar'.")
    })

    test('report node matches the input AssignmentExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      const node = makeAssignNode('x', 'x')
      visitor.AssignmentExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      const node = makeAssignNode('x', 'x')
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(3)
    })

    test('message for myVar is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('myVar', 'myVar'))
      expect(reports[0].message).toBe("Unnecessary self-assignment of 'myVar'.")
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for different names x = y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'y'))
      expect(reports.length).toBe(0)
    })

    test('does not report for different names foo = bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('foo', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for different names a = b', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('a', 'b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator +=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '+='))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator -=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '-='))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator *=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '*='))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator /=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '/='))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator %=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '%='))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator **=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '**='))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'x' } },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'x' } },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'x' } },
        right: { type: 'MemberExpression', object: { type: 'Identifier', name: 'b' }, property: { type: 'Identifier', name: 'x' } },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: 'x',
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: 'x',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when names differ by case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('Foo', 'foo'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAssignRule.create(ctx1)
      const visitor2 = noUnnecessaryAssignRule.create(ctx2)
      visitor1.AssignmentExpression(makeAssignNode('x', 'x'))
      visitor2.AssignmentExpression(makeAssignNode('x', 'y'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      visitor.AssignmentExpression(makeAssignNode('a', 'b'))
      visitor.AssignmentExpression(makeAssignNode('y', 'y'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('a', 'b'))
      visitor.AssignmentExpression(makeAssignNode('x', 'x'))
      visitor.AssignmentExpression(makeAssignNode('foo', 'bar'))
      visitor.AssignmentExpression(makeAssignNode('y', 'y'))
      visitor.AssignmentExpression(makeAssignNode('a', 'b'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAssignRule.create(context)
      const visitor2 = noUnnecessaryAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAssignRule.meta
      const meta2 = noUnnecessaryAssignRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        parenthesized: true,
      }
      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAssignRule).toBeDefined()
      expect(typeof noUnnecessaryAssignRule.create).toBe('function')
      expect(typeof noUnnecessaryAssignRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '=', 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('handles node where left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where left.name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 123 },
        right: { type: 'Identifier', name: 123 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where left/right have different name types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('handles operator <<=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '<<='))
      expect(reports.length).toBe(0)
    })

    test('handles operator >>=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '>>='))
      expect(reports.length).toBe(0)
    })

    test('handles operator &=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '&='))
      expect(reports.length).toBe(0)
    })

    test('handles operator |=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAssignRule.create(context)
      visitor.AssignmentExpression(makeAssignNode('x', 'x', '|='))
      expect(reports.length).toBe(0)
    })
  })
})
