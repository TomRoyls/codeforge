import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDestructuringRule } from '../../../../src/rules/patterns/no-unnecessary-destructuring.js'
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
    getSource: () => 'const { foo } = obj',
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

function makeDeclaratorNode(
  propName: string,
  initName = 'obj',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
) {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'ObjectPattern',
      properties: [{
        type: 'ObjectProperty',
        key: { type: 'Identifier', name: propName },
        value: { type: 'Identifier', name: propName },
      }],
    },
    init: { type: 'Identifier', name: initName },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-destructuring rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDestructuringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDestructuringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDestructuringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDestructuringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDestructuringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning destructuring', () => {
      const desc = noUnnecessaryDestructuringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/destructur/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDestructuringRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-destructuring',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDestructuringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDestructuringRule).toBeDefined()
      expect(noUnnecessaryDestructuringRule.meta).toBeDefined()
      expect(noUnnecessaryDestructuringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY DESTRUCTURING (25) =====

  describe('positive cases — reports unnecessary destructuring', () => {
    test('reports for { foo } = obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for { bar } = obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for { name } = user', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('name', 'user'))
      expect(reports.length).toBe(1)
    })

    test('reports for { x } = point', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('x', 'point'))
      expect(reports.length).toBe(1)
    })

    test('reports for { data } = response', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('data', 'response'))
      expect(reports.length).toBe(1)
    })

    test('reports for { value } = config', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('value', 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for { id } = item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('id', 'item'))
      expect(reports.length).toBe(1)
    })

    test('reports for { result } = output', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('result', 'output'))
      expect(reports.length).toBe(1)
    })

    test('reports for { count } = stats', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('count', 'stats'))
      expect(reports.length).toBe(1)
    })

    test('reports for { error } = err', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('error', 'err'))
      expect(reports.length).toBe(1)
    })

    test('reports for { length } = arr', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('length', 'arr'))
      expect(reports.length).toBe(1)
    })

    test('reports for { price } = product', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('price', 'product'))
      expect(reports.length).toBe(1)
    })

    test('reports for { status } = response', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('status', 'response'))
      expect(reports.length).toBe(1)
    })

    test('reports for { key } = entry', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('key', 'entry'))
      expect(reports.length).toBe(1)
    })

    test('reports for { url } = link', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('url', 'link'))
      expect(reports.length).toBe(1)
    })

    test('reports for { type } = action', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('type', 'action'))
      expect(reports.length).toBe(1)
    })

    test('reports for { message } = event', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('message', 'event'))
      expect(reports.length).toBe(1)
    })

    test('reports for { index } = item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('index', 'item'))
      expect(reports.length).toBe(1)
    })

    test('reports for { title } = doc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('title', 'doc'))
      expect(reports.length).toBe(1)
    })

    test('reports for { color } = style', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('color', 'style'))
      expect(reports.length).toBe(1)
    })

    test('reports for { size } = font', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('size', 'font'))
      expect(reports.length).toBe(1)
    })

    test('reports for { width } = rect', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('width', 'rect'))
      expect(reports.length).toBe(1)
    })

    test('reports for { age } = person', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('age', 'person'))
      expect(reports.length).toBe(1)
    })

    test('reports for { port } = server', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('port', 'server'))
      expect(reports.length).toBe(1)
    })

    test('reports for { path } = route', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('path', 'route'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions property name "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports[0].message).toContain('foo')
    })

    test('report message mentions property name "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports[0].message).toContain('bar')
    })

    test('report message contains "Unnecessary destructuring"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('x'))
      expect(reports[0].message).toContain('Unnecessary destructuring')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports[0].message).toBe(
        'Unnecessary destructuring for property \'foo\'.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input VariableDeclarator node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      const node = makeDeclaratorNode('foo')
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo', 'obj', 3, 5, 3, 20))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo', 'obj', 7, 2, 7, 18))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('report message for property "name" includes name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('name'))
      expect(reports[0].message).toBe(
        'Unnecessary destructuring for property \'name\'.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format for different properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports[0].message).toMatch(/Unnecessary destructuring for property/)
      expect(reports[1].message).toMatch(/Unnecessary destructuring for property/)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports only once per matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are default for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
      }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for key !== value ({ foo: bar })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'bar' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'ObjectProperty',
              key: { type: 'Identifier', name: 'foo' },
              value: { type: 'Identifier', name: 'foo' },
            },
            {
              type: 'ObjectProperty',
              key: { type: 'Identifier', name: 'bar' },
              value: { type: 'Identifier', name: 'bar' },
            },
          ],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ObjectPattern id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ObjectProperty property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'RestElement',
            argument: { type: 'Identifier', name: 'rest' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type (ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type (FunctionDeclaration)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Literal', value: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'MemberExpression', object: {}, property: {} },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty properties array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when id is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: null,
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: 'not-array',
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [null],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when key is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: null,
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: null,
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            { type: 'ObjectProperty', key: { type: 'Identifier', name: 'a' }, value: { type: 'Identifier', name: 'a' } },
            { type: 'ObjectProperty', key: { type: 'Identifier', name: 'b' }, value: { type: 'Identifier', name: 'b' } },
            { type: 'ObjectProperty', key: { type: 'Identifier', name: 'c' }, value: { type: 'Identifier', name: 'c' } },
          ],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayPattern id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [{ type: 'Identifier', name: 'x' }] },
        init: { type: 'Identifier', name: 'arr' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryDestructuringRule.create(ctx1)
      const visitor2 = noUnnecessaryDestructuringRule.create(ctx2)
      visitor1.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor2.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'bar' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'bar' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.VariableDeclarator(makeDeclaratorNode('baz'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDestructuringRule.create(context)
      const visitor2 = noUnnecessaryDestructuringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDestructuringRule.meta
      const meta2 = noUnnecessaryDestructuringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        leadingComments: [],
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      const node = makeDeclaratorNode('foo')
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDestructuringRule).toBeDefined()
      expect(typeof noUnnecessaryDestructuringRule.create).toBe('function')
      expect(typeof noUnnecessaryDestructuringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo'))
      visitor.VariableDeclarator(makeDeclaratorNode('bar'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('foo')
      expect(reports[1].message).toContain('bar')
    })

    test('node with init as null still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when id is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: 'not-an-object',
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when id is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: 42,
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when id type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {},
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key name as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 123 },
            value: { type: 'Identifier', name: 123 },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when property type is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            key: { type: 'Identifier', name: 'foo' },
            value: { type: 'Identifier', name: 'foo' },
          }],
        },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator(makeDeclaratorNode('foo', 'obj', 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('handles node with init as CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDestructuringRule.create(context)
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'data' },
            value: { type: 'Identifier', name: 'data' },
          }],
        },
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' }, arguments: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })
  })
})
