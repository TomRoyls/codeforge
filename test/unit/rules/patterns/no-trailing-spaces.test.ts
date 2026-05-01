import { describe, expect, test, vi } from 'vitest'
import { noTrailingSpacesRule } from '../../../../src/rules/patterns/no-trailing-spaces.js'
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
    getSource: () => 'hello   ',
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

function makeTemplateElement(raw: string, cooked?: string, line = 1, col = 0): unknown {
  return {
    type: 'TemplateElement',
    value: { raw, cooked: cooked ?? raw },
    loc: makeLoc(line, col, line, col + raw.length),
  }
}

describe('no-trailing-spaces rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noTrailingSpacesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noTrailingSpacesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noTrailingSpacesRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noTrailingSpacesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noTrailingSpacesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning trailing and whitespace', () => {
      const desc = noTrailingSpacesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/trailing/)
      expect(desc).toMatch(/whitespace/)
    })

    test('should have correct docs URL', () => {
      expect(noTrailingSpacesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-trailing-spaces',
      )
    })

    test('should have empty schema', () => {
      expect(noTrailingSpacesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with TemplateElement', () => {
      const { context } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(visitor).toHaveProperty('TemplateElement')
      expect(typeof visitor.TemplateElement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noTrailingSpacesRule).toBeDefined()
      expect(noTrailingSpacesRule.meta).toBeDefined()
      expect(noTrailingSpacesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports trailing whitespace', () => {
    test('reports single trailing space', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports.length).toBe(1)
    })

    test('reports multiple trailing spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello   '))
      expect(reports.length).toBe(1)
    })

    test('reports trailing tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello\t'))
      expect(reports.length).toBe(1)
    })

    test('reports trailing on second line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello\nworld  '))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "trailing"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].message.toLowerCase()).toContain('trailing')
    })

    test('message contains "whitespace"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].message.toLowerCase()).toContain('whitespace')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = makeTemplateElement('hello ')
      visitor.TemplateElement(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a '))
      visitor.TemplateElement(makeTemplateElement('b\t'))
      visitor.TemplateElement(makeTemplateElement('c  '))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello  ', 'hello  ', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports.length).toBe(1)
    })

    test('reports mixed whitespace trailing (spaces and tabs)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello \t '))
      expect(reports.length).toBe(1)
    })

    test('reports trailing whitespace after newline only on first line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'foo \nbar', cooked: 'foo \nbar' },
        loc: makeLoc(1, 0, 2, 3),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('reports trailing whitespace on third line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a\nb\nc  '))
      expect(reports.length).toBe(1)
    })

    test('reports trailing carriage return + space', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello\r '))
      expect(reports.length).toBe(1)
    })

    test('reports trailing unicode whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello\u00A0'))
      expect(reports.length).toBe(1)
    })

    test('reports with cooked value different from raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello  ', cooked: 'hello' },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('reports multiple trailing tabs at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('x\t\t\t'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report clean string with no trailing space', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement(''))
      expect(reports.length).toBe(0)
    })

    test('does not report newline-only string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('\n'))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(() => visitor.TemplateElement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(() => visitor.TemplateElement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(() => visitor.TemplateElement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'hello ',
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value.raw is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { cooked: 'hello ' },
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value.raw is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: null, cooked: 'hello ' },
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value has no raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { cooked: 'hello ' },
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report single character with no trailing whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a'))
      expect(reports.length).toBe(0)
    })

    test('does not report tabs in middle of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hel\tlo'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with only spaces in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report multiline with no trailing on any line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello\nworld\nfoo'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(() => visitor.TemplateElement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      expect(() => visitor.TemplateElement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is missing entirely', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 1),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral node type (not TemplateElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noTrailingSpacesRule.create(ctx1)
      const visitor2 = noTrailingSpacesRule.create(ctx2)

      visitor1.TemplateElement(makeTemplateElement('hello '))
      visitor2.TemplateElement(makeTemplateElement('hello'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a '))
      visitor.TemplateElement(makeTemplateElement('b'))
      visitor.TemplateElement(makeTemplateElement('c\t'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
      }
      visitor.TemplateElement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('clean'))
      visitor.TemplateElement(makeTemplateElement('trailing '))
      visitor.TemplateElement(makeTemplateElement('also clean'))
      visitor.TemplateElement(makeTemplateElement('tab\t'))
      visitor.TemplateElement(makeTemplateElement('ok'))
      expect(reports.length).toBe(2)
    })

    test('reports only once per node for multiple trailing lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a \nb \nc'))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noTrailingSpacesRule.create(context)
      const visitor2 = noTrailingSpacesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
        loc: makeLoc(10, 4, 10, 10),
      }
      visitor.TemplateElement(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
        loc: {},
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
        loc: makeLoc(1, 0, 1, 6),
        range: [0, 6],
        extra: true,
        parent: {},
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('handles multiline with one bad line in the middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('clean\nbad \nclean'))
      expect(reports.length).toBe(1)
    })

    test('handles empty lines between content', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a\n\nb'))
      expect(reports.length).toBe(0)
    })

    test('does not report when first line has trailing but it is empty after trim', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('  '))
      expect(reports.length).toBe(1)
    })

    test('handles node with tail property (template element)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'hello ', cooked: 'hello ' },
        tail: true,
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a '))
      visitor.TemplateElement(makeTemplateElement('b  '))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all reports follow same message pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('a '))
      visitor.TemplateElement(makeTemplateElement('b\t'))
      for (const r of reports) {
        expect(r.message).toContain('Unexpected trailing whitespace')
        expect(r.message).toContain('template literal')
      }
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noTrailingSpacesRule.meta
      const meta2 = noTrailingSpacesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noTrailingSpacesRule', () => {
      expect(noTrailingSpacesRule).toBeDefined()
      expect(typeof noTrailingSpacesRule.create).toBe('function')
      expect(typeof noTrailingSpacesRule.meta).toBe('object')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports[0].message).toBe(
        'Unexpected trailing whitespace in template literal. Trailing spaces are usually unintended and can cause subtle bugs.',
      )
    })

    test('does not report whitespace-only content with no trailing', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('  hello  world  '))
      expect(reports.length).toBe(1)
    })

    test('handles multiline with trailing on first line only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'foo \nbar', cooked: 'foo \nbar' },
        loc: makeLoc(1, 0, 2, 3),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('handles multiline with trailing on last line only', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'foo\nbar ', cooked: 'foo\nbar ' },
        loc: makeLoc(1, 0, 2, 4),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(1)
    })

    test('handles multiline with no trailing on any line', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: 'foo\nbar\nbaz', cooked: 'foo\nbar\nbaz' },
        loc: makeLoc(1, 0, 3, 3),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with only whitespace in raw that has trailing', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('   '))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement('hello '))
      visitor.TemplateElement(makeTemplateElement('hello '))
      visitor.TemplateElement(makeTemplateElement('hello '))
      expect(reports.length).toBe(3)
    })

    test('handles node where value.raw is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: '', cooked: '' },
        loc: makeLoc(1, 0, 1, 0),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where raw has only newline characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      const node = {
        type: 'TemplateElement',
        value: { raw: '\n\n\n', cooked: '\n\n\n' },
        loc: makeLoc(1, 0, 4, 0),
      }
      visitor.TemplateElement(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where raw is a single space with no content', () => {
      const { context, reports } = createMockContext()
      const visitor = noTrailingSpacesRule.create(context)
      visitor.TemplateElement(makeTemplateElement(' '))
      expect(reports.length).toBe(1)
    })
  })
})
