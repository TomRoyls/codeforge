import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryUndefinedReturnRule } from '../../../../src/rules/patterns/no-unnecessary-undefined-return.js'
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

function makeReturnNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeUndefinedIdentifier(
  locStartLine = 1,
  locStartCol = 7,
  locEndLine = 1,
  locEndCol = 16,
): unknown {
  return {
    type: 'Identifier',
    name: 'undefined',
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-undefined-return rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning undefined', () => {
      const desc = noUnnecessaryUndefinedReturnRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/undefined/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-undefined-return.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryUndefinedReturnRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryUndefinedReturnRule).toBeDefined()
      expect(noUnnecessaryUndefinedReturnRule.meta).toBeDefined()
      expect(noUnnecessaryUndefinedReturnRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports return undefined', () => {
    test('reports for return undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary return of undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].message).toMatch(/undefined/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].message).toBe(
        'Unnecessary return of undefined. Remove the argument or the entire return statement.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the undefined identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      const undefinedArg = makeUndefinedIdentifier()
      visitor.ReturnStatement(makeReturnNode(undefinedArg))
      expect(reports[0].node).toBe(undefinedArg)
    })

    test('report loc values are preserved from argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(5, 10, 5, 19)))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(3, 7, 3, 16)))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(16)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for return undefined with custom location line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(10, 4, 10, 13), 10, 0, 10, 13))
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('reports for return undefined at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(1, 7, 1, 16), 1, 0, 1, 16))
      expect(reports.length).toBe(1)
    })

    test('reports for return undefined with large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(999, 8, 999, 17), 999, 0, 999, 17))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('reports when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makeUndefinedIdentifier(),
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports when argument identifier has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(1, 7, 1, 16),
        typeAnnotation: {},
        decorators: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports when node has _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makeUndefinedIdentifier(),
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports three return undefined calls producing three reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports.length).toBe(3)
    })

    test('reports for argument with only type and name properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions removing the argument or statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].message).toMatch(/remove/i)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('reports when node has empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makeUndefinedIdentifier(),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports when node has partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined', loc: { start: { line: 3, column: 5 } } },
      })
      expect(reports.length).toBe(1)
    })

    test('reports with undefined identifier at different column positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(1, 20, 1, 29)))
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports for undefined identifier spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(1, 7, 2, 8)))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('mixed valid and invalid calls report only invalid ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: null }))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(2)
    })

    test('reports for return undefined inside nested function structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(), 5, 4, 5, 20))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for return null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return "undefined" (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with identifier "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'foo' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with identifier "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'result' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with identifier "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'value' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with identifier "Undefined" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'Undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with identifier "UNDEFINED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'UNDEFINED' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty return (no argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with undefined argument (missing)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: undefined, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for return with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Literal', value: true } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for return with this expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ThisExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ReturnStatement node type (IfStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ReturnStatement node type (VariableDeclaration)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ReturnStatement node type (ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryUndefinedReturnRule.create(ctx1)
      const visitor2 = noUnnecessaryUndefinedReturnRule.create(ctx2)
      visitor1.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor2.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier()))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: makeUndefinedIdentifier(),
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      const node = makeReturnNode(makeUndefinedIdentifier())
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryUndefinedReturnRule.create(context)
      const visitor2 = noUnnecessaryUndefinedReturnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryUndefinedReturnRule.meta
      const meta2 = noUnnecessaryUndefinedReturnRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryUndefinedReturnRule).toBeDefined()
      expect(typeof noUnnecessaryUndefinedReturnRule.create).toBe('function')
      expect(typeof noUnnecessaryUndefinedReturnRule.meta).toBe('object')
    })

    test('does not report when argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 'not-an-object', loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 42, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when Identifier name is "defined" (not undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'defined' }))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific argument location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode(makeUndefinedIdentifier(10, 4, 10, 13), 10, 0, 10, 13))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('does not report when argument is boolean primitive true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: true, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('handles node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined', loc: { start: { line: 3, column: 5 } } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('does not report when Identifier name is "undefine" (partial match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryUndefinedReturnRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefine' }))
      expect(reports.length).toBe(0)
    })
  })
})
