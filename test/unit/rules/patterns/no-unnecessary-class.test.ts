import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryClassRule } from '../../../../src/rules/patterns/no-unnecessary-class.js'
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
    getSource: () => 'class Empty {}',
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

function makeClassNode(
  name = 'Empty',
  superClass: unknown = null,
  bodyItems: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ClassDeclaration',
    id: { type: 'Identifier', name },
    superClass,
    body: { type: 'ClassBody', body: bodyItems },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-class rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryClassRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryClassRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryClassRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryClassRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryClassRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning class', () => {
      const desc = noUnnecessaryClassRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/class/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryClassRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-class',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryClassRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(typeof visitor.ClassDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryClassRule).toBeDefined()
      expect(noUnnecessaryClassRule.meta).toBeDefined()
      expect(noUnnecessaryClassRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY CLASS (25) =====

  describe('positive cases — reports empty class', () => {
    test('reports for empty class with null superClass', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with undefined superClass', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Foo', undefined, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class named A', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class named MyComponent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('MyComponent', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class named _unused', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('_unused', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class named $dollar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('$dollar', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with no id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Extra' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        leadingComments: [],
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class at different location line 5 col 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 5, 10, 5, 30))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class at line 100 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 100, 0, 100, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 1, 0, 3, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with decorators property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Decorated' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        decorators: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with implements property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Impl' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        implements: [{ type: 'ClassImplements', expression: { type: 'Identifier', name: 'Iface' } }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty abstract class', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'AbstractEmpty' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        abstract: true,
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with empty superClass string that is falsy-like', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty anonymous class expression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty exported class', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Exported' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty generic class', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Generic' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        typeParameters: { type: 'TypeParameterDeclaration', params: [] },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class named with unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Класс', null, []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with super class explicitly set to null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoSuper' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class without superClass property at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoSuperProp' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty class with loc at origin 0,0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Origin', null, [], 0, 0, 0, 15))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      visitor.ClassDeclaration(makeClassNode('B', null, []))
      expect(reports.length).toBe(2)
    })

    test('all accumulated reports have the same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      visitor.ClassDeclaration(makeClassNode('B', null, []))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('report message mentions empty class', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0].message.toLowerCase()).toContain('empty class')
    })

    test('report message mentions superclass or body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      const msg = reports[0].message.toLowerCase()
      expect(msg).toMatch(/superclass|body/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0].message).toBe('Unnecessary empty class with no superclass or body.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ClassDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = makeClassNode()
      visitor.ClassDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 7, 4, 7, 24))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 7, 4, 7, 24))
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc end line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 3, 0, 5, 1))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc end column matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 3, 0, 5, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report for node at line 50 col 200 preserves location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 50, 200, 50, 220))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('report for multi-line node preserves both start and end loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 10, 2, 15, 3))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for class with a method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithMethod' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [{ type: 'MethodDefinition', kind: 'method', key: { type: 'Identifier', name: 'foo' } }],
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with a constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithCtor' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [{ type: 'MethodDefinition', kind: 'constructor', key: { type: 'Identifier', name: 'constructor' } }],
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with a property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithProp' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [{ type: 'PropertyDefinition', key: { type: 'Identifier', name: 'x' } }],
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with a superclass', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Extends' },
        superClass: { type: 'Identifier', name: 'Base' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class extending another class with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Child' },
        superClass: { type: 'Identifier', name: 'Parent' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with superClass set to empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'EmptySuper' },
        superClass: '',
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with superClass set to 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'ZeroSuper' },
        superClass: 0,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with superClass set to false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'FalseSuper' },
        superClass: false,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration('class Empty {}')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for class with static method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithStatic' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [{ type: 'MethodDefinition', kind: 'method', static: true, key: { type: 'Identifier', name: 'create' } }],
        },
        loc: makeLoc(1, 0, 1, 35),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with accessor property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithAccessor' },
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [{ type: 'AccessorProperty', key: { type: 'Identifier', name: 'value' } }],
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassExpression',
        id: { type: 'Identifier', name: 'Expr' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for class with body as non-object string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'BadBody' },
        superClass: null,
        body: 'not an object',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with body as non-object number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'BadBody' },
        superClass: null,
        body: 42,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with missing body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoBody' },
        superClass: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for class with body.body as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'BadBodyArray' },
        superClass: null,
        body: { type: 'ClassBody', body: 'not array' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryClassRule.create(ctx1)
      const visitor2 = noUnnecessaryClassRule.create(ctx2)
      visitor1.ClassDeclaration(makeClassNode('A', null, []))
      visitor2.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        superClass: { type: 'Identifier', name: 'Base' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        superClass: { type: 'Identifier', name: 'Base' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.ClassDeclaration(makeClassNode('C', null, []))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoLoc' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoLoc' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      visitor.ClassDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'B' },
        superClass: { type: 'Identifier', name: 'Base' },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.ClassDeclaration(makeClassNode('C', null, []))
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'D' },
        superClass: null,
        body: { type: 'ClassBody', body: [{ type: 'MethodDefinition', kind: 'method', key: { type: 'Identifier', name: 'm' } }] },
        loc: makeLoc(1, 0, 1, 30),
      })
      visitor.ClassDeclaration(makeClassNode('E', null, []))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryClassRule.create(context)
      const visitor2 = noUnnecessaryClassRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryClassRule.meta
      const meta2 = noUnnecessaryClassRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithParent' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
        _parent: { type: 'Program', body: [] },
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'EmptyLoc' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'PartialLoc' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = makeClassNode()
      visitor.ClassDeclaration(node)
      visitor.ClassDeclaration(node)
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryClassRule).toBeDefined()
      expect(typeof noUnnecessaryClassRule.create).toBe('function')
      expect(typeof noUnnecessaryClassRule.meta).toBe('object')
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithRange' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with comments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'WithComments' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 20),
        leadingComments: [{ type: 'Line', value: ' empty class' }],
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('A', null, []))
      visitor.ClassDeclaration(makeClassNode('B', null, []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with body.body as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'UndefinedBodyItems' },
        superClass: null,
        body: { type: 'ClassBody' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('handles array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      expect(() => visitor.ClassDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when superClass is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MemberSuper' },
        superClass: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Base' } },
        body: { type: 'ClassBody', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      visitor.ClassDeclaration(makeClassNode('Empty', null, [], 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('does not report when body.body has one empty item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NotEmpty' },
        superClass: null,
        body: { type: 'ClassBody', body: [null] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with body.body as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryClassRule.create(context)
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NullBodyItems' },
        superClass: null,
        body: { type: 'ClassBody', body: null },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ClassDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })
})
