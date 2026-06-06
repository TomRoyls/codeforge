import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSplitLengthRule } from '../../../../src/rules/patterns/no-unnecessary-string-split-length.js'
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

function makeSplitCall(
  calleeObject: unknown,
  argValue: string = '',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: calleeObject,
      property: { type: 'Identifier', name: 'split' },
      computed: false,
    },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeMemberExprLength(
  object: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: { type: 'Identifier', name: 'length' },
    computed: false,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-split-length rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning split', () => {
      const desc = noUnnecessaryStringSplitLengthRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/split/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-split-length.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSplitLengthRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSplitLengthRule).toBeDefined()
      expect(noUnnecessaryStringSplitLengthRule.meta).toBeDefined()
      expect(noUnnecessaryStringSplitLengthRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports str.split("").length', () => {
    test('reports for str.split("").length — Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".split("").length — StringLiteral callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({ type: 'Literal', value: 'hello' })))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.split("").length — MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().split("").length — CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'CallExpression',
        callee: makeIdentifier('getStr'),
        arguments: [],
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for text.split("").length — another Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('text'))))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).split("").length — BinaryExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'BinaryExpression',
        operator: '+',
        left: makeIdentifier('a'),
        right: makeIdentifier('b'),
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for template.split("").length — TemplateLiteral callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].split("").length — computed MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'MemberExpression',
        object: makeIdentifier('arr'),
        property: { type: 'Literal', value: 0 },
        computed: true,
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression callee (cond ? a : b).split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'ConditionalExpression',
        test: makeIdentifier('cond'),
        consequent: makeIdentifier('a'),
        alternate: makeIdentifier('b'),
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression (a || b).split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'LogicalExpression',
        operator: '||',
        left: makeIdentifier('a'),
        right: makeIdentifier('b'),
      })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions split', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports[0].message).toMatch(/split/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports[0].message).toBe(
        `str.split('').length to count characters is inefficient. Use str.length directly.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input MemberExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      const node = makeMemberExprLength(makeSplitCall(makeIdentifier('str')))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str')), 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('a'))))
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('b'))))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('a'))))
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('b'))))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for nested MemberExpression obj.a.b.split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: makeIdentifier('obj'),
          property: { type: 'Identifier', name: 'a' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'b' },
        computed: false,
      })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for unary expression callee (!x).split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'UnaryExpression',
        operator: '!',
        argument: makeIdentifier('x'),
        prefix: true,
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression (x = "abc").split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'AssignmentExpression',
        operator: '=',
        left: makeIdentifier('x'),
        right: { type: 'Literal', value: 'abc' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for await expression (await fetch()).split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'AwaitExpression',
        argument: makeIdentifier('fetch'),
      })))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), '', 10, 4, 10, 20), 10, 4, 10, 28))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports for NewExpression callee new String(x).split("").length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall({
        type: 'NewExpression',
        callee: makeIdentifier('String'),
        arguments: [makeIdentifier('x')],
      })))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.split("a").length — non-empty separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), 'a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(",").length — comma separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), ',')))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(" ").length — space separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), ' ')))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.length — direct length access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeIdentifier('str')))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("") — no .length access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'map' },
        computed: false,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("").map(...) — accessing .map not .length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'forEach' },
        computed: false,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression str["length"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: true,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property named "size" instead of "length"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'size' },
        computed: false,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property that is Literal, not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Literal', value: 'length' },
        computed: false,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not a CallExpression — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeIdentifier('arr')))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not a CallExpression — ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: makeIdentifier('split'),
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not "split" — "slice"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not "split" — "join"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'join' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is "Split" (wrong case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'Split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when split has no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when split has two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }, { type: 'Literal', value: 2 }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when split has three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }, { type: 'Literal', value: 2 }, { type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not StringLiteral — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [makeIdentifier('sep')],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal with empty string instead of StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral with non-empty value "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), 'x')))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral with newline value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'), '\n')))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        computed: false,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: null,
        computed: false,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing on object CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null on object CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: null,
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is Literal, not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Literal', value: 'split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when object of MemberExpression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object of MemberExpression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("").length when argument is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when split argument is RegExp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('str'),
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [{ type: 'RegExpLiteral', pattern: '', flags: '' }],
        loc: makeLoc(1, 0, 1, 20),
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitLengthRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSplitLengthRule.create(ctx2)
      visitor1.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      visitor2.MemberExpression(makeMemberExprLength(makeIdentifier('arr')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('str'))))
      visitor.MemberExpression(makeMemberExprLength(makeIdentifier('arr')))
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('text'))))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
      }
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSplitLengthRule.create(context)
      const visitor2 = noUnnecessaryStringSplitLengthRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSplitLengthRule.meta
      const meta2 = noUnnecessaryStringSplitLengthRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      const node = makeMemberExprLength(makeSplitCall(makeIdentifier('str')))
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSplitLengthRule).toBeDefined()
      expect(typeof noUnnecessaryStringSplitLengthRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSplitLengthRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('str')),
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly with many cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      // valid: str.split('').length
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('s1'))))
      // invalid: str.length
      visitor.MemberExpression(makeMemberExprLength(makeIdentifier('arr')))
      // valid: str.split('').length
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('s2'))))
      // invalid: str.split('a').length
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('s3'), 'a')))
      // valid: str.split('').length
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('s4'))))
      // invalid: computed member
      visitor.MemberExpression({
        type: 'MemberExpression',
        object: makeSplitCall(makeIdentifier('s5')),
        property: { type: 'Identifier', name: 'length' },
        computed: true,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(3)
    })

    test('handles chained call: str.split("").reverse().length — split result is NOT the object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      // reverse() returns an array, so this is arr.length not split('').length
      const reverseCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeSplitCall(makeIdentifier('str')),
          property: { type: 'Identifier', name: 'reverse' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.MemberExpression(makeMemberExprLength(reverseCall))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSplitLengthRule.create(context)
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('a'))))
      visitor.MemberExpression(makeMemberExprLength(makeSplitCall(makeIdentifier('b'))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
