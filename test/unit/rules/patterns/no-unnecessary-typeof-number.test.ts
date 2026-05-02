import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTypeofNumberRule } from '../../../../src/rules/patterns/no-unnecessary-typeof-number.js'
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
    getSource: () => 'typeof 42 === "number"',
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

function makeTypeofNumberBinary(
  operator: string,
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left: {
      type: 'UnaryExpression',
      operator: 'typeof',
      argument,
    },
    right: {
      type: 'StringLiteral',
      value: 'number',
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeReversedTypeofNumberBinary(
  operator: string,
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left: {
      type: 'StringLiteral',
      value: 'number',
    },
    right: {
      type: 'UnaryExpression',
      operator: 'typeof',
      argument,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-typeof-number rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning typeof and number', () => {
      const desc = noUnnecessaryTypeofNumberRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/typeof/)
      expect(desc).toMatch(/number/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-number.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTypeofNumberRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTypeofNumberRule).toBeDefined()
      expect(noUnnecessaryTypeofNumberRule.meta).toBeDefined()
      expect(noUnnecessaryTypeofNumberRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary typeof number', () => {
    test('reports for typeof 42 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 0 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 3.14 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof -1 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 1e5 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 1e5 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 0.5 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 0.5 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 42n === "number" (BigIntLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 42n }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 0n === "number" (BigIntLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 0n }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 999n === "number" (BigIntLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 999n }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 42 !== "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'NumericLiteral', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 3.14 !== "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 42n !== "number" (BigIntLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'BigIntLiteral', value: 42n }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" === typeof 42 (reversed order)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" !== typeof 3.14 (reversed, !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('!==', { type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" === typeof 42n (reversed, BigIntLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 42n }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" !== typeof 0 (reversed, !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('!==', { type: 'NumericLiteral', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary typeof check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0].message).toMatch(/typeof/)
    })

    test('report message mentions number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0].message).toMatch(/number/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0].message).toBe(
        'Unnecessary typeof check on a numeric literal. typeof of a number literal is always "number".',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      const node = makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 })
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'BigIntLiteral', value: 42n }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for typeof NaN === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: NaN }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof Infinity === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: Infinity }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof -0 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: -0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 1e-7 === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 1e-7 }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 100 === "number" with specific loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 100 }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for typeof 123n !== "number" (BigIntLiteral with !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'BigIntLiteral', value: 123n }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" !== typeof 42n (reversed BigIntLiteral with !==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('!==', { type: 'BigIntLiteral', value: 42n }))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" === typeof 0n (reversed BigIntLiteral zero)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 0n }))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof 1 === "number" (minimal numeric literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 1 }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (37) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for typeof x === "number" (variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x !== "number" (variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 === "string" (wrong string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'string',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 == "number" (loose equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 != "number" (loose inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!=',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 + "number" (not a comparison)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 > "number" (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 < "number" (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '<',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === "string" (variable, wrong string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        right: {
          type: 'StringLiteral',
          value: 'string',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof "hello" === "number" (string literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'StringLiteral', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true === "number" (boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof null === "number" (null literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NullLiteral', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof undefined === "number" (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof [] === "number" (array expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof {} === "number" (object expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof fn() === "number" (call expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'StringLiteral', value: 'number' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: null,
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right side is not StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: { type: 'Identifier', name: 'number' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left/right are missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: { type: 'StringLiteral', value: 'number' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'UnaryExpression', operator: 'typeof', argument: { type: 'NumericLiteral', value: 42 } },
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 === "undefined" (wrong string value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'undefined',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 === "boolean" (wrong string value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'boolean',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with wrong operator (void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (12) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTypeofNumberRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeofNumberRule.create(ctx2)
      visitor1.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor2.BinaryExpression(makeTypeofNumberBinary('===', { type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'Identifier', name: 'x' }))
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'Identifier', name: 'x' }))
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'BigIntLiteral', value: 42n }))
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: { type: 'StringLiteral', value: 'number' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.BinaryExpression(makeTypeofNumberBinary('!==', { type: 'NumericLiteral', value: 0 }))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTypeofNumberRule.create(context)
      const visitor2 = noUnnecessaryTypeofNumberRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTypeofNumberRule.meta
      const meta2 = noUnnecessaryTypeofNumberRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
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
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      const node = makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression(makeTypeofNumberBinary('===', { type: 'NumericLiteral', value: 42 }))
      visitor.BinaryExpression(makeReversedTypeofNumberBinary('!==', { type: 'BigIntLiteral', value: 42n }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofNumberRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'NumericLiteral', value: 42 },
        },
        right: {
          type: 'StringLiteral',
          value: 'number',
        },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })
  })
})
