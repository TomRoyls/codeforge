import { describe, expect, test, vi } from 'vitest'
import { noUseExtendNativeRule } from '../../../../src/rules/patterns/no-use-extend-native.js'
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
    getSource: () => 'Object.extend({})',
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

function makeCallExpr(
  objectName: string,
  propertyName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-use-extend-native rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUseExtendNativeRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUseExtendNativeRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUseExtendNativeRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUseExtendNativeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUseExtendNativeRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning native objects', () => {
      const desc = noUseExtendNativeRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/native/)
    })

    test('should have correct docs URL', () => {
      expect(noUseExtendNativeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-use-extend-native',
      )
    })

    test('should have empty schema', () => {
      expect(noUseExtendNativeRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUseExtendNativeRule).toBeDefined()
      expect(noUseExtendNativeRule.meta).toBeDefined()
      expect(noUseExtendNativeRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EXTEND (20) =====

  describe('positive cases — reports extend', () => {
    test('reports Object.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Function.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Function', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Boolean.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Symbol.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Symbol', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Error.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Error', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Number.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports BigInt.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('BigInt', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Math.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Math', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Date.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Date', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports String.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('String', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports RegExp.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('RegExp', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Array.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Array', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Map.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Map', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Set.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Set', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports WeakMap.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('WeakMap', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports WeakSet.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('WeakSet', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Promise', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('reports Proxy.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Proxy', 'extend'))
      expect(reports.length).toBe(1)
    })

    test('report message for Object.extend matches expected format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      expect(reports[0].message).toBe("Do not extend native object 'Object'.")
    })

    test('report message for Array.extend matches expected format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Array', 'extend'))
      expect(reports[0].message).toBe("Do not extend native object 'Array'.")
    })
  })

  // ===== POSITIVE CASES — REPORTS ASSIGN (18) =====

  describe('positive cases — reports assign', () => {
    test('reports Object.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Function.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Function', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Boolean.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Boolean', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Symbol.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Symbol', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Error.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Error', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Number.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Number', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports BigInt.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('BigInt', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Math.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Math', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Date.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Date', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports String.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('String', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports RegExp.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('RegExp', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Array.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Array', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Map.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Map', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Set.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Set', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports WeakMap.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('WeakMap', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports WeakSet.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('WeakSet', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Promise.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Promise', 'assign'))
      expect(reports.length).toBe(1)
    })

    test('reports Proxy.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Proxy', 'assign'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (6) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      const node = makeCallExpr('Object', 'extend')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message includes native object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Promise', 'extend'))
      expect(reports[0].message).toContain('Promise')
    })

    test('report message for Map.assign matches expected format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Map', 'assign'))
      expect(reports[0].message).toBe("Do not extend native object 'Map'.")
    })
  })

  // ===== NEGATIVE CASES — NON-NATIVE OBJECTS (5) =====

  describe('negative cases — non-native objects', () => {
    test('does not report for myObj.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('myObj', 'extend'))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('foo', 'assign'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyCustomClass.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('MyCustomClass', 'extend'))
      expect(reports.length).toBe(0)
    })

    test('does not report for config.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('config', 'assign'))
      expect(reports.length).toBe(0)
    })

    test('does not report for _.extend', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('_', 'extend'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — WRONG PROPERTY (5) =====

  describe('negative cases — wrong property name', () => {
    test('does not report for Object.keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'keys'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'values'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Array', 'from'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Promise', 'all'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.random', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Math', 'random'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — WRONG NODE TYPES (15) =====

  describe('negative cases — wrong node types', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'Object', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'extend' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'extend' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Object' },
          property: { type: 'Identifier', name: 'extend' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'extend' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'extend' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(42)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (13) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUseExtendNativeRule.create(ctx1)
      const visitor2 = noUseExtendNativeRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('Object', 'extend'))
      visitor2.CallExpression(makeCallExpr('myObj', 'extend'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      visitor.CallExpression(makeCallExpr('Array', 'assign'))
      visitor.CallExpression(makeCallExpr('myObj', 'extend'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'extend' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'extend' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'keys'))
      visitor.CallExpression(makeCallExpr('Array', 'extend'))
      visitor.CallExpression(makeCallExpr('myObj', 'assign'))
      visitor.CallExpression(makeCallExpr('String', 'assign'))
      visitor.CallExpression(makeCallExpr('Number', 'random'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUseExtendNativeRule.create(context)
      const visitor2 = noUseExtendNativeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUseExtendNativeRule.meta
      const meta2 = noUseExtendNativeRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Object', 'extend'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'extend' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression({
        ...makeCallExpr('Object', 'extend'),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noUseExtendNativeRule).toBeDefined()
      expect(typeof noUseExtendNativeRule.create).toBe('function')
      expect(typeof noUseExtendNativeRule.meta).toBe('object')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      const node = makeCallExpr('Object', 'extend')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(makeCallExpr('Error', 'extend', 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      visitor.CallExpression([])
      expect(reports.length).toBe(0)
    })

    test('reports all 18 native objects with extend', () => {
      const nativeNames = [
        'Object', 'Function', 'Boolean', 'Symbol', 'Error', 'Number',
        'BigInt', 'Math', 'Date', 'String', 'RegExp', 'Array',
        'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Proxy',
      ]
      const { context, reports } = createMockContext()
      const visitor = noUseExtendNativeRule.create(context)
      for (const name of nativeNames) {
        visitor.CallExpression(makeCallExpr(name, 'extend'))
      }
      expect(reports.length).toBe(18)
    })
  })
})
