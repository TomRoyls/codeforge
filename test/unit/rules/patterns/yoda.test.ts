import { describe, expect, test, vi } from 'vitest'
import { yodaRule } from '../../../../src/rules/patterns/yoda.js'
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
    getSource: () => 'x === "hello"',
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

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

function makeNumericLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

function makeBooleanLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value }
}

function makeNullLiteral(): unknown {
  return { type: 'NullLiteral' }
}

function makeBigIntLiteral(value: string): unknown {
  return { type: 'BigIntLiteral', value }
}

function makeRegExpLiteral(pattern: string): unknown {
  return { type: 'RegExpLiteral', pattern }
}

// ===== META TESTS (8) =====

describe('yoda rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(yodaRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(yodaRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(yodaRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(yodaRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(yodaRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Yoda', () => {
      const desc = yodaRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/yoda/)
    })

    test('should have correct docs URL', () => {
      expect(yodaRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/yoda')
    })

    test('should have empty schema', () => {
      expect(yodaRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(yodaRule).toBeDefined()
      expect(yodaRule.meta).toBeDefined()
      expect(yodaRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS NON-YODA (31) =====

  describe('positive cases — reports non-Yoda condition', () => {
    test('reports identifier === StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier !== StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier == StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier != StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('count'), makeNumericLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier !== NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('count'), makeNumericLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier == NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('idx'), makeNumericLiteral(3)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier != NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('idx'), makeNumericLiteral(-1)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === BooleanLiteral true', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('flag'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === BooleanLiteral false', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('flag'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier == BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('active'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('val'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports identifier !== NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('val'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports identifier == NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('maybe'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports identifier != NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('maybe'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('big'), makeBigIntLiteral('9007199254740991n')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier !== BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('big'), makeBigIntLiteral('0n')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier === RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('regex'), makeRegExpLiteral('abc')))
      expect(reports.length).toBe(1)
    })

    test('reports identifier == RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('regex'), makeRegExpLiteral('test')))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Yoda condition', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0].message).toContain('Yoda condition')
    })

    test('report message mentions literal on left side', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0].message).toContain('literal on the left side')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0].message).toBe('Expected a Yoda condition (literal on the left side).')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      const node = makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello'), 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('reports for long identifier name === string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('veryLongVariableName'), makeStringLiteral('value')))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier === empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('str'), makeStringLiteral('')))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier === zero numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('num'), makeNumericLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier === negative numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('neg'), makeNumericLiteral(-42)))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('y'), makeNumericLiteral(1)))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report Yoda style: StringLiteral === Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('hello'), makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report Yoda style: NumericLiteral === Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeNumericLiteral(0), makeIdentifier('count')))
      expect(reports.length).toBe(0)
    })

    test('does not report Yoda style: BooleanLiteral === Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(true), makeIdentifier('flag')))
      expect(reports.length).toBe(0)
    })

    test('does not report Yoda style: NullLiteral === Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeNullLiteral(), makeIdentifier('val')))
      expect(reports.length).toBe(0)
    })

    test('does not report Yoda style: BigIntLiteral !== Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeBigIntLiteral('0n'), makeIdentifier('big')))
      expect(reports.length).toBe(0)
    })

    test('does not report Yoda style: RegExpLiteral == Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeRegExpLiteral('abc'), makeIdentifier('regex')))
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are Identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are StringLiterals', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('a'), makeStringLiteral('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are NumericLiterals', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeNumericLiteral(1), makeNumericLiteral(2)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator +', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator -', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdentifier('x'), makeNumericLiteral(5)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator *', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdentifier('x'), makeNumericLiteral(3)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator <', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdentifier('x'), makeNumericLiteral(10)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator >', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdentifier('x'), makeNumericLiteral(0)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator <=', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<=', makeIdentifier('x'), makeNumericLiteral(10)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator >=', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>=', makeIdentifier('x'), makeNumericLiteral(0)))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not BinaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is a literal and right is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('a'), makeNumericLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is a CallExpression and right is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'CallExpression', callee: {}, arguments: [] }, makeStringLiteral('hello')))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is an Identifier and right is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('a'), makeIdentifier('b')))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is MemberExpression and right is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'MemberExpression', object: {}, property: {} }, makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator !== when right is Identifier and left is literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeNumericLiteral(42), makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (24) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = yodaRule.create(ctx1)
      const visitor2 = yodaRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor2.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('a'), makeIdentifier('x')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('a'), makeIdentifier('x')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('y'), makeNumericLiteral(1)))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('a'), makeIdentifier('x')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeIdentifier('b')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('y'), makeNumericLiteral(1)))
      visitor.BinaryExpression(makeBinaryExpr('===', makeNumericLiteral(0), makeIdentifier('x')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = yodaRule.create(context)
      const visitor2 = yodaRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = yodaRule.meta
      const meta2 = yodaRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
        leadingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      const node = makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('hello'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(yodaRule).toBeDefined()
      expect(typeof yodaRule.create).toBe('function')
      expect(typeof yodaRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('y'), makeNumericLiteral(1)))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeStringLiteral('a')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('y'), makeNullLiteral()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for operator >>>', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>>>', makeIdentifier('x'), makeNumericLiteral(2)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator in', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('in', makeIdentifier('x'), makeStringLiteral('key')))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator instanceof', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('instanceof', makeIdentifier('x'), makeIdentifier('Obj')))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator %', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('%', makeIdentifier('x'), makeNumericLiteral(2)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator **', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('**', makeIdentifier('x'), makeNumericLiteral(3)))
      expect(reports.length).toBe(0)
    })

    test('does not report for operator &', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&', makeIdentifier('x'), makeNumericLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has no operator', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: makeIdentifier('x'),
        right: makeStringLiteral('hello'),
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when BinaryExpression has no left property', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        right: makeStringLiteral('hello'),
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('ESTree literal compatibility', () => {
    function makeEstreeLiteral(value: unknown): unknown {
      return { type: 'Literal', value }
    }

    test('reports x === "hello" with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeEstreeLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports x !== 42 with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeEstreeLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('reports x === null with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeEstreeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports x === true with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = yodaRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeEstreeLiteral(true)))
      expect(reports.length).toBe(1)
    })
  })
})
