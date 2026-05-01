import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryThrowNewRule } from '../../../../src/rules/patterns/no-unnecessary-throw-new.js'
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
    getSource: () => 'throw new Error("msg")',
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

function makeNewExpr(
  calleeName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeThrowNode(argument: unknown, loc = makeLoc(1, 0, 1, 25)): unknown {
  return {
    type: 'ThrowStatement',
    argument,
    loc,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-throw-new rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryThrowNewRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryThrowNewRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryThrowNewRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryThrowNewRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryThrowNewRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unnecessary new in throw', () => {
      const desc = noUnnecessaryThrowNewRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/new/)
      expect(desc).toMatch(/throw/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryThrowNewRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-throw-new.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryThrowNewRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ThrowStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(visitor).toHaveProperty('ThrowStatement')
      expect(typeof visitor.ThrowStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryThrowNewRule).toBeDefined()
      expect(noUnnecessaryThrowNewRule.meta).toBeDefined()
      expect(noUnnecessaryThrowNewRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary new in throw', () => {
    test('reports for throw new Error("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new TypeError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new RangeError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('RangeError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new SyntaxError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('SyntaxError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new ReferenceError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('ReferenceError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new URIError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('URIError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new EvalError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('EvalError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error')))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error(identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Identifier', name: 'msg' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error(a, b) with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'msg' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new TypeError() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError')))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new RangeError(identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('RangeError', [{ type: 'Identifier', name: 'err' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new SyntaxError with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('SyntaxError', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getMessage' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error with numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 42 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'err: ' }, right: { type: 'Identifier', name: 'msg' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for throw new Error with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'ObjectExpression', properties: [] }])))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary new', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toMatch(/new/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toBe(
        "Unnecessary 'new' in throw statement. throw Error() is equivalent.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const newExpr = makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])
      visitor.ThrowStatement(makeThrowNode(newExpr))
      expect(reports[0].node).toBe(newExpr)
    })

    test('report loc values are preserved from NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }], 5, 10, 5, 30)))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'a' }])))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError', [{ type: 'Literal', value: 'b' }])))
      expect(reports.length).toBe(2)
    })

    test('all reports for same error type have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'a' }])))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'b' }])))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report for Error includes "Error" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('Error')
    })

    test('report for TypeError includes "TypeError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('TypeError')
    })

    test('report for RangeError includes "RangeError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('RangeError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('RangeError')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for throw Error("msg") without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw err (identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'Identifier', name: 'err' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw { message: "msg" } (object literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new CustomError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('CustomError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new MyError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('MyError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new AppError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('AppError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new AssertionError("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('AssertionError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      expect(() => visitor.ThrowStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'ExpressionStatement', expression: {} })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'ThrowStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'ThrowStatement', argument: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'Identifier', name: 'err' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is CallExpression (not NewExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'Literal', value: 'error' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'err' }, property: { type: 'Identifier', name: 'msg' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'errors' }, property: { type: 'Identifier', name: 'Custom' } },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 30),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "error" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('error', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "ERROR" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('ERROR', [{ type: 'Literal', value: 'msg' }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not ThrowStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'NewExpression',
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'NewExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Promise', [])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Array', [])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Map', [])))
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Set', [])))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryThrowNewRule.create(ctx1)
      const visitor2 = noUnnecessaryThrowNewRule.create(ctx2)
      visitor1.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'a' }])))
      visitor2.ThrowStatement(makeThrowNode({ type: 'Identifier', name: 'err' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'a' }])))
      visitor.ThrowStatement(makeThrowNode({ type: 'Identifier', name: 'err' }))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError', [{ type: 'Literal', value: 'b' }])))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]),
      }
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]),
      }
      visitor.ThrowStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({ type: 'Identifier', name: 'err' }))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'a' }])))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('CustomError', [{ type: 'Literal', value: 'b' }])))
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('TypeError', [{ type: 'Literal', value: 'c' }])))
      visitor.ThrowStatement(makeThrowNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryThrowNewRule.create(context)
      const visitor2 = noUnnecessaryThrowNewRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryThrowNewRule.meta
      const meta2 = noUnnecessaryThrowNewRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]),
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: newExpr,
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      const node = makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]))
      visitor.ThrowStatement(node)
      visitor.ThrowStatement(node)
      visitor.ThrowStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryThrowNewRule).toBeDefined()
      expect(typeof noUnnecessaryThrowNewRule.create).toBe('function')
      expect(typeof noUnnecessaryThrowNewRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }]),
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg' }], 10, 4, 10, 25)))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles callee identifier with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error', loc: makeLoc(1, 6, 1, 11), range: [6, 11] },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 25),
      }))
      expect(reports.length).toBe(1)
    })

    test('handles argument with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('Error', [{ type: 'Literal', value: 'msg', loc: makeLoc(1, 12, 1, 17), range: [12, 17] }])))
      expect(reports.length).toBe(1)
    })

    test('report for SyntaxError includes "SyntaxError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('SyntaxError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('SyntaxError')
    })

    test('report for ReferenceError includes "ReferenceError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('ReferenceError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('ReferenceError')
    })

    test('report for URIError includes "URIError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('URIError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('URIError')
    })

    test('report for EvalError includes "EvalError" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThrowNewRule.create(context)
      visitor.ThrowStatement(makeThrowNode(makeNewExpr('EvalError', [{ type: 'Literal', value: 'msg' }])))
      expect(reports[0].message).toContain('EvalError')
    })
  })
})
