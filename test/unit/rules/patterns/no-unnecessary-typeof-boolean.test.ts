import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTypeofBooleanRule } from '../../../../src/rules/patterns/no-unnecessary-typeof-boolean.js'
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

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeTypeof(argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument,
    prefix: true,
  }
}

function makeBooleanLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'StringLiteral', value }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeUnaryExpr(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-typeof-boolean rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning typeof or boolean', () => {
      const desc = noUnnecessaryTypeofBooleanRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/typeof|boolean/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-boolean.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTypeofBooleanRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTypeofBooleanRule).toBeDefined()
      expect(noUnnecessaryTypeofBooleanRule.meta).toBeDefined()
      expect(noUnnecessaryTypeofBooleanRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary typeof boolean', () => {
    test('reports typeof true === "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof false === "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof !x === "boolean" (UnaryExpression argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('!', makeIdentifier('x'))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof !!x === "boolean" (double negation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('!', makeUnaryExpr('!', makeIdentifier('x')))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof true !== "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof false !== "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof !x !== "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeUnaryExpr('!', makeIdentifier('x'))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" === typeof true (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(true))))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" === typeof false (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(false))))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" === typeof !x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('boolean'), makeTypeof(makeUnaryExpr('!', makeIdentifier('x')))))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" !== typeof true (reversed, !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(true))))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" !== typeof false (reversed, !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(false))))
      expect(reports.length).toBe(1)
    })

    test('reports "boolean" !== typeof !x (reversed, !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeStringLiteral('boolean'), makeTypeof(makeUnaryExpr('!', makeIdentifier('x')))))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary typeof', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports[0].message).toMatch(/typeof/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports[0].message).toBe(
        'Unnecessary typeof check on a boolean value. typeof of a boolean is always "boolean".',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      const node = makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean'), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeUnaryExpr('!', makeIdentifier('x'))), makeStringLiteral('boolean')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports typeof !foo() === "boolean" (unary with CallExpression arg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('!', { type: 'CallExpression', callee: makeIdentifier('foo'), arguments: [] })), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof ~x === "boolean" (unary with ~ operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('~', makeIdentifier('x'))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof -x === "boolean" (unary with - operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('-', makeIdentifier('x'))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports typeof !(a + b) === "boolean" (unary with BinaryExpression arg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('!', makeBinaryExpr('+', makeIdentifier('a'), makeIdentifier('b')))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports typeof !!true === "boolean" (double negation of boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeUnaryExpr('!', makeUnaryExpr('!', makeBooleanLiteral(true)))), makeStringLiteral('boolean')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for typeof x === "boolean" (Identifier argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeIdentifier('x')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof foo === "boolean" (Identifier argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeIdentifier('foo')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true === "string" (different comparison string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof false === "number" (different comparison string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('number')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true == "boolean" (loose equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof false != "boolean" (loose inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true === "Boolean" (case-sensitive mismatch)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('Boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === "boolean" (no typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for true === "boolean" (BooleanLiteral without typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(true), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true > "boolean" (wrong operator >)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true < "boolean" (wrong operator <)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true >= "boolean" (wrong operator >=)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>=', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true <= "boolean" (wrong operator <=)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<=', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x !== "boolean" (Identifier argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeIdentifier('x')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "boolean" == typeof true (loose equality reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(true))))
      expect(reports.length).toBe(0)
    })

    test('does not report for "string" === typeof true (different string reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('string'), makeTypeof(makeBooleanLiteral(true))))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof null === "boolean" (NullLiteral-like argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'NullLiteral', value: null }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 === "boolean" (NumericLiteral argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'NumericLiteral', value: 42 }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof "hello" === "boolean" (StringLiteral argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof obj === "boolean" (ObjectExpression argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'ObjectExpression', properties: [] }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof arr === "boolean" (ArrayExpression argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'ArrayExpression', elements: [] }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof fn() === "boolean" (CallExpression argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [] }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof (x ? y : z) === "boolean" (ConditionalExpression argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'ConditionalExpression', test: makeIdentifier('x'), consequent: makeIdentifier('y'), alternate: makeIdentifier('z') }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "number" === typeof true (wrong string literal reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('number'), makeTypeof(makeBooleanLiteral(true))))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true === typeof false (right is not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeTypeof(makeBooleanLiteral(false))))
      expect(reports.length).toBe(0)
    })

    test('does not report for !x === "boolean" (UnaryExpression without typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeUnaryExpr('!', makeIdentifier('x')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: null, right: makeStringLiteral('boolean'), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with null right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: makeTypeof(makeBooleanLiteral(true)), right: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with missing left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', right: makeStringLiteral('boolean'), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with missing right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: makeTypeof(makeBooleanLiteral(true)), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'UnaryExpression', operator: 'typeof', argument: null, prefix: true }, makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'UnaryExpression', operator: 'typeof', argument: undefined, prefix: true }, makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof with string argument (Literal type, not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Literal', value: true }), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTypeofBooleanRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeofBooleanRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor2.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeIdentifier('x')), makeStringLiteral('boolean')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeIdentifier('x')), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(false)), makeStringLiteral('boolean')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeIdentifier('x')), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeUnaryExpr('!', makeIdentifier('flag'))), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTypeofBooleanRule.create(context)
      const visitor2 = noUnnecessaryTypeofBooleanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTypeofBooleanRule.meta
      const meta2 = noUnnecessaryTypeofBooleanRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      const node = makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTypeofBooleanRule).toBeDefined()
      expect(typeof noUnnecessaryTypeofBooleanRule.create).toBe('function')
      expect(typeof noUnnecessaryTypeofBooleanRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeBooleanLiteral(true)),
        right: makeStringLiteral('boolean'),
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean'), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when left is typeof with wrong operator (not typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeUnaryExpr('!', makeIdentifier('x')), makeStringLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

    test('reports reversed with !== and UnaryExpression double negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeStringLiteral('boolean'), makeTypeof(makeUnaryExpr('!', makeUnaryExpr('!', makeIdentifier('flag'))))))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofBooleanRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeBooleanLiteral(true)), makeStringLiteral('boolean')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeStringLiteral('boolean'), makeTypeof(makeBooleanLiteral(false))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
