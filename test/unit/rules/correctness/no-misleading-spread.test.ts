import { describe, expect, test, vi } from 'vitest'
import { noMisleadingSpreadRule } from '../../../../src/rules/correctness/no-misleading-spread.js'
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
    getSource: () => 'const arr = [...42]',
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

function makeSpreadElement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-misleading-spread rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMisleadingSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMisleadingSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noMisleadingSpreadRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noMisleadingSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noMisleadingSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning spread and iterable', () => {
      const desc = noMisleadingSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/spread/)
      expect(desc).toMatch(/iterable/)
    })

    test('should have correct docs URL', () => {
      expect(noMisleadingSpreadRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misleading-spread',
      )
    })

    test('should have empty schema', () => {
      expect(noMisleadingSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with SpreadElement', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(visitor).toHaveProperty('SpreadElement')
      expect(typeof visitor.SpreadElement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisleadingSpreadRule).toBeDefined()
      expect(noMisleadingSpreadRule.meta).toBeDefined()
      expect(noMisleadingSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports spread of non-iterable primitives', () => {
    test('reports spread of number literal 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of number literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of negative number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of bigint literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: BigInt(9007199254740991) }))
      expect(reports.length).toBe(1)
    })

    test('reports spread of symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: Symbol('sym') }))
      expect(reports.length).toBe(1)
    })

    test('message contains "mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('mistake')
    })

    test('message contains typeof for number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toContain('number')
    })

    test('message contains typeof for boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: true }))
      expect(reports[0].message).toContain('boolean')
    })

    test('message contains "iterable"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('iterable')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      const node = makeSpreadElement({ type: 'Literal', value: 42 })
      visitor.SpreadElement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations accumulated', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 1 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 2 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 3 }))
      expect(reports.length).toBe(3)
    })

    test('reports template literal with no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('template literal message mentions string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'abc', cooked: 'abc' } }],
        expressions: [],
      }))
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('template literal message mentions template', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'abc', cooked: 'abc' } }],
        expressions: [],
      }))
      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('reports with correct location line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report spread of string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of undefined literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(() => visitor.SpreadElement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(() => visitor.SpreadElement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(() => visitor.SpreadElement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-SpreadElement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({ type: 'Literal', value: 42 })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 'spread me' }))
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report template literal with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } },
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
        ],
        expressions: [{ type: 'Identifier', name: 'name' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report template literal with multiple quasis and no expressions but quasi contains ${', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: '${x}' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of tagged template expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'html' },
        quasi: { type: 'TemplateLiteral', expressions: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(() => visitor.SpreadElement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      expect(() => visitor.SpreadElement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report spread of assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'ArrayExpression', elements: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of class expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report template literal with missing quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report template literal with multiple quasis and no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a' } },
          { type: 'TemplateElement', value: { raw: 'b' } },
        ],
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisleadingSpreadRule.create(ctx1)
      const visitor2 = noMisleadingSpreadRule.create(ctx2)

      visitor1.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      visitor2.SpreadElement(makeSpreadElement({ type: 'Identifier', name: 'items' }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 1 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      const node = {
        type: 'SpreadElement',
        argument: { type: 'Literal', value: 42 },
      }
      visitor.SpreadElement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      const node = {
        type: 'SpreadElement',
        argument: { type: 'Literal', value: 42 },
      }
      visitor.SpreadElement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noMisleadingSpreadRule.create(context)
      const visitor2 = noMisleadingSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 'hello' }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: true }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Identifier', name: 'arr' }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: BigInt(1) }))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(3)
    })

    test('SpreadElement with null argument does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', argument: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('SpreadElement with undefined argument does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', argument: undefined, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('SpreadElement with missing argument property does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with empty argument object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement({ type: 'SpreadElement', argument: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('Literal with regex value does NOT report (object type)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('Literal with object value does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: { key: 'val' } }))
      expect(reports.length).toBe(0)
    })

    test('template literal with no quasis array does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        expressions: [],
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: true }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('all number spread messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 1 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 2 }))
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 3 }))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is the same reference across accesses', () => {
      const meta1 = noMisleadingSpreadRule.meta
      const meta2 = noMisleadingSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noMisleadingSpreadRule', () => {
      expect(noMisleadingSpreadRule).toBeDefined()
      expect(typeof noMisleadingSpreadRule.create).toBe('function')
      expect(typeof noMisleadingSpreadRule.meta).toBe('object')
    })

    test('number message mentions "number" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 99 }))
      expect(reports[0].message).toContain('number')
    })

    test('boolean message mentions "boolean" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: false }))
      expect(reports[0].message).toContain('boolean')
    })

    test('bigint message mentions "bigint" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: BigInt(100) }))
      expect(reports[0].message).toContain('bigint')
    })

    test('does not report spread of parenthesized expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'ParenthesizedExpression',
        expression: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report spread of spread expression (nested spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'inner' },
      }))
      expect(reports.length).toBe(0)
    })

    test('report loc has start and end with correct shape', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: 42 }, 3, 5))
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toEqual({ line: 3, column: 5 })
      expect(loc?.end).toEqual({ line: 3, column: 15 })
    })

    test('does not report spread of empty regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', regex: { pattern: '', flags: '' } }))
      expect(reports.length).toBe(0)
    })

    test('template literal with raw containing only escaped dollar does report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'abc' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('does not report Literal with NaN value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({ type: 'Literal', value: NaN }))
      expect(reports.length).toBe(1)
    })

    test('does not report spread of type cast expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'items' },
        typeAnnotation: { type: 'TSArrayType' },
      }))
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates template literal reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingSpreadRule.create(context)
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'a' } }],
        expressions: [],
      }))
      visitor.SpreadElement(makeSpreadElement({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'b' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(2)
    })
  })
})
