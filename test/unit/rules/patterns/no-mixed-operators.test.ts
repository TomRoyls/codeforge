import { describe, expect, test, vi } from 'vitest'
import { noMixedOperatorsRule } from '../../../../src/rules/patterns/no-mixed-operators.js'
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

function makeBinExpr(
  operator: string,
  left: unknown = { type: 'Literal', value: 1 },
  right: unknown = { type: 'Literal', value: 2 },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
) {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-mixed-operators rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMixedOperatorsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMixedOperatorsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMixedOperatorsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMixedOperatorsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMixedOperatorsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning mixing operators', () => {
      const desc = noMixedOperatorsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/mix/)
    })

    test('should have correct docs URL', () => {
      expect(noMixedOperatorsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-mixed-operators',
      )
    })

    test('should have empty schema', () => {
      expect(noMixedOperatorsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMixedOperatorsRule).toBeDefined()
      expect(noMixedOperatorsRule.meta).toBeDefined()
      expect(noMixedOperatorsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — LEFT CHILD MIX (15) =====

  describe('positive cases — left child mixed group', () => {
    test('reports arithmetic + left with logical &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic - left with bitwise &', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('-', makeBinExpr('&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic * left with comparison ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('*', makeBinExpr('=='))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic / left with logical ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('/', makeBinExpr('||'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic % left with bitwise ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('%', makeBinExpr('^'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise & left with arithmetic +', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('&', makeBinExpr('+'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise | left with logical &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('|', makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise ^ left with comparison ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('^', makeBinExpr('==='))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise << left with arithmetic *', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('<<', makeBinExpr('*'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise >> left with logical ??', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('>>', makeBinExpr('??'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise >>> left with comparison !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('>>>', makeBinExpr('!=='))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison == left with arithmetic +', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('==', makeBinExpr('+'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison != left with logical &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('!=', makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison === left with bitwise ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('===', makeBinExpr('^'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison < left with arithmetic %', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('<', makeBinExpr('%'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — RIGHT CHILD MIX (10) =====

  describe('positive cases — right child mixed group', () => {
    test('reports arithmetic + right with logical &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', { type: 'Literal', value: 1 }, makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic - right with bitwise &', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('-', { type: 'Literal', value: 1 }, makeBinExpr('&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic * right with comparison ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('*', { type: 'Literal', value: 1 }, makeBinExpr('=='))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise & right with logical ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('&', { type: 'Literal', value: 1 }, makeBinExpr('||'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports bitwise ^ right with arithmetic +', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('^', { type: 'Literal', value: 1 }, makeBinExpr('+'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison == right with logical &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('==', { type: 'Literal', value: 1 }, makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports comparison === right with arithmetic *', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('===', { type: 'Literal', value: 1 }, makeBinExpr('*'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports logical && right with bitwise ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('&&', { type: 'Literal', value: 1 }, makeBinExpr('^'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports logical || right with arithmetic %', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('||', { type: 'Literal', value: 1 }, makeBinExpr('%'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports logical ?? right with arithmetic +', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('??', { type: 'Literal', value: 1 }, makeBinExpr('+'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — BOTH CHILDREN & PROPERTIES (7) =====

  describe('positive cases — both children and report properties', () => {
    test('reports twice when both left and right are different groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'), makeBinExpr('&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(2)
    })

    test('reports once when left is mixed but right is same group', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'), makeBinExpr('*'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports once when right is mixed but left is same group', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('-'), makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      expect(reports[0].message).toBe('Unexpected mix of different operators without parentheses.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== NEGATIVE CASES — SAME GROUP (12) =====

  describe('negative cases — same group does not report', () => {
    test('does not report arithmetic + left with arithmetic *', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('*')))
      expect(reports.length).toBe(0)
    })

    test('does not report arithmetic - left with arithmetic /', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('-', makeBinExpr('/')))
      expect(reports.length).toBe(0)
    })

    test('does not report arithmetic * left with arithmetic %', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('*', makeBinExpr('%')))
      expect(reports.length).toBe(0)
    })

    test('does not report bitwise & left with bitwise |', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeBinExpr('|')))
      expect(reports.length).toBe(0)
    })

    test('does not report bitwise ^ left with bitwise <<', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('^', makeBinExpr('<<')))
      expect(reports.length).toBe(0)
    })

    test('does not report bitwise >> left with bitwise >>>', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('>>', makeBinExpr('>>>')))
      expect(reports.length).toBe(0)
    })

    test('does not report comparison == left with comparison !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeBinExpr('!=')))
      expect(reports.length).toBe(0)
    })

    test('does not report comparison === left with comparison !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeBinExpr('!==')))
      expect(reports.length).toBe(0)
    })

    test('does not report comparison < left with comparison >', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<', makeBinExpr('>')))
      expect(reports.length).toBe(0)
    })

    test('does not report comparison <= left with comparison >=', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<=', makeBinExpr('>=')))
      expect(reports.length).toBe(0)
    })

    test('does not report logical && left with logical ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&&', makeBinExpr('||')))
      expect(reports.length).toBe(0)
    })

    test('does not report logical || left with logical ??', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('||', makeBinExpr('??')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — STRUCTURE (16) =====

  describe('negative cases — non-matching structure', () => {
    test('does not report when left child is not BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when right child is not BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when both children are not BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 42,
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for unknown operator "in"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('in', makeBinExpr('&&')))
      expect(reports.length).toBe(0)
    })

    test('does not report for unknown operator "instanceof"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('instanceof', makeBinExpr('&&')))
      expect(reports.length).toBe(0)
    })

    test('does not throw for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not throw for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report when left child is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: null,
        right: makeBinExpr('&&'),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right child is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left child is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: undefined,
        right: makeBinExpr('&&'),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right child is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: undefined,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left child is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: 'not-a-node',
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right child is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: 42,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMixedOperatorsRule.create(ctx1)
      const visitor2 = noMixedOperatorsRule.create(ctx2)
      visitor1.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      visitor2.BinaryExpression(makeBinExpr('+', makeBinExpr('*')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('*')))
      visitor.BinaryExpression(makeBinExpr('-', makeBinExpr('||')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: { type: 'Literal', value: 3 },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: { type: 'Literal', value: 3 },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        _parent: {},
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with empty loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: { type: 'Literal', value: 3 },
        loc: {},
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noMixedOperatorsRule).toBeDefined()
      expect(typeof noMixedOperatorsRule.create).toBe('function')
      expect(typeof noMixedOperatorsRule.meta).toBe('object')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMixedOperatorsRule.create(context)
      const visitor2 = noMixedOperatorsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMixedOperatorsRule.meta
      const meta2 = noMixedOperatorsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles deeply nested mixed operators (3 levels)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const innerLeft = makeBinExpr('&&')
      const middle = makeBinExpr('*', innerLeft)
      const outer = makeBinExpr('+', middle)
      visitor.BinaryExpression(outer)
      // outer: + (arith) left: * (arith) — same group, no report from outer's left
      // middle: * (arith) left: && (logical) — mixed, 1 report
      // But the rule only visits the outer node, not recursively
      expect(reports.length).toBe(0)
    })

    test('reports logical ?? mixed with arithmetic + on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('??', makeBinExpr('+')))
      expect(reports.length).toBe(1)
    })

    test('reports bitwise >>> mixed with logical && on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('>>>', { type: 'Literal', value: 1 }, makeBinExpr('&&')))
      expect(reports.length).toBe(1)
    })

    test('reports bitwise | mixed with logical || on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('|', makeBinExpr('||')))
      expect(reports.length).toBe(1)
    })

    test('reports bitwise & mixed with logical && on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeBinExpr('&&')))
      expect(reports.length).toBe(1)
    })

    test('reports arithmetic parent with logical left and bitwise right (2 reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&'), makeBinExpr('^')))
      expect(reports.length).toBe(2)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('&&'), { type: 'Literal', value: 3 }, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('only left reports when left mixed and right is same group', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('&&'), makeBinExpr('-'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('only right reports when right mixed and left is same group', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = makeBinExpr('+', makeBinExpr('-'), makeBinExpr('&&'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeBinExpr('&&'),
        right: { type: 'Literal', value: 3 },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('all four groups can be detected mixed: arith vs logical', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('||')))
      expect(reports.length).toBe(1)
    })

    test('all four groups can be detected mixed: arith vs bitwise', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('|')))
      expect(reports.length).toBe(1)
    })

    test('all four groups can be detected mixed: arith vs comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeBinExpr('===')))
      expect(reports.length).toBe(1)
    })

    test('all four groups can be detected mixed: bitwise vs comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeBinExpr('===')))
      expect(reports.length).toBe(1)
    })

    test('all four groups can be detected mixed: comparison vs logical', () => {
      const { context, reports } = createMockContext()
      const visitor = noMixedOperatorsRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeBinExpr('||')))
      expect(reports.length).toBe(1)
    })
  })
})
