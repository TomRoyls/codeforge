import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBooleanLiteralCompareRule } from '../../../../src/rules/patterns/no-unnecessary-boolean-literal-compare.js'
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
    getSource: () => 'x === true',
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
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-boolean-literal-compare rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning boolean literal', () => {
      const desc = noUnnecessaryBooleanLiteralCompareRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-boolean-literal-compare',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule).toBeDefined()
      expect(noUnnecessaryBooleanLiteralCompareRule.meta).toBeDefined()
      expect(noUnnecessaryBooleanLiteralCompareRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS BOOLEAN LITERAL COMPARE (25) =====

  describe('positive cases — reports boolean literal compare', () => {
    test('reports for x === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for x === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for true === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports for false === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: false }, { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports for x !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for x !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for true !== x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: true }, { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports for x == true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for x == false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for x != true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for x != false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for false != x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Literal', value: false }, { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports for true === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for false === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: false }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for true === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports when left is boolean literal and right is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports when right is boolean literal and left is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for flag === true with identifier name flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'flag' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for isActive !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'isActive' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for isEnabled == true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'isEnabled' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for result != false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'result' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'y' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: false }, { type: 'Identifier', name: 'y' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when left is boolean literal and right is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'UnaryExpression', operator: '!' }))
      expect(reports.length).toBe(1)
    })

    test('reports when both sides are boolean literals with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: true }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0].message).toBe('Unnecessary comparison to boolean literal.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node has type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      const node = reports[0].node as Record<string, unknown>
      expect(node.type).toBe('BinaryExpression')
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }, 3, 0, 3, 15))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report message is consistent across operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'a' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'b' }, { type: 'Literal', value: false }))
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'c' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'd' }, { type: 'Literal', value: false }))
      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
      expect(reports[2].message).toBe(reports[3].message)
    })

    test('report node preserves operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      const node = reports[0].node as Record<string, unknown>
      expect(node.operator).toBe('!==')
    })

    test('report loc values are numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }, 7, 2, 7, 12))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node preserves left and right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const left = { type: 'Identifier', name: 'x' }
      const right = { type: 'Literal', value: true }
      visitor.BinaryExpression(makeBinaryNode('===', left, right))
      const node = reports[0].node as Record<string, unknown>
      expect(node.left).toBe(left)
      expect(node.right).toBe(right)
    })

    test('report node preserves loc object from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const node = makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }, 2, 4, 2, 14)
      visitor.BinaryExpression(node)
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode.loc).toEqual(makeLoc(2, 4, 2, 14))
    })

    test('report only fires once per BinaryExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: true }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('report message contains "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('report message contains "literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports[0].message.toLowerCase()).toContain('literal')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('<', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('>', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with <= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('<=', { type: 'Literal', value: true }, { type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with >= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('>=', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === 1 (number literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === "hello" (string literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === null (null literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === y (no literals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', right: { type: 'Literal', value: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Literal', value: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with && operator and boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('&&', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBooleanLiteralCompareRule.create(ctx1)
      const visitor2 = noUnnecessaryBooleanLiteralCompareRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor2.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'z' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const node = { type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: true } }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const node = { type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: true } }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: false }, { type: 'Identifier', name: 'z' }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'p' }, { type: 'Identifier', name: 'q' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const visitor2 = noUnnecessaryBooleanLiteralCompareRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBooleanLiteralCompareRule.meta
      const meta2 = noUnnecessaryBooleanLiteralCompareRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        parentheses: true,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      const node = makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBooleanLiteralCompareRule).toBeDefined()
      expect(typeof noUnnecessaryBooleanLiteralCompareRule.create).toBe('function')
      expect(typeof noUnnecessaryBooleanLiteralCompareRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'y' }, { type: 'Literal', value: false }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: true }, 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: 'not an object', right: { type: 'Literal', value: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Literal', value: true }, right: 42, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with value being an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanLiteralCompareRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: { nested: true } }))
      expect(reports.length).toBe(0)
    })
  })
})
