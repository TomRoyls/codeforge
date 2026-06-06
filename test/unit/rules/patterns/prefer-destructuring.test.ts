import { describe, expect, test, vi } from 'vitest'
import { preferDestructuringRule } from '../../../../src/rules/patterns/prefer-destructuring.js'
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
    getSource: () => 'const foo = obj.foo',
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

function makeVarDeclarator(
  idName: string,
  propName: string,
  objectName = 'obj',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
  propType = 'Identifier' as string,
  propValue?: string,
): unknown {
  const property =
    propType === 'StringLiteral'
      ? { type: 'Literal', value: propValue ?? propName }
      : propValue !== undefined
        ? { type: propType, value: propValue }
        : { type: propType, name: propName }
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name: idName },
    init: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property,
      computed: false,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('prefer-destructuring rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(preferDestructuringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(preferDestructuringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(preferDestructuringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(preferDestructuringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(preferDestructuringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning destructuring', () => {
      const desc = preferDestructuringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/destructur/)
    })

    test('should have correct docs URL', () => {
      expect(preferDestructuringRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-destructuring',
      )
    })

    test('should have empty schema', () => {
      expect(preferDestructuringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(preferDestructuringRule).toBeDefined()
      expect(preferDestructuringRule.meta).toBeDefined()
      expect(preferDestructuringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS WHEN NAME MATCHES (30) =====

  describe('positive cases — reports when name matches', () => {
    test('reports for basic match: const foo = obj.foo', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for match: const bar = obj.bar', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('bar', 'bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for match: const x = data.x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('x', 'x', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for match: const name = config.name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('name', 'name', 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for match: const item = list.item', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('item', 'item', 'list'))
      expect(reports.length).toBe(1)
    })

    test('reports for match: const prop = obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('prop', 'prop'))
      expect(reports.length).toBe(1)
    })

    test('reports when id.value is set and takes precedence over name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', value: 'foo', name: 'other' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports when property Identifier uses value field', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', value: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single-char match: const a = obj.a', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('a', 'a'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore name: const _foo = obj._foo', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('_foo', '_foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar sign name: const $el = obj.$el', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('$el', '$el'))
      expect(reports.length).toBe(1)
    })

    test('reports for camelCase name: const myProp = obj.myProp', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('myProp', 'myProp'))
      expect(reports.length).toBe(1)
    })

    test('reports for property StringLiteral with matching value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo', 'obj', 1, 0, 1, 15, 'StringLiteral'))
      expect(reports.length).toBe(1)
    })

    test('reports when MemberExpression object is also MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports when MemberExpression object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports for number-like name: const item1 = data.item1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('item1', 'item1', 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for UPPER_CASE name: const MAX = config.MAX', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('MAX', 'MAX', 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for long property name match', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('veryLongPropertyName', 'veryLongPropertyName'))
      expect(reports.length).toBe(1)
    })

    test('reports for PascalCase name: const MyComponent = obj.MyComponent', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('MyComponent', 'MyComponent'))
      expect(reports.length).toBe(1)
    })

    test('report message is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports[0].message).toContain('destructuring')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input VariableDeclarator node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = makeVarDeclarator('foo', 'foo')
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo', 'obj', 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor.VariableDeclarator(makeVarDeclarator('bar', 'bar'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor.VariableDeclarator(makeVarDeclarator('bar', 'bar', 'data'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports[0].message).toBe(
        'Use destructuring assignment instead of property access.',
      )
    })

    test('reports when computed: false is set', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports when property value takes precedence over name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', value: 'foo', name: 'bar' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral property value matching id name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'key' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'key' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when id name differs from property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report when id is ObjectPattern instead of Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id is ArrayPattern instead of Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is CallExpression instead of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getFoo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is Literal instead of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is Identifier instead of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is BinaryExpression instead of MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ExpressionStatement',
        expression: {},
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ObjectExpression',
        properties: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'ConditionalExpression',
        test: {},
        consequent: {},
        alternate: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {},
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type (not VariableDeclarator)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'MemberExpression',
        object: {},
        property: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing from MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: null,
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is NumberLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: '0' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'NumberLiteral', value: 0 },
          computed: true,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'flag' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'BooleanLiteral', value: true },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id is missing from VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is missing from VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id value and name both differ from prop name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', value: 'baz', name: 'qux' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'CallExpression', callee: {}, arguments: [] },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferDestructuringRule.create(ctx1)
      const visitor2 = preferDestructuringRule.create(ctx2)
      visitor1.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor2.VariableDeclarator(makeVarDeclarator('foo', 'bar'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'bar'))
      visitor.VariableDeclarator(makeVarDeclarator('baz', 'baz'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
      }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor.VariableDeclarator(makeVarDeclarator('bar', 'baz'))
      visitor.VariableDeclarator(makeVarDeclarator('a', 'a'))
      visitor.VariableDeclarator({ type: 'ExpressionStatement', expression: {} })
      visitor.VariableDeclarator(makeVarDeclarator('x', 'y'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferDestructuringRule.create(context)
      const visitor2 = preferDestructuringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = preferDestructuringRule.meta
      const meta2 = preferDestructuringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15] as [number, number],
        extra: true,
        leadingComments: [],
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: {},
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = makeVarDeclarator('foo', 'foo')
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(preferDestructuringRule).toBeDefined()
      expect(typeof preferDestructuringRule.create).toBe('function')
      expect(typeof preferDestructuringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      visitor.VariableDeclarator(makeVarDeclarator('foo', 'foo'))
      visitor.VariableDeclarator(makeVarDeclarator('bar', 'bar', 'data'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with range property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15] as [number, number],
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles MemberExpression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles when id.value takes precedence over id.name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', value: 'foo', name: 'mismatch' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node without init but with id', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles when property Identifier has only value set (no name)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'foo' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', value: 'foo' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })
  })
})
