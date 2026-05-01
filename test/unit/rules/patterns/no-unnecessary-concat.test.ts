import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryConcatRule } from '../../../../src/rules/patterns/no-unnecessary-concat.js'
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
    getSource: () => '"a" + "b"',
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

function makeBinaryConcat(
  leftVal: unknown = 'a',
  rightVal: unknown = 'b',
  leftType = 'Literal',
  rightType = 'Literal',
  op = '+',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator: op,
    left: { type: leftType, value: leftVal },
    right: { type: rightType, value: rightVal },
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-unnecessary-concat rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryConcatRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryConcatRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConcatRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryConcatRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning concatenation and literal', () => {
      const desc = noUnnecessaryConcatRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/concatenat/)
      expect(desc).toMatch(/literal/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryConcatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-concat',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConcatRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryConcatRule).toBeDefined()
      expect(noUnnecessaryConcatRule.meta).toBeDefined()
      expect(noUnnecessaryConcatRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports string + string', () => {
    test('reports "a" + "b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports.length).toBe(1)
    })

    test('reports "hello" + " world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('hello', ' world'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message contains "concatenation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports[0].message.toLowerCase()).toContain('concatenat')
    })

    test('message contains "single string literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports[0].message.toLowerCase()).toContain('single string literal')
    })

    test('message contains joined string "ab"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      expect(reports[0].message).toContain('"ab"')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      const node = makeBinaryConcat()
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      visitor.BinaryExpression(makeBinaryConcat('e', 'f'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('x', 'y', 'Literal', 'Literal', '+', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports "" + "b" — empty string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('', 'b'))
      expect(reports.length).toBe(1)
    })

    test('reports "a" + "" — empty string right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', ''))
      expect(reports.length).toBe(1)
    })

    test('reports "" + "" — both empty strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('', ''))
      expect(reports.length).toBe(1)
    })

    test('message contains left value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('foo', 'bar'))
      expect(reports[0].message).toContain('"foo"')
    })

    test('message contains right value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('foo', 'bar'))
      expect(reports[0].message).toContain('"bar"')
    })

    test('reports "hello" + " world" with correct joined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('hello', ' world'))
      expect(reports[0].message).toContain('"hello world"')
    })

    test('reports with special characters in strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('foo\n', '\tbar'))
      expect(reports.length).toBe(1)
    })

    test('reports with unicode strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('hello', '世界'))
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report "a" + variable — right is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report variable + "b" — left is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 1 + 2 — both numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(1, 2))
      expect(reports.length).toBe(0)
    })

    test('does not report "a" + 1 — left string, right number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 1))
      expect(reports.length).toBe(0)
    })

    test('does not report 1 + "b" — left number, right string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(1, 'b'))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '*'))
      expect(reports.length).toBe(0)
    })

    test('does not report for - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '-'))
      expect(reports.length).toBe(0)
    })

    test('does not report for / operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '/'))
      expect(reports.length).toBe(0)
    })

    test('does not report for === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '==='))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left value is boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(true, 'b'))
      expect(reports.length).toBe(0)
    })

    test('does not report when right value is boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when both values are boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(true, false))
      expect(reports.length).toBe(0)
    })

    test('does not report when left value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(null, 'b'))
      expect(reports.length).toBe(0)
    })

    test('does not report when right value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', null))
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'LogicalExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null AST node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: null,
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null AST node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'TemplateLiteral', expressions: [], quasis: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: undefined },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for % operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '%'))
      expect(reports.length).toBe(0)
    })

    test('does not report for < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '<'))
      expect(reports.length).toBe(0)
    })

    test('does not report for > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '>'))
      expect(reports.length).toBe(0)
    })

    test('does not report for != operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '!='))
      expect(reports.length).toBe(0)
    })

    test('does not report for && operator (non-BinaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } },
        right: { type: 'Literal', value: 'c' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryConcatRule.create(ctx1)
      const visitor2 = noUnnecessaryConcatRule.create(ctx2)

      visitor1.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor2.BinaryExpression({
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryConcatRule.create(context)
      const visitor2 = noUnnecessaryConcatRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat(1, 2))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      visitor.BinaryExpression(makeBinaryConcat('a', 'b', 'Literal', 'Literal', '*'))
      visitor.BinaryExpression(makeBinaryConcat('e', 'f'))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat())
      visitor.BinaryExpression(makeBinaryConcat())
      visitor.BinaryExpression(makeBinaryConcat())
      expect(reports.length).toBe(3)
    })

    test('handles node with missing operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing left value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing right value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('visitor with 4 accumulated violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      visitor.BinaryExpression(makeBinaryConcat('e', 'f'))
      visitor.BinaryExpression(makeBinaryConcat('g', 'h'))
      expect(reports.length).toBe(4)
    })

    test('visitor BinaryExpression is callable and returns void', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      const result = visitor.BinaryExpression(makeBinaryConcat())
      expect(result).toBeUndefined()
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('two violations have different messages for different strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('message for "x" + "y" contains "xy"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('x', 'y'))
      expect(reports[0].message).toContain('"xy"')
    })

    test('rule meta is same reference across accesses', () => {
      const meta1 = noUnnecessaryConcatRule.meta
      const meta2 = noUnnecessaryConcatRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule export has create function', () => {
      expect(typeof noUnnecessaryConcatRule.create).toBe('function')
    })

    test('rule export has meta object', () => {
      expect(typeof noUnnecessaryConcatRule.meta).toBe('object')
    })

    test('reports long string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      const longLeft = 'a'.repeat(200)
      const longRight = 'b'.repeat(200)
      visitor.BinaryExpression(makeBinaryConcat(longLeft, longRight))
      expect(reports.length).toBe(1)
    })

    test('message for special chars contains escaped values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('tab\there', 'new\nline'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('tab\there')
      expect(reports[0].message).toContain('new\nline')
    })

    test('does not report when left is number, right is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(42, 99))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is number float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat(3.14, 'pi'))
      expect(reports.length).toBe(0)
    })

    test('reports single-char strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('x', 'y'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"xy"')
    })

    test('does not report VariableDeclarator node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports with whitespace-only strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('   ', '\t\n'))
      expect(reports.length).toBe(1)
    })

    test('does not report when left is BigInt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: BigInt(1), bigint: '1' },
        right: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('message format matches expected structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('foo', 'bar'))
      const msg = reports[0].message
      expect(msg).toMatch(/^Unnecessary concatenation/)
      expect(msg).toContain('Use a single string literal instead')
    })

    test('all reports from same context are independent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConcatRule.create(context)
      visitor.BinaryExpression(makeBinaryConcat('a', 'b'))
      visitor.BinaryExpression(makeBinaryConcat('c', 'd'))
      expect(reports[0].node).not.toBe(reports[1].node)
    })
  })
})
