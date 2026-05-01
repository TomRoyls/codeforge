import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryShiftRule } from '../../../../src/rules/patterns/no-unnecessary-shift.js'
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
    getSource: () => '[]',
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
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

describe('no-unnecessary-shift rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryShiftRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryShiftRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryShiftRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryShiftRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryShiftRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning shift', () => {
      const desc = noUnnecessaryShiftRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/shift/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryShiftRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-shift',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryShiftRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryShiftRule).toBeDefined()
      expect(noUnnecessaryShiftRule.meta).toBeDefined()
      expect(noUnnecessaryShiftRule.create).toBeDefined()
    })
  })

  describe('positive cases — reports unnecessary shift', () => {
    test('reports for empty array [].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element number array [1].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element boolean array [true].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element false array [false].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: false }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element object array [{ key: 1 }].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element null array [null].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with number literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 0 }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: -1 }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with float number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 3.14 }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: '' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with long string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'a very long string value' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with undefined identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'undefined' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with argument (shift ignores it)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [{ type: 'Literal', value: 'unused' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with argument (shift ignores it)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'shift', [{ type: 'Literal', value: 'unused' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions shift', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports[0].message).toMatch(/shift/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports[0].message).toBe(
        'Unnecessary .shift() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'shift')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'shift'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'shift'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for single-element array with FunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with NewExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AwaitExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with YieldExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'YieldExpression', argument: { type: 'Literal', value: 1 } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AssignmentExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with BinaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with LogicalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UpdateExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ClassExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ClassExpression', id: null, superClass: null, body: { type: 'ClassBody', body: [] } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array on different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [], 42, 8, 42, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('reports for empty array spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [], 1, 0, 3, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('reports for single-element array with CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with MemberExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object having properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }] }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ThisExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ThisExpression' }]), 'shift'))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'shift')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'shift'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed member expression property with non-computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'shift' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [1, 2].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array [1, 2, 3].shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.shift() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for queue.shift() — Identifier named queue', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'queue' }, 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.shift() — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].pop() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'pop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].push(1) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'push', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].unshift(1) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'unshift', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].slice() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'shift' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'shift'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'shift' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Shift" with uppercase S', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'Shift'))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryShiftRule.create(ctx1)
      const visitor2 = noUnnecessaryShiftRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'shift'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryShiftRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'shift'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'shift'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'shift'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryShiftRule.create(context)
      const visitor2 = noUnnecessaryShiftRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryShiftRule.meta
      const meta2 = noUnnecessaryShiftRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryShiftRule).toBeDefined()
      expect(typeof noUnnecessaryShiftRule.create).toBe('function')
      expect(typeof noUnnecessaryShiftRule.meta).toBe('object')
    })
  })
})
