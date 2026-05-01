import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTypeofRule } from '../../../../src/rules/patterns/no-unnecessary-typeof.js'
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
    getSource: () => 'typeof x === "string"',
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

function makeBinaryNode(
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

function makeTypeofNode(argName: string): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument: { type: 'Identifier', name: argName },
  }
}

function makeLiteralNode(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-typeof rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTypeofRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTypeofRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTypeofRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTypeofRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTypeofRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning typeof', () => {
      const desc = noUnnecessaryTypeofRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/typeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTypeofRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-typeof',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTypeofRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTypeofRule).toBeDefined()
      expect(noUnnecessaryTypeofRule.meta).toBeDefined()
      expect(noUnnecessaryTypeofRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY TYPEOF (25) =====

  describe('positive cases — reports unnecessary typeof', () => {
    test('reports for typeof x === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('number')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x !== "symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('symbol')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "bigint"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('bigint')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x !== "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "number" with !=== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('number')))
      expect(reports.length).toBe(1)
    })

    test('reports for "string" === typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('string'), makeTypeofNode('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" !== typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeLiteralNode('number'), makeTypeofNode('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for "boolean" === typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('boolean'), makeTypeofNode('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof y === "string" with different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('y'), makeLiteralNode('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof foo === "number" with multi-char identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('foo'), makeLiteralNode('number')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof val === "symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('val'), makeLiteralNode('symbol')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof result === "bigint"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('result'), makeLiteralNode('bigint')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "string" with !=== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for "symbol" !== typeof z (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeLiteralNode('symbol'), makeTypeofNode('z')))
      expect(reports.length).toBe(1)
    })

    test('reports for "bigint" === typeof val (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('bigint'), makeTypeofNode('val')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof myVar === "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('myVar'), makeLiteralNode('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof x === "string" with specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string'), 3, 5, 3, 25))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof data !== "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('data'), makeLiteralNode('number')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof check === "boolean" with !===', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('check'), makeLiteralNode('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports for "string" === typeof result (reversed with multi-char)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('string'), makeTypeofNode('result')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof item === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('item'), makeLiteralNode('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof cfg !== "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('cfg'), makeLiteralNode('boolean')))
      expect(reports.length).toBe(1)
    })

    test('reports for "number" === typeof input (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('number'), makeTypeofNode('input')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message for "string" contains value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].message).toContain('string')
    })

    test('report message for "number" contains value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('number')))
      expect(reports[0].message).toContain('number')
    })

    test('report message for "boolean" contains value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('boolean')))
      expect(reports[0].message).toContain('boolean')
    })

    test('report message for "symbol" contains value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('symbol')))
      expect(reports[0].message).toContain('symbol')
    })

    test('report message for "bigint" contains value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('bigint')))
      expect(reports[0].message).toContain('bigint')
    })

    test('report message is exactly formatted for "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].message).toBe("Unnecessary typeof comparison for 'string'.")
    })

    test('report message is exactly formatted for "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('number')))
      expect(reports[0].message).toBe("Unnecessary typeof comparison for 'number'.")
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc reflects custom location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string'), 7, 2, 7, 22))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string'), 7, 2, 9, 5))
      expect(reports[0].loc?.end.line).toBe(9)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('report message for reversed order is same', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('string'), makeTypeofNode('x')))
      expect(reports[0].message).toBe("Unnecessary typeof comparison for 'string'.")
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains "typeof comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0].message).toContain('typeof comparison')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for typeof x === "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === "object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('object')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('function')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x !== "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x !== "object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('object')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x !== "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeTypeofNode('x'), makeLiteralNode('function')))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-typeof left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Literal right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong operator ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong operator !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong operator <', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('<', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong operator >', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('>', makeTypeofNode('x'), makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-string literal value (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode(42)))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-string literal value (boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-string literal value (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode(null)))
      expect(reports.length).toBe(0)
    })

    test('does not report for both sides being typeof', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeTypeofNode('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for both sides being literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('a'), makeLiteralNode('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for "undefined" === typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('undefined'), makeTypeofNode('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "object" !== typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', makeLiteralNode('object'), makeTypeofNode('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "function" === typeof x (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeLiteralNode('function'), makeTypeofNode('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with non-typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } }, makeLiteralNode('string')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTypeofRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeofRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      visitor2.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('undefined')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('y'), makeLiteralNode('number')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('z'), makeLiteralNode('undefined')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with location from extractLocation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('undefined')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('number')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('object')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('boolean')))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTypeofRule.create(context)
      const visitor2 = noUnnecessaryTypeofRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTypeofRule.meta
      const meta2 = noUnnecessaryTypeofRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      const node = makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTypeofRule).toBeDefined()
      expect(typeof noUnnecessaryTypeofRule.create).toBe('function')
      expect(typeof noUnnecessaryTypeofRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: makeLiteralNode('string'),
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string')))
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('y'), makeLiteralNode('number')))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe("Unnecessary typeof comparison for 'string'.")
      expect(reports[1].message).toBe("Unnecessary typeof comparison for 'number'.")
    })

    test('does not report for primitive left side (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: makeLiteralNode('string'),
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeofNode('x'),
        right: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), makeLiteralNode('string'), 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('does not report for Literal with undefined value on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', makeTypeofNode('x'), { type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })
  })
})
