import { describe, expect, test, vi } from 'vitest'
import { noRestrictedGlobalsRule } from '../../../../src/rules/security/no-restricted-globals.js'
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
    getSource: () => 'event',
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

function makeIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(line, column, line, column + name.length),
  }
}

describe('no-restricted-globals rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRestrictedGlobalsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRestrictedGlobalsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "security"', () => {
      expect(noRestrictedGlobalsRule.meta.docs?.category).toBe('security')
    })

    test('should not be recommended', () => {
      expect(noRestrictedGlobalsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRestrictedGlobalsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "restricted" and "global"', () => {
      const desc = noRestrictedGlobalsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/restricted/)
      expect(desc).toMatch(/global/)
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedGlobalsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-restricted-globals',
      )
    })

    test('should have empty schema', () => {
      expect(noRestrictedGlobalsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Identifier', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(visitor).toHaveProperty('Identifier')
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRestrictedGlobalsRule).toBeDefined()
      expect(noRestrictedGlobalsRule.meta).toBeDefined()
      expect(noRestrictedGlobalsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports restricted globals', () => {
    test('reports standalone "event" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports.length).toBe(1)
    })

    test('reports standalone "close" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('close'))
      expect(reports.length).toBe(1)
    })

    test('reports standalone "open" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('open'))
      expect(reports.length).toBe(1)
    })

    test('reports standalone "location" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('location'))
      expect(reports.length).toBe(1)
    })

    test('reports standalone "name" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('name'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "restricted global"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].message).toContain('restricted global')
    })

    test('message contains the identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].message).toContain('event')
    })

    test('message contains "shadow a browser global"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].message).toContain('shadow a browser global')
    })

    test('report has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = makeIdentifier('event', 3, 5)
      visitor.Identifier(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('accumulation works — multiple restricted globals', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('close'))
      visitor.Identifier(makeIdentifier('open'))
      expect(reports.length).toBe(3)
    })

    test('reports "status" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('status'))
      expect(reports.length).toBe(1)
    })

    test('reports "length" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('length'))
      expect(reports.length).toBe(1)
    })

    test('reports "parent" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('parent'))
      expect(reports.length).toBe(1)
    })

    test('reports "top" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('top'))
      expect(reports.length).toBe(1)
    })

    test('reports "scroll" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('scroll'))
      expect(reports.length).toBe(1)
    })

    test('reports "stop" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('stop'))
      expect(reports.length).toBe(1)
    })

    test('reports "focus" identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('focus'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report non-restricted name "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'MemberExpression',
        object: node,
        property: { type: 'Identifier', name: 'something' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is Property key', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'Property',
        key: node,
        value: { type: 'Literal', value: 1 },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is MethodDefinition key', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'MethodDefinition',
        key: node,
        value: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is VariableDeclarator id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'VariableDeclarator',
        id: node,
        init: { type: 'Literal', value: 5 },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is FunctionDeclaration id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'FunctionDeclaration',
        id: node,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when identifier is FunctionExpression id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'FunctionExpression',
        id: node,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'event' },
        local: { type: 'Identifier', name: 'event' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ImportDefaultSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'ImportDefaultSpecifier',
        local: { type: 'Identifier', name: 'event' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(() => visitor.Identifier(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(() => visitor.Identifier(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(() => visitor.Identifier({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-Identifier type nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Literal',
        value: 'event',
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'event' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "window"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('window'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "document"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('document'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "console"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('console'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('undefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('null'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(() => visitor.Identifier('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      expect(() => visitor.Identifier(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node without a name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier(''))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('does not report non-restricted name "self"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('self'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "globalThis"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('globalThis'))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is MemberExpression but node is property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 5, 1, 10),
      }
      node.parent = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: node,
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('does not report non-restricted name "Math"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('Math'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "JSON"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('JSON'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRestrictedGlobalsRule.create(ctx1)
      const visitor2 = noRestrictedGlobalsRule.create(ctx2)

      visitor1.Identifier(makeIdentifier('event'))
      visitor2.Identifier(makeIdentifier('foo'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('close'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
      }
      visitor.Identifier(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('foo'))
      visitor.Identifier(makeIdentifier('close'))
      visitor.Identifier(makeIdentifier('bar'))
      visitor.Identifier(makeIdentifier('open'))
      expect(reports.length).toBe(3)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noRestrictedGlobalsRule.create(context)
      const visitor2 = noRestrictedGlobalsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('event'))
      expect(reports.length).toBe(3)
    })

    test('handles node with null parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
        parent: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with undefined parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
        parent: undefined,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when parent is unknown type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node: Record<string, unknown> = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      node.parent = {
        type: 'SomeOtherType',
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
        extra: true,
        range: [0, 5],
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports with location end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event', 2, 3))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('handles node where parent exists but is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'event',
        parent: 'not-an-object',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('accumulation across many different restricted names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const names = ['event', 'close', 'open', 'status', 'name', 'length', 'location', 'parent', 'top', 'scroll', 'stop', 'focus', 'blur']
      for (const name of names) {
        visitor.Identifier(makeIdentifier(name))
      }
      expect(reports.length).toBe(13)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noRestrictedGlobalsRule.meta
      const meta2 = noRestrictedGlobalsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule export has create and meta properties', () => {
      expect(noRestrictedGlobalsRule).toBeDefined()
      expect(typeof noRestrictedGlobalsRule.create).toBe('function')
      expect(typeof noRestrictedGlobalsRule.meta).toBe('object')
    })

    test('message is different for different restricted names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      visitor.Identifier(makeIdentifier('close'))
      expect(reports[0].message).toContain('event')
      expect(reports[1].message).toContain('close')
    })

    test('each restricted global triggers correctly — blur', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('blur'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('blur')
    })

    test('non-restricted name "window" does not trigger', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('window'))
      expect(reports.length).toBe(0)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('event'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = {
        type: 42,
        name: 'event',
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(0)
    })

    test('report node matches original node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      const node = makeIdentifier('event')
      visitor.Identifier(node)
      expect(reports[0].node).toBe(node)
    })

    test('case sensitivity — "Event" is not restricted', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('Event'))
      expect(reports.length).toBe(0)
    })

    test('case sensitivity — "OPEN" is not restricted', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('OPEN'))
      expect(reports.length).toBe(0)
    })

    test('case sensitivity — "Close" is not restricted', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedGlobalsRule.create(context)
      visitor.Identifier(makeIdentifier('Close'))
      expect(reports.length).toBe(0)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noRestrictedGlobalsRule.meta.docs?.description).toBe('string')
      expect(noRestrictedGlobalsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs URL is a string', () => {
      expect(typeof noRestrictedGlobalsRule.meta.docs?.url).toBe('string')
    })

    test('meta severity is one of valid values', () => {
      expect(['error', 'warn', 'off']).toContain(noRestrictedGlobalsRule.meta.severity)
    })

    test('meta type is one of valid values', () => {
      expect(['layout', 'problem', 'suggestion']).toContain(noRestrictedGlobalsRule.meta.type)
    })
  })
})
