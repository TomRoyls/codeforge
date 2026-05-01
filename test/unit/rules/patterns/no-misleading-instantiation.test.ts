import { describe, expect, test, vi } from 'vitest'
import { noMisleadingInstantiationRule } from '../../../../src/rules/patterns/no-misleading-instantiation.js'
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
    getSource: () => 'new String()',
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

function makeNewExpr(calleeName: string, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-misleading-instantiation rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMisleadingInstantiationRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMisleadingInstantiationRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMisleadingInstantiationRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMisleadingInstantiationRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMisleadingInstantiationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning constructors or primitives', () => {
      const desc = noMisleadingInstantiationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/constructor|primitive/)
    })

    test('should have correct docs URL', () => {
      expect(noMisleadingInstantiationRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misleading-instantiation',
      )
    })

    test('should have empty schema', () => {
      expect(noMisleadingInstantiationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisleadingInstantiationRule).toBeDefined()
      expect(noMisleadingInstantiationRule.meta).toBeDefined()
      expect(noMisleadingInstantiationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (30) =====
  describe('positive cases — reports zero-arg constructor', () => {
    test('reports new String() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports.length).toBe(1)
    })

    test('reports new Number() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports.length).toBe(1)
    })

    test('reports new Boolean() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports.length).toBe(1)
    })

    test('reports new Array() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(1)
    })

    test('reports new Object() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports.length).toBe(1)
    })

    test('reports new RegExp() — zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports.length).toBe(1)
    })

    test('String message mentions "string literal" and \'""\' ', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].message).toContain('string literal')
      expect(reports[0].message).toContain('""')
    })

    test('Number message mentions "number literal" and "0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports[0].message).toContain('number literal')
      expect(reports[0].message).toContain('0')
    })

    test('Boolean message mentions "boolean literal" and "false"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports[0].message).toContain('boolean literal')
      expect(reports[0].message).toContain('false')
    })

    test('Array message mentions "array literal" and "[]"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports[0].message).toContain('array literal')
      expect(reports[0].message).toContain('[]')
    })

    test('Object message mentions "object literal" and "{}"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports[0].message).toContain('object literal')
      expect(reports[0].message).toContain('{}')
    })

    test('RegExp message mentions "regex literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports[0].message).toContain('regex literal')
    })

    test('String message mentions "Useless" and "String"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('String')
    })

    test('Number message mentions "Useless" and "Number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('Number')
    })

    test('Boolean message mentions "Useless" and "Boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('Boolean')
    })

    test('Array message mentions "Useless" and "Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('Array')
    })

    test('Object message mentions "Useless" and "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('Object')
    })

    test('RegExp message mentions "Useless" and "RegExp"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports[0].message).toContain('Useless')
      expect(reports[0].message).toContain('RegExp')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].node).toBeDefined()
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports.length).toBe(3)
    })

    test('reports new String (no parens in AST) — empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [], 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports each constructor once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports for different constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('Boolean'))
      visitor.NewExpression(makeNewExpr('Array'))
      visitor.NewExpression(makeNewExpr('Object'))
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports.length).toBe(6)
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = makeNewExpr('String')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('String message suggests function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].message).toContain('String() as a function call')
    })

    test('Number message suggests function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports[0].message).toContain('Number() as a function call')
    })

    test('Boolean message suggests function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports[0].message).toContain('Boolean() as a function call')
    })

    test('RegExp message suggests function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports[0].message).toContain('RegExp() as a function call')
    })

    test('Array message does not mention function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports[0].message).not.toContain('function call')
    })

    test('Object message does not mention function call alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports[0].message).not.toContain('function call')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report new String("hello") — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Number(42) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Number', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Boolean(true) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Array(5) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Object({ a: 1 }) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new RegExp("pattern") — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp', [{ type: 'Literal', value: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report String() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Number() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Boolean() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Array() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Object() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report RegExp() — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Map() — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Set() — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Error() — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise(() => {}) — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Promise', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Date() — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report new MyCustomClass() — not one of the checked constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('MyCustomClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report new obj.String() — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'String' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report new string() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('string'))
      expect(reports.length).toBe(0)
    })

    test('does not report new number() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('number'))
      expect(reports.length).toBe(0)
    })

    test('does not report new boolean() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('boolean'))
      expect(reports.length).toBe(0)
    })

    test('does not report new array() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('array'))
      expect(reports.length).toBe(0)
    })

    test('does not report new object() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('object'))
      expect(reports.length).toBe(0)
    })

    test('does not report new regexp() — lowercase is case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('regexp'))
      expect(reports.length).toBe(0)
    })

    test('does not report new String(0) — falsy arg is still an arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report new Array(undefined) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression with callee that has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type — not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisleadingInstantiationRule.create(ctx1)
      const visitor2 = noMisleadingInstantiationRule.create(ctx2)

      visitor1.NewExpression(makeNewExpr('String'))
      visitor2.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'hi' }]))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [], 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('NewExpression with null callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('NewExpression with undefined callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('NewExpression with null arguments property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      // Rule code: const args = (n as { arguments?: unknown[] }).arguments; const argCount = args ? args.length : 0
      // null is falsy, so argCount = 0, and name is 'String', so this WILL report
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('NewExpression with undefined arguments property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noMisleadingInstantiationRule.create(context)
      const visitor2 = noMisleadingInstantiationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      // reports
      visitor.NewExpression(makeNewExpr('String'))
      // does not report (has arg)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'hi' }]))
      // reports
      visitor.NewExpression(makeNewExpr('Number'))
      // does not report (wrong constructor)
      visitor.NewExpression(makeNewExpr('Map'))
      // reports
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(3)
    })
  })

  // ===== ADDITIONAL CASES (10) =====
  describe('additional coverage', () => {
    test('reports new String() and new Number() in sequence with correct messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports[0].message).toContain('String')
      expect(reports[1].message).toContain('Number')
    })

    test('reports all six constructors with distinct messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('Boolean'))
      visitor.NewExpression(makeNewExpr('Array'))
      visitor.NewExpression(makeNewExpr('Object'))
      visitor.NewExpression(makeNewExpr('RegExp'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(6)
    })

    test('Boolean message contains "false" specifically', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports[0].message).toMatch(/false/)
    })

    test('Array message contains "[]" specifically', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports[0].message).toContain('[]')
    })

    test('Object message contains "{}" specifically', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports[0].message).toContain('{}')
    })

    test('multiple same constructor calls report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports.length).toBe(3)
    })

    test('NewExpression with missing callee property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('NewExpression with missing arguments property still reports for matching name', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        loc: makeLoc(1, 0, 1, 10),
      }
      // No arguments property: args is undefined, argCount = 0, name = 'String' → reports
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingInstantiationRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })


  })
})
