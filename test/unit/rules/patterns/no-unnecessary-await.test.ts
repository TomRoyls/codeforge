import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAwaitRule } from '../../../../src/rules/patterns/no-unnecessary-await.js'
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
    getSource: () => 'await 42;',
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

function createAwaitNode(argType: string, argOverrides: Record<string, unknown> = {}, line = 1, column = 0): unknown {
  return {
    type: 'AwaitExpression',
    argument: {
      type: argType,
      ...argOverrides,
    },
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-unnecessary-await rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAwaitRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAwaitRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAwaitRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning non-promise', () => {
      expect(noUnnecessaryAwaitRule.meta.docs?.description.toLowerCase()).toContain('await')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAwaitRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-await',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAwaitRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('create() returns visitor with AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(visitor).toHaveProperty('AwaitExpression')
      expect(typeof visitor.AwaitExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAwaitRule).toBeDefined()
      expect(noUnnecessaryAwaitRule.meta).toBeDefined()
      expect(noUnnecessaryAwaitRule.create).toBeDefined()
    })
  })

  describe('positive cases — reports sync expressions', () => {
    test('reports await on number literal (await 42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on string literal (await "hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 'hello' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on boolean literal (await true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: true })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on null literal (await null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: null })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on Identifier (await x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Identifier', { name: 'x' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on BinaryExpression (await a + b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('BinaryExpression', {
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on BinaryExpression with multiply (await x * 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('BinaryExpression', {
        operator: '*',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on UnaryExpression (await !x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UnaryExpression', {
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on UnaryExpression with minus (await -y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UnaryExpression', {
        operator: '-',
        argument: { type: 'Identifier', name: 'y' },
        prefix: true,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on LogicalExpression AND (await x && y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('LogicalExpression', {
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on LogicalExpression OR (await x || y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('LogicalExpression', {
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on LogicalExpression nullish coalesce (await x ?? y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('LogicalExpression', {
        operator: '??',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('TemplateLiteral', {
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
        expressions: [{ type: 'Identifier', name: 'name' }],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on MemberExpression (await obj.prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('MemberExpression', {
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on nested MemberExpression (await obj.nested.prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('MemberExpression', {
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'nested' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message mentions "Unnecessary await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('Unnecessary await')
    })

    test('message mentions the expression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('Literal')
    })

    test('message mentions "non-promise value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('non-promise value')
    })

    test('message mentions "Remove the await keyword"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('Remove the await keyword')
    })

    test('report includes loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 }, 5, 2)
      visitor.AwaitExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('report includes node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 })
      visitor.AwaitExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('reports multiple await violations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 1 }, 1, 0))
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 2 }, 2, 0))
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 3 }, 3, 0))
      expect(reports.length).toBe(3)
    })

    test('reports await on void 0 — UnaryExpression (void)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UnaryExpression', {
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        prefix: true,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on typeof x — UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UnaryExpression', {
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('negative cases — does NOT report', () => {
    test('does not report await on CallExpression (await fetch(url))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [{ type: 'Identifier', name: 'url' }],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on Promise.resolve(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on someFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on IIFE async arrow (await (async () => {})())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: {
          type: 'ArrowFunctionExpression',
          async: true,
          body: { type: 'BlockStatement', body: [] },
          params: [],
        },
        arguments: [],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on NewExpression (await new Promise(...))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('NewExpression', {
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on ConditionalExpression (await x ? y : z)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ConditionalExpression', {
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'y' },
        alternate: { type: 'Identifier', name: 'z' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on ArrayExpression (await [1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ArrayExpression', {
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on ObjectExpression (await { a: 1 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ObjectExpression', {
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
        ],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-AwaitExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(() => visitor.AwaitExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(() => visitor.AwaitExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles AwaitExpression with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles AwaitExpression with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty source — empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(() => visitor.AwaitExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(() => visitor.AwaitExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      expect(() => visitor.AwaitExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report await on CallExpression x()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: { type: 'Identifier', name: 'x' },
        arguments: [],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on CallExpression x.y()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'y' },
        },
        arguments: [],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await on CallExpression x.then(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('CallExpression', {
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('AssignmentExpression', {
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('SequenceExpression', {
        expressions: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('SpreadElement', {
        argument: { type: 'Identifier', name: 'arr' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UpdateExpression', {
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('FunctionExpression', {
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ArrowFunctionExpression', {
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with TaggedTemplateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('TaggedTemplateExpression', {
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('YieldExpression', {
        argument: { type: 'Literal', value: 1 },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with AwaitExpression argument (nested await)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('AwaitExpression', {
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with ClassExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ClassExpression', {
        id: null,
        body: { type: 'ClassBody', body: [] },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report on AwaitExpression with ThisExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('ThisExpression', {})
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('reports await on Identifier named "promise" (cannot know it is a promise)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Identifier', { name: 'promise' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('separate create() calls produce independent visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAwaitRule.create(ctx1)
      const visitor2 = noUnnecessaryAwaitRule.create(ctx2)

      visitor1.AwaitExpression(createAwaitNode('Literal', { value: 1 }))
      visitor2.AwaitExpression(createAwaitNode('CallExpression', { callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 1 }, 1, 0))
      visitor.AwaitExpression(createAwaitNode('Identifier', { name: 'x' }, 2, 0))
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 3 }, 3, 0))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Literal', value: 42 },
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('AwaitExpression with missing argument property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        loc: makeLoc(1, 0, 1, 5),
      }
      expect(() => visitor.AwaitExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('reports await on (1 + 2) — BinaryExpression in parens', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('BinaryExpression', {
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on "string" — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 'string' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Literal')
    })

    test('reports await on BinaryExpression instanceof (await x instanceof Y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('BinaryExpression', {
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Y' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report location has correct specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 42 }, 10, 4)
      visitor.AwaitExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('reports await on AwaitExpression wrapping Identifier in parens (await (x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Identifier', { name: 'x' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports on different BinaryExpression operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const operators = ['+', '-', '*', '/', '%', '<', '>', '<=', '>=', '==', '===', '!=', '!==']
      for (const op of operators) {
        visitor.AwaitExpression(createAwaitNode('BinaryExpression', {
          operator: op,
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }))
      }
      expect(reports.length).toBe(operators.length)
    })

    test('reports on different UnaryExpression operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const operators = ['-', '+', '!', '~', 'typeof', 'void', 'delete']
      for (const op of operators) {
        visitor.AwaitExpression(createAwaitNode('UnaryExpression', {
          operator: op,
          argument: { type: 'Identifier', name: 'x' },
          prefix: true,
        }))
      }
      expect(reports.length).toBe(operators.length)
    })

    test('reports on computed MemberExpression (await obj[key])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('MemberExpression', {
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'key' },
        computed: true,
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message for Identifier mentions "Identifier"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Identifier', { name: 'myVar' })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('Identifier')
    })

    test('message for BinaryExpression mentions "BinaryExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('BinaryExpression', {
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('BinaryExpression')
    })

    test('message for UnaryExpression mentions "UnaryExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('UnaryExpression', {
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('UnaryExpression')
    })

    test('message for LogicalExpression mentions "LogicalExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('LogicalExpression', {
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('LogicalExpression')
    })

    test('message for TemplateLiteral mentions "TemplateLiteral"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('TemplateLiteral', {
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' } }],
        expressions: [],
      })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('TemplateLiteral')
    })

    test('message for MemberExpression mentions "MemberExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('MemberExpression', {
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      })
      visitor.AwaitExpression(node)
      expect(reports[0].message).toContain('MemberExpression')
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAwaitRule.create(context)
      const visitor2 = noUnnecessaryAwaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('additional coverage', () => {
    test('reports await on regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: /test/, regex: { pattern: 'test', flags: '' } })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports await on BigInt literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: 10n, bigint: '10' })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for node with empty type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: { type: '' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is a similar but wrong name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Binary_Expression', {
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles argument that is a primitive string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: 'not-an-object',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles argument that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: 42,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports correctly with line > 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Literal', { value: true }, 42, 8)
      visitor.AwaitExpression(node)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('does not report for Super argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('Super', {})
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for MetaProperty argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      const node = createAwaitNode('MetaProperty', {
        meta: { type: 'Identifier', name: 'new' },
        property: { type: 'Identifier', name: 'target' },
      })
      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports mixed violations and non-violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitRule.create(context)
      visitor.AwaitExpression(createAwaitNode('Literal', { value: 1 }, 1, 0))
      visitor.AwaitExpression(createAwaitNode('CallExpression', {
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }, 2, 0))
      visitor.AwaitExpression(createAwaitNode('Identifier', { name: 'x' }, 3, 0))
      visitor.AwaitExpression(createAwaitNode('NewExpression', {
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      }, 4, 0))
      visitor.AwaitExpression(createAwaitNode('BinaryExpression', {
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }, 5, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('Literal')
      expect(reports[1].message).toContain('Identifier')
      expect(reports[2].message).toContain('BinaryExpression')
    })
  })
})
