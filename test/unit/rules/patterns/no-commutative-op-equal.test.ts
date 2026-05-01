import { describe, expect, test, vi } from 'vitest'
import { noCommutativeOpEqualRule } from '../../../../src/rules/patterns/no-commutative-op-equal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => '"x" + "x"',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function makeBinExpr(
  op: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator: op,
    left,
    right,
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-commutative-op-equal rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noCommutativeOpEqualRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noCommutativeOpEqualRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noCommutativeOpEqualRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noCommutativeOpEqualRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noCommutativeOpEqualRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning commutative or identical', () => {
      const desc =
        noCommutativeOpEqualRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/commutative|identical/)
    })

    test('should have correct docs URL', () => {
      expect(noCommutativeOpEqualRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-commutative-op-equal',
      )
    })

    test('should have empty schema', () => {
      expect(noCommutativeOpEqualRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noCommutativeOpEqualRule).toBeDefined()
      expect(noCommutativeOpEqualRule.meta).toBeDefined()
      expect(noCommutativeOpEqualRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — IDENTICAL OPERANDS (15) =====
  describe('positive cases — reports identical operands', () => {
    test('reports "x" + "x" — identical string literals with +', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports.length).toBe(1)
    })

    test('reports 1 + 1 — identical number literals with +', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports "a" * "a" — identical with *', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral('a'), makeLiteral('a')))
      expect(reports.length).toBe(1)
    })

    test('reports 1 == 1 — identical with ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 === 1 — identical with ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 != 1 — identical with !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 !== 1 — identical with !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 & 1 — identical with &', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 | 1 — identical with |', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('|', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports 1 ^ 1 — identical with ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('^', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('identical message contains "identical" and the operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).toContain('+')
    })

    test('identical message contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('hello'), makeLiteral('hello')))
      expect(reports[0].message).toContain('hello')
    })

    test('reports true === true — identical boolean literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeLiteral(true), makeLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports null == null — identical null literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeLiteral(null), makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports 0 === 0 — zero values identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeLiteral(0), makeLiteral(0)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — ANAGRAM (6) =====
  describe('positive cases — reports string anagrams', () => {
    test('reports "ab" + "ba" — anagram pair', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
    })

    test('reports "abc" + "cba" — anagram pair', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('abc'), makeLiteral('cba')))
      expect(reports.length).toBe(1)
    })

    test('anagram message mentions "anagram"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports[0].message).toContain('anagram')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports[0].loc).toBeDefined()
    })

    test('multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral(1), makeLiteral(1)))
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(3)
    })

    test('reports "" + "" — empty strings identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(''), makeLiteral('')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DIFFERENT VALUES (5) =====
  describe('negative cases — different values do NOT report', () => {
    test('does NOT report 1 + 2 — different values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(2)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report "a" + "b" — different strings, not anagrams', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral('b')))
      expect(reports.length).toBe(0)
    })

    test('does NOT report "a" + "bc" — not anagrams (different lengths)', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral('bc')))
      expect(reports.length).toBe(0)
    })

    test('does NOT report "ab" + "abc" — different lengths', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('abc')))
      expect(reports.length).toBe(0)
    })

    test('does NOT report true !== false — different boolean values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeLiteral(true), makeLiteral(false)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-LITERAL OPERANDS (5) =====
  describe('negative cases — non-literal operands do NOT report', () => {
    test('does NOT report x + x — Identifier, not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(
        makeBinExpr('+', { type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does NOT report x + 1 — left is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(
        makeBinExpr('+', { type: 'Identifier', name: 'x' }, makeLiteral(1)),
      )
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 + x — right is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(
        makeBinExpr('+', makeLiteral(1), { type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does NOT report f() + f() — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const callExpr = { type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] }
      visitor.BinaryExpression(makeBinExpr('+', callExpr, callExpr))
      expect(reports.length).toBe(0)
    })

    test('does NOT report "a" + 1 — different types, different values', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-COMMUTATIVE OPERATORS (8) =====
  describe('negative cases — non-commutative operators do NOT report', () => {
    test('does NOT report 1 - 1 — operator "-" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('-', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 / 1 — operator "/" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('/', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 < 1 — operator "<" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 > 1 — operator ">" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('>', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 <= 1 — operator "<=" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<=', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 % 1 — operator "%" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('%', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 >= 1 — operator ">=" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('>=', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('does NOT report 1 << 1 — operator "<<" not commutative', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('<<', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — EDGE CASES (10) =====
  describe('negative cases — edge cases do NOT report', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report non-BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report "a" + "b" — length 1 strings not checked for anagram', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral('b')))
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: null,
        right: makeLiteral(1),
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with null right', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeLiteral(1),
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with null operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: null,
        left: makeLiteral(1),
        right: makeLiteral(1),
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noCommutativeOpEqualRule.create(ctx1)
      const visitor2 = noCommutativeOpEqualRule.create(ctx2)

      visitor1.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      visitor2.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral('b')))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral(1), makeLiteral(1)))
      visitor.BinaryExpression(makeBinExpr('==', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeLiteral('x'),
        right: makeLiteral('x'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x'), 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = makeBinExpr('+', makeLiteral('x'), makeLiteral('x'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports "aab" + "aba" — anagram pair with repeated chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('aab'), makeLiteral('aba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" * "ba" — string anagram with * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
    })

    test('identical check takes priority over anagram — same string reports "identical"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ab')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('identical')
      expect(reports[0].message).not.toContain('anagram')
    })

    test('anagram message contains both strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports[0].message).toContain('ab')
      expect(reports[0].message).toContain('ba')
    })

    test('anagram message contains the operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports[0].message).toContain('+')
    })

    test('multiple identical violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(1)))
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(1)))
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(3)
    })

    test('mixed identical and anagram violations both report', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('identical')
      expect(reports[1].message).toContain('anagram')
    })

    test('reports "listen" + "silent" — longer anagram pair', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('listen'), makeLiteral('silent')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('handles BinaryExpression with undefined left', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: undefined,
        right: makeLiteral(1),
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with undefined right', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeLiteral(1),
        right: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (21) =====
  describe('additional coverage', () => {
    test('reports 42 * 42 — identical number with *', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral(42), makeLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('reports 5 & 5 — identical number with &', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeLiteral(5), makeLiteral(5)))
      expect(reports.length).toBe(1)
    })

    test('reports 7 | 7 — identical number with |', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('|', makeLiteral(7), makeLiteral(7)))
      expect(reports.length).toBe(1)
    })

    test('reports 3 ^ 3 — identical number with ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('^', makeLiteral(3), makeLiteral(3)))
      expect(reports.length).toBe(1)
    })

    test('1 + 1 identical message contains "1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral(1), makeLiteral(1)))
      expect(reports[0].message).toContain('1')
    })

    test('"x" + "x" identical message contains "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports[0].message).toContain('x')
    })

    test('reports "ab" == "ba" — anagram with == operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('==', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" === "ba" — anagram with === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('===', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" != "ba" — anagram with != operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!=', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" !== "ba" — anagram with !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('!==', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" & "ba" — anagram with & operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('&', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" | "ba" — anagram with | operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('|', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('reports "ab" ^ "ba" — anagram with ^ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('^', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('identical report does NOT contain "anagram"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports[0].message).not.toContain('anagram')
    })

    test('anagram report does NOT contain "identical"', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      expect(reports[0].message).not.toContain('identical')
    })

    test('create returns new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noCommutativeOpEqualRule.create(context)
      const visitor2 = noCommutativeOpEqualRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('report has both loc and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].node).toBeDefined()
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      // reports: identical
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('x'), makeLiteral('x')))
      // does NOT report: different values
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('a'), makeLiteral('b')))
      // reports: anagram
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('ba')))
      // does NOT report: non-commutative
      visitor.BinaryExpression(makeBinExpr('-', makeLiteral(1), makeLiteral(1)))
      // reports: identical
      visitor.BinaryExpression(makeBinExpr('*', makeLiteral(1), makeLiteral(1)))
      expect(reports.length).toBe(3)
    })

    test('report node property is the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      const node = makeBinExpr('===', makeLiteral('ab'), makeLiteral('ba'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports "abcd" + "dcba" — 4-char anagram pair', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('abcd'), makeLiteral('dcba')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('anagram')
    })

    test('does NOT report "ab" + "cd" — not anagrams', () => {
      const { context, reports } = createMockContext()
      const visitor = noCommutativeOpEqualRule.create(context)
      visitor.BinaryExpression(makeBinExpr('+', makeLiteral('ab'), makeLiteral('cd')))
      expect(reports.length).toBe(0)
    })
  })
})
