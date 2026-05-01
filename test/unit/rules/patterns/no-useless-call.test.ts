import { describe, expect, test, vi } from 'vitest'
import { noUselessCallRule } from '../../../../src/rules/patterns/no-useless-call.js'
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
    getSource: () => '',
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
  calleeType: string,
  calleePropertyType: string,
  calleePropertyName: string,
  calleeObjectType: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: calleeType,
      property: {
        type: calleePropertyType,
        name: calleePropertyName,
        loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
      },
      object: {
        type: calleeObjectType,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
      },
      loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-useless-call rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessCallRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessCallRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessCallRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessCallRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessCallRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning call or apply', () => {
      const desc = noUselessCallRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/call|apply/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessCallRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-call',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessCallRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessCallRule).toBeDefined()
      expect(noUselessCallRule.meta).toBeDefined()
      expect(noUselessCallRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS USELESS .call() (20) =====

  describe('positive cases — reports useless .call()', () => {
    test('reports FunctionExpression .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports ArrowFunctionExpression .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'ArrowFunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionExpression .apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('reports ArrowFunctionExpression .apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('report message for .call() mentions "call"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0].message).toContain('.call()')
    })

    test('report message for .apply() mentions "apply"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'FunctionExpression'))
      expect(reports[0].message).toContain('.apply()')
    })

    test('report message says "Call the function directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0].message).toContain('Call the function directly.')
    })

    test('report message for .call() is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0].message).toBe(
        "Unnecessary '.call()' invocation. Call the function directly.",
      )
    })

    test('report message for .apply() is exact', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports[0].message).toBe(
        "Unnecessary '.apply()' invocation. Call the function directly.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for arrow function .call() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = makeCallNode('MemberExpression', 'Identifier', 'call', 'ArrowFunctionExpression')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for function expression .apply() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = makeCallNode('MemberExpression', 'Identifier', 'apply', 'FunctionExpression')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports.length).toBe(2)
    })

    test('call and apply reports have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'FunctionExpression'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('reports for .call() at specific loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression', 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports only once per CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports.length).toBe(1)
    })

    test('all call reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'ArrowFunctionExpression'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all apply reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'FunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when callee is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is bind', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'bind', 'FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'forEach', 'FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'map', 'FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Identifier with .call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Identifier with .apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'apply' },
          object: { type: 'Identifier', name: 'fn' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node type other than CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Literal', value: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'CallExpression', callee: {}, arguments: [] },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'Literal', value: 42 },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'MemberExpression', object: {}, property: {} },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'ThisExpression' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({ type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'toString', 'FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', '', 'FunctionExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'invalid',
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessCallRule.create(ctx1)
      const visitor2 = noUselessCallRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor2.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'bind', 'FunctionExpression'))
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessCallRule.create(context)
      const visitor2 = noUselessCallRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUselessCallRule.meta
      const meta2 = noUselessCallRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
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

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUselessCallRule).toBeDefined()
      expect(typeof noUselessCallRule.create).toBe('function')
      expect(typeof noUselessCallRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression', 10, 4, 12, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'call', 'FunctionExpression'))
      visitor.CallExpression(makeCallNode('MemberExpression', 'Identifier', 'apply', 'ArrowFunctionExpression'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('.call()')
      expect(reports[1].message).toContain('.apply()')
    })

    test('handles arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'ArrowFunctionExpression', params: [], body: { type: 'Identifier', name: 'x' } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles function with async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', async: true, params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles arrow function with async property and .apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'apply' },
          object: { type: 'ArrowFunctionExpression', async: true, params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when object type is ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'ClassExpression', body: { type: 'ClassBody', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'apply' },
          object: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not crash on deeply nested node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [{ type: 'Identifier', name: 'a' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: null }] } },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles computed MemberExpression property (still reports if name matches)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCallRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          property: { type: 'Identifier', name: 'call' },
          object: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
