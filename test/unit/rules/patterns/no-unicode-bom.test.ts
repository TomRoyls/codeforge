import { describe, expect, test, vi } from 'vitest'
import { noUnicodeBomRule } from '../../../../src/rules/patterns/no-unicode-bom.js'
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
    getSource: () => '\uFEFFhello',
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

function makeLiteral(value: unknown, line = 1, col = 0): unknown {
  const valStr = typeof value === 'string' ? value : ''
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, col, line, col + valStr.length),
  }
}

describe('no-unicode-bom rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnicodeBomRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnicodeBomRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnicodeBomRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnicodeBomRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnicodeBomRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning BOM and Unicode', () => {
      const desc = noUnicodeBomRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/bom/)
      expect(desc).toMatch(/unicode/)
    })

    test('should have correct docs URL', () => {
      expect(noUnicodeBomRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unicode-bom',
      )
    })

    test('should have empty schema', () => {
      expect(noUnicodeBomRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnicodeBomRule).toBeDefined()
      expect(noUnicodeBomRule.meta).toBeDefined()
      expect(noUnicodeBomRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports BOM at start of string', () => {
    test('reports string starting with BOM', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports.length).toBe(1)
    })

    test('reports string that is only BOM character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "BOM"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message).toContain('BOM')
    })

    test('message contains "U+FEFF"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message).toContain('U+FEFF')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = makeLiteral('\uFEFFhello')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFa'))
      visitor.Literal(makeLiteral('\uFEFFb'))
      visitor.Literal(makeLiteral('\uFEFFc'))
      expect(reports.length).toBe(3)
    })

    test('reports BOM followed by spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF   '))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by newlines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF\n\n'))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF!@#$%'))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by unicode text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF日本語'))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF🎉'))
      expect(reports.length).toBe(1)
    })

    test('reports BOM with long string content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF' + 'a'.repeat(1000)))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by a single character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFx'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports BOM created with String.fromCharCode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(String.fromCharCode(0xFEFF) + 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports.length).toBe(1)
    })

    test('reports BOM followed by whitespace-only content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF \t \n'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report clean string without BOM', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('does not report boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('does not report null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(null))
      expect(reports.length).toBe(0)
    })

    test('does not report BOM in middle of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('hello\uFEFFworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateElement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: '\uFEFFhello', cooked: '\uFEFFhello' },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 1),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(/test/))
      expect(reports.length).toBe(0)
    })

    test('does not report BOM at end of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('hello\uFEFF'))
      expect(reports.length).toBe(0)
    })

    test('does not report string that looks similar but is not BOM', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\\uFEFFhello'))
      expect(reports.length).toBe(0)
    })

    test('does not report whitespace-only string without BOM', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('   '))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnicodeBomRule.create(ctx1)
      const visitor2 = noUnicodeBomRule.create(ctx2)

      visitor1.Literal(makeLiteral('\uFEFFhello'))
      visitor2.Literal(makeLiteral('hello'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFa'))
      visitor.Literal(makeLiteral('clean'))
      visitor.Literal(makeLiteral('\uFEFFb'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('clean'))
      visitor.Literal(makeLiteral('\uFEFFbad'))
      visitor.Literal(makeLiteral('also clean'))
      visitor.Literal(makeLiteral('\uFEFFbad2'))
      visitor.Literal(makeLiteral('ok'))
      expect(reports.length).toBe(2)
    })

    test('BOM only string reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFF'))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnicodeBomRule.create(context)
      const visitor2 = noUnicodeBomRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
        loc: makeLoc(10, 4, 10, 11),
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
        loc: {},
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '\uFEFFhello',
        loc: makeLoc(1, 0, 1, 7),
        range: [0, 7],
        extra: true,
        parent: {},
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with regex property but type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: 42,
        raw: '42',
        regex: { pattern: 'test', flags: '' },
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles literal with undefined value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: undefined,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where value is a number zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral(0))
      expect(reports.length).toBe(0)
    })

    test('handles node where value is an empty object (not string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral({}))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFa'))
      visitor.Literal(makeLiteral('\uFEFFb'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all reports follow same message pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFa'))
      visitor.Literal(makeLiteral('\uFEFFb'))
      for (const r of reports) {
        expect(r.message).toContain('Unexpected Unicode BOM')
        expect(r.message).toContain('string literal')
      }
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnicodeBomRule.meta
      const meta2 = noUnicodeBomRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noUnicodeBomRule', () => {
      expect(noUnicodeBomRule).toBeDefined()
      expect(typeof noUnicodeBomRule.create).toBe('function')
      expect(typeof noUnicodeBomRule.meta).toBe('object')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message).toBe(
        'Unexpected Unicode BOM (U+FEFF) in string literal. BOM characters are usually unintentional and can cause subtle comparison bugs.',
      )
    })

    test('handles node with BOM followed by various content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello world'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected')
    })

    test('string with multiple BOMs reports once for start BOM', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello\uFEFFworld'))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      visitor.Literal(makeLiteral('\uFEFFhello'))
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports.length).toBe(3)
    })

    test('handles node where value is an empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '',
        loc: makeLoc(1, 0, 1, 0),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where value is whitespace-only string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      const node = {
        type: 'Literal',
        value: '   \t\n  ',
        loc: makeLoc(1, 0, 2, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('message mentions comparison bugs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message.toLowerCase()).toContain('comparison')
    })

    test('message mentions unintentional', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      visitor.Literal(makeLiteral('\uFEFFhello'))
      expect(reports[0].message.toLowerCase()).toContain('unintentional')
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noUnicodeBomRule.meta.docs?.description).toBe('string')
      expect(noUnicodeBomRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('BOM with string that has BOM-like hex escape literal text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnicodeBomRule.create(context)
      // The string "\\uFEFF" is a literal backslash followed by uFEFF, not actual BOM
      visitor.Literal(makeLiteral('\\uFEFF'))
      expect(reports.length).toBe(0)
    })
  })
})
