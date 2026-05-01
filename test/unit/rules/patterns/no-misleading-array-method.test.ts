import { describe, expect, test, vi } from 'vitest'
import { noMisleadingArrayMethodRule } from '../../../../src/rules/patterns/no-misleading-array-method.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'arr.forEach(() => { return; })',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeForEachBareReturn(overrides: Record<string, unknown> = {}): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      property: { type: 'Identifier', name: 'forEach' },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: null }],
      },
    }],
    _parent: { type: 'ExpressionStatement' },
    loc: makeLoc(1, 0, 1, 25),
    ...overrides,
  }
}

function makeMisleadingCall(methodName: string, parentType = 'ExpressionStatement'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [{
      type: 'ArrowFunctionExpression',
      body: { type: 'Identifier', name: 'x' },
    }],
    _parent: { type: parentType },
    loc: makeLoc(1, 0, 1, 20),
  }
}

describe('no-misleading-array-method rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMisleadingArrayMethodRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMisleadingArrayMethodRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMisleadingArrayMethodRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMisleadingArrayMethodRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMisleadingArrayMethodRule.meta.docs?.description).toBeTruthy()
    })

    test('should have correct docs URL', () => {
      expect(noMisleadingArrayMethodRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misleading-array-method',
      )
    })

    test('should have empty schema', () => {
      expect(noMisleadingArrayMethodRule.meta.schema).toEqual([])
    })

    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('default export matches named export', () => {
      expect(noMisleadingArrayMethodRule).toBeDefined()
      expect(noMisleadingArrayMethodRule.meta).toBeDefined()
      expect(noMisleadingArrayMethodRule.create).toBeDefined()
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMisleadingArrayMethodRule.create(context)
      const visitor2 = noMisleadingArrayMethodRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ===== forEach POSITIVE CASES (15) =====
  describe('forEach with bare return - reports', () => {
    test('reports forEach with arrow fn bare return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports.length).toBe(1)
    })

    test('report message mentions forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0].message).toContain('forEach')
    })

    test('report message suggests some/every/find alternatives', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0].message).toContain('some')
      expect(reports[0].message).toContain('every')
      expect(reports[0].message).toContain('find')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeForEachBareReturn()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('forEach bare return with single statement in block', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('forEach')
    })

    test('forEach bare return with multiple statements first is bare return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      const body = callback.body as Record<string, unknown>
      body.body = [
        { type: 'ReturnStatement', argument: null },
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } },
      ]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach bare return with non-ExpressionStatement parent still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn({ _parent: { type: 'VariableDeclarator' } }))
      expect(reports.length).toBe(1)
    })

    test('forEach bare return message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0].message).toBe(
        "Avoid using 'forEach' with an early return. Consider using 'some', 'every', or 'find' instead for clarity.",
      )
    })

    test('forEach bare return reports once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports.length).toBe(1)
    })

    test('forEach with StringLiteral property name reports bare return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn({
        callee: {
          type: 'MemberExpression',
          property: { type: 'StringLiteral', value: 'forEach' },
        },
      }))
      expect(reports.length).toBe(1)
    })

    test('forEach bare return with arrow fn having params', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'item' }, { type: 'Identifier', name: 'index' }],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach bare return with nested block in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports.length).toBe(1)
    })

    test('forEach bare return with undefined parent still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn({ _parent: undefined }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== forEach NEGATIVE CASES (10) =====
  describe('forEach - does NOT report', () => {
    test('forEach with return value not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      const body = callback.body as Record<string, unknown>
      const stmts = body.body as Record<string, unknown>[]
      stmts[0] = { type: 'ReturnStatement', argument: { type: 'Literal', value: true } }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with arrow fn expression body not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = {
        type: 'ArrowFunctionExpression',
        body: { type: 'Identifier', name: 'x' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with FunctionExpression callback not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = {
        type: 'FunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with no arguments not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn({ arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('forEach with empty arguments array not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with arrow fn block but empty body not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      const body = callback.body as Record<string, unknown>
      body.body = []
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with return not first statement not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      const body = callback.body as Record<string, unknown>
      body.body = [
        { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
        { type: 'ReturnStatement', argument: null },
      ]
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with callback type not function not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = { type: 'Identifier', name: 'myCallback' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with arrow fn block body containing only expression not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      const body = callback.body as Record<string, unknown>
      body.body = [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }]
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with undefined argument not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = undefined
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== MISLEADING METHODS POSITIVE (20) =====
  describe('misleading methods with discarded return - reports', () => {
    test('reports map with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports.length).toBe(1)
    })

    test('reports filter with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('filter'))
      expect(reports.length).toBe(1)
    })

    test('reports reduce with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('reduce'))
      expect(reports.length).toBe(1)
    })

    test('reports reduceRight with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports find with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('find'))
      expect(reports.length).toBe(1)
    })

    test('reports findIndex with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('findIndex'))
      expect(reports.length).toBe(1)
    })

    test('reports some with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('some'))
      expect(reports.length).toBe(1)
    })

    test('reports every with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('every'))
      expect(reports.length).toBe(1)
    })

    test('reports flatMap with expression body and ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('flatMap'))
      expect(reports.length).toBe(1)
    })

    test('map report message mentions the method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0].message).toContain('map')
    })

    test('map report message suggests forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0].message).toContain('forEach')
    })

    test('map report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0].loc).toBeDefined()
    })

    test('map report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0].node).toBeDefined()
    })

    test('map report node is the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeMisleadingCall('map')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('filter report message is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('filter'))
      expect(reports[0].message).toContain('filter')
      expect(reports[0].message).toContain('forEach')
    })

    test('reduce report message is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('reduce'))
      expect(reports[0].message).toContain('reduce')
    })

    test('map discarded return reports once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports.length).toBe(1)
    })

    test('map with StringLiteral property name reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'StringLiteral', value: 'map' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: { type: 'Identifier', name: 'x' },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('map with expression body ExpressionStatement loc values correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeMisleadingCall('map')
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('map discarded return message is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0].message).toBe(
        "The return value of 'map()' is not used. Use 'forEach' instead if you don't need the result.",
      )
    })
  })

  // ===== MISLEADING METHODS NEGATIVE (15) =====
  describe('misleading methods - does NOT report', () => {
    test('map with block body ExpressionStatement parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with block body not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reduce with block body not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('map expression body with no parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeMisleadingCall('map')
      delete (node as Record<string, unknown>)['_parent']
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('map expression body with undefined _parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map', 'VariableDeclarator'))
      expect(reports.length).toBe(0)
    })

    test('map expression body with VariableDeclarator parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map', 'VariableDeclarator'))
      expect(reports.length).toBe(0)
    })

    test('map expression body with ReturnStatement parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map', 'ReturnStatement'))
      expect(reports.length).toBe(0)
    })

    test('map expression body with CallExpression parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map', 'CallExpression'))
      expect(reports.length).toBe(0)
    })

    test('map expression body with ConditionalExpression parent not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map', 'ConditionalExpression'))
      expect(reports.length).toBe(0)
    })

    test('unknown method not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('customMethod'))
      expect(reports.length).toBe(0)
    })

    test('push method not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('push'))
      expect(reports.length).toBe(0)
    })

    test('pop method not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('pop'))
      expect(reports.length).toBe(0)
    })

    test('includes method not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('includes'))
      expect(reports.length).toBe(0)
    })

    test('indexOf method not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('indexOf'))
      expect(reports.length).toBe(0)
    })

    test('map with no arguments not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====
  describe('edge cases', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('handles CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles MemberExpression with no property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles property with empty name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: '' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('node without loc still reports forEach bare return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeForEachBareReturn()
      delete (node as Record<string, unknown>)['loc']
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports map discarded return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeMisleadingCall('map')
      delete (node as Record<string, unknown>)['loc']
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('separate create calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisleadingArrayMethodRule.create(ctx1)
      const visitor2 = noMisleadingArrayMethodRule.create(ctx2)
      visitor1.CallExpression(makeForEachBareReturn())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('accumulates reports correctly across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      visitor.CallExpression(makeMisleadingCall('map'))
      visitor.CallExpression(makeMisleadingCall('filter'))
      expect(reports.length).toBe(3)
    })

    test('multiple forEach bare returns accumulate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      visitor.CallExpression(makeForEachBareReturn())
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports.length).toBe(3)
    })

    test('multiple map discarded calls accumulate', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      visitor.CallExpression(makeMisleadingCall('map'))
      visitor.CallExpression(makeMisleadingCall('push'))
      visitor.CallExpression(makeMisleadingCall('filter'))
      expect(reports.length).toBe(3)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = makeForEachBareReturn()
      Object.assign(node, { range: [0, 25], extra: true })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'forEach' },
        },
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee with computed property true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: null }],
          },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles arrow fn body being null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      callback.body = null
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles arrow fn body being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      callback.body = undefined
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles arguments array with undefined first element', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node: Record<string, unknown> = makeForEachBareReturn()
      const args = node.arguments as Record<string, unknown>[]
      args[0] = undefined
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMisleadingArrayMethodRule.meta
      const meta2 = noMisleadingArrayMethodRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties for forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report descriptor has all expected properties for map', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeMisleadingCall('map'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('forEach bare return with ExpressionStatement parent does not double report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      visitor.CallExpression(makeForEachBareReturn({ _parent: { type: 'ExpressionStatement' } }))
      expect(reports.length).toBe(1)
    })

    test('forEach with StringLiteral empty value not reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingArrayMethodRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'StringLiteral', value: '' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: null }],
          },
        }],
        _parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
