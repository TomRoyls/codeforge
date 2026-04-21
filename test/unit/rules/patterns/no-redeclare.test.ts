import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { noRedeclareRule } from '../../../../src/rules/patterns/no-redeclare.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        loc: descriptor.loc,
        message: descriptor.message,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    loc: {
      end: { column: column + name.length, line },
      start: { column, line },
    },
    name,
    type: 'Identifier',
  }
}

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    id: createIdentifier(name, line, column),
    init: { type: 'Literal', value: 1 },
    loc: {
      end: { column: column + name.length + 5, line },
      start: { column, line },
    },
    parent: {
      kind: 'const',
    },
    type: 'VariableDeclarator',
  }
}

function createFunctionDeclaration(name: string, params: string[], line = 1, column = 0): unknown {
  return {
    body: { body: [], type: 'BlockStatement' },
    id: createIdentifier(name, line, column),
    loc: {
      end: { column: column + 20, line: line + 2 },
      start: { column, line },
    },
    params: params.map((p, i) => createIdentifier(p, line + 1, column + i * 5)),
    type: 'FunctionDeclaration',
  }
}

describe('no-redeclare rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noRedeclareRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noRedeclareRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noRedeclareRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noRedeclareRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention redeclaring in description', () => {
      expect(noRedeclareRule.meta.docs?.description.toLowerCase()).toContain('redeclaring')
    })

    test('should have empty schema array', () => {
      expect(noRedeclareRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noRedeclareRule.meta.fixable).toBeUndefined()
    })

    test('should mention variables in description', () => {
      expect(noRedeclareRule.meta.docs?.description.toLowerCase()).toContain('variables')
    })

    test('should have a docs object', () => {
      expect(noRedeclareRule.meta.docs).toBeDefined()
    })

    test('should have a string description', () => {
      expect(typeof noRedeclareRule.meta.docs?.description).toBe('string')
    })

    test('should have a non-empty description', () => {
      expect(noRedeclareRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noRedeclareRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noRedeclareRule.meta.severity)
    })

    test('should not be deprecated', () => {
      expect(noRedeclareRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noRedeclareRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noRedeclareRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noRedeclareRule.meta.schema)).toBe(true)
    })

    test('should have schema with zero length', () => {
      expect(noRedeclareRule.meta.schema).toHaveLength(0)
    })

    test('should have docs with recommended as boolean', () => {
      expect(typeof noRedeclareRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs with category as string', () => {
      expect(typeof noRedeclareRule.meta.docs?.category).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with VariableDeclarator method', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with only expected methods', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(Object.keys(visitor).sort()).toEqual(['FunctionDeclaration', 'VariableDeclarator'])
    })

    test('should return callable VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should return callable FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })
  })

  describe('detecting variable redeclarations', () => {
    test('should not report single variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple unique variable declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))

      expect(reports.length).toBe(0)
    })

    test('should report when variable is declared twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should report when variable is declared three times', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(2)
    })

    test('should report with correct message for redeclared variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))

      expect(reports[0].message).toBe("'myVar' is already defined.")
    })

    test('should report when variable redeclared among unique variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report multiple redeclared variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))

      expect(reports.length).toBe(2)
    })

    test('should report redeclaration with const keyword parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('foo'),
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { kind: 'const' },
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('foo', 2, 0),
        init: null,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
        parent: { kind: 'const' },
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should report redeclaration with let keyword parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('bar'),
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { kind: 'let' },
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('bar', 2, 0),
        init: null,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
        parent: { kind: 'let' },
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should report redeclaration with var keyword parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('baz'),
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { kind: 'var' },
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('baz', 2, 0),
        init: null,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
        parent: { kind: 'var' },
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should be case-sensitive for variable names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor.VariableDeclarator(createVariableDeclarator('MyVar'))
      visitor.VariableDeclarator(createVariableDeclarator('MYVAR'))

      expect(reports.length).toBe(0)
    })

    test('should not report when first and third variables share a name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('a'))

      expect(reports.length).toBe(1)
    })

    test('should report each subsequent redeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('dup'))
      visitor.VariableDeclarator(createVariableDeclarator('dup'))
      visitor.VariableDeclarator(createVariableDeclarator('dup'))
      visitor.VariableDeclarator(createVariableDeclarator('dup'))

      expect(reports.length).toBe(3)
    })

    test('should track variable names separately from function names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('item'))
      visitor.VariableDeclarator(createVariableDeclarator('item'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('item')
    })
  })

  describe('detecting function redeclarations', () => {
    test('should not report single function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple unique function declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('func1', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('func2', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('func3', []))

      expect(reports.length).toBe(0)
    })

    test('should report when function is declared twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for redeclared function', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('helper', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('helper', []))

      expect(reports[0].message).toBe("'helper' is already defined.")
    })

    test('should report when function is declared three times', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))

      expect(reports.length).toBe(2)
    })

    test('should be case-sensitive for function names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handler', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('Handler', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('HANDLER', []))

      expect(reports.length).toBe(0)
    })

    test('should report each subsequent function redeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('cb', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('cb', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('cb', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('cb', []))

      expect(reports.length).toBe(3)
    })

    test('should report when function name redeclared among unique functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('alpha', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('beta', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('gamma', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('beta', []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beta')
    })

    test('should not report functions with different params as redeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('compute', ['a']))
      visitor.FunctionDeclaration(createFunctionDeclaration('compute', ['a', 'b']))

      expect(reports.length).toBe(1)
    })
  })

  describe('mixed variable and function declarations', () => {
    test('should report when variable and function have same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('x', []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report when function and variable have same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('y', []))
      visitor.VariableDeclarator(createVariableDeclarator('y'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('y')
    })

    test('should not report when variable and function have different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('var1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func1', []))

      expect(reports.length).toBe(0)
    })

    test('should report triple redeclaration: variable then function then variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.FunctionDeclaration(createFunctionDeclaration('shared', []))
      visitor.VariableDeclarator(createVariableDeclarator('shared'))

      expect(reports.length).toBe(2)
    })

    test('should report triple redeclaration: function then variable then function', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('shared', []))
      visitor.VariableDeclarator(createVariableDeclarator('shared'))
      visitor.FunctionDeclaration(createFunctionDeclaration('shared', []))

      expect(reports.length).toBe(2)
    })

    test('should track multiple mixed declarations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', []))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.FunctionDeclaration(createFunctionDeclaration('d', []))

      expect(reports.length).toBe(0)
    })

    test('should report interleaved mixed redeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('name'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name', []))
      visitor.VariableDeclarator(createVariableDeclarator('other'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name', []))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.VariableDeclarator()).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.FunctionDeclaration()).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        init: { type: 'Literal', value: 1 },
        type: 'VariableDeclarator',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: { properties: [], type: 'ObjectPattern' },
        init: { type: 'Literal', value: 1 },
        type: 'VariableDeclarator',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: null,
        params: [],
        type: 'FunctionDeclaration',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: { type: 'Literal', value: 'anonymous' },
        params: [],
        type: 'FunctionDeclaration',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle variable without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: { type: 'Identifier' },
        init: { type: 'Literal', value: 1 },
        type: 'VariableDeclarator',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle function without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: { type: 'Identifier' },
        params: [],
        type: 'FunctionDeclaration',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with ArrayPattern id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: { elements: [], type: 'ArrayPattern' },
        init: { type: 'Literal', value: 1 },
        type: 'VariableDeclarator',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(''))
      visitor.VariableDeclarator(createVariableDeclarator(''))

      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type string in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: createIdentifier('wrongType'),
        init: { type: 'Literal', value: 1 },
        type: 'ExpressionStatement',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: createIdentifier('wrongType'),
        params: [],
        type: 'ArrowFunctionExpression',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(() => visitor.VariableDeclarator(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
      expect(() => visitor.VariableDeclarator(-1)).not.toThrow()
      expect(() => visitor.VariableDeclarator(Infinity)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(-1)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(Infinity)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with undefined id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: undefined,
        init: { type: 'Literal', value: 1 },
        type: 'VariableDeclarator',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration with undefined id', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: undefined,
        params: [],
        type: 'FunctionDeclaration',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('noLoc'),
        init: null,
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('noLoc'),
        init: null,
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      expect(() => visitor.VariableDeclarator(node2)).not.toThrow()

      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('nullLoc'),
        init: null,
        loc: null,
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('nullLoc'),
        init: null,
        loc: null,
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: createIdentifier('partialLoc'),
        init: null,
        loc: { start: { line: 1, column: 0 } },
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-standard loc shape', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('weirdLoc'),
        init: null,
        loc: 'not-an-object',
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('weirdLoc'),
        init: null,
        loc: 'not-an-object',
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: { name: 42, type: 'Identifier' },
        init: null,
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: { name: 42, type: 'Identifier' },
        init: null,
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should handle empty body in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: createIdentifier('emptyFn'),
        params: [],
        type: 'FunctionDeclaration',
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: createIdentifier('noBody'),
        params: [],
        type: 'FunctionDeclaration',
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for redeclared variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for redeclared function', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', [], 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location with correct end for variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('locVar'))
      visitor.VariableDeclarator(createVariableDeclarator('locVar', 5, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report location with correct end for function', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('locFn', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('locFn', [], 8, 3))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node1 = {
        id: createIdentifier('noLocVar'),
        init: null,
        type: 'VariableDeclarator',
      }
      const node2 = {
        id: createIdentifier('noLocVar'),
        init: null,
        type: 'VariableDeclarator',
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct column in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('col', 1, 20))
      visitor.VariableDeclarator(createVariableDeclarator('col', 3, 40))

      expect(reports[0].loc?.start.column).toBe(40)
    })

    test('should handle multiple reports at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('multi', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('multi', 5, 10))
      visitor.VariableDeclarator(createVariableDeclarator('multi', 10, 20))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should report location from second node not first', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('target', 100, 50))
      visitor.VariableDeclarator(createVariableDeclarator('target', 2, 0))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.line).not.toBe(100)
    })

    test('should provide loc object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('locTest'))
      visitor.VariableDeclarator(createVariableDeclarator('locTest', 7, 3))

      const report = reports[0]
      expect(report.loc).toBeDefined()
      expect(report.loc?.start).toBeDefined()
      expect(report.loc?.end).toBeDefined()
      expect(typeof report.loc?.start.line).toBe('number')
      expect(typeof report.loc?.start.column).toBe('number')
      expect(typeof report.loc?.end.line).toBe('number')
      expect(typeof report.loc?.end.column).toBe('number')
    })
  })

  describe('message content', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('testVar'))
      visitor.VariableDeclarator(createVariableDeclarator('testVar'))

      expect(reports[0].message).toContain('testVar')
    })

    test('should mention already defined in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports[0].message).toContain('already defined')
    })

    test('should use single quotes around variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports[0].message).toContain("'x'")
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('var1'))
      visitor.VariableDeclarator(createVariableDeclarator('var1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func1', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('func1', []))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toMatch(/^'.*' is already defined\.$/)
      expect(reports[1].message).toMatch(/^'.*' is already defined\.$/)
    })

    test('should use period at end of message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('punct'))
      visitor.VariableDeclarator(createVariableDeclarator('punct'))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should use exact format NAME is already defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('exact'))
      visitor.VariableDeclarator(createVariableDeclarator('exact'))

      expect(reports[0].message).toBe("'exact' is already defined.")
    })

    test('should have consistent format for function messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('exactFn', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('exactFn', []))

      expect(reports[0].message).toBe("'exactFn' is already defined.")
    })

    test('should have consistent format for mixed messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('mixed'))
      visitor.FunctionDeclaration(createFunctionDeclaration('mixed', []))

      expect(reports[0].message).toBe("'mixed' is already defined.")
    })

    test('should include identifier name in each report for multiple redeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('multi'))
      visitor.VariableDeclarator(createVariableDeclarator('multi'))
      visitor.VariableDeclarator(createVariableDeclarator('multi'))

      expect(reports[0].message).toContain('multi')
      expect(reports[1].message).toContain('multi')
    })

    test('should have same message format for variable and function redeclarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('name1'))
      visitor.VariableDeclarator(createVariableDeclarator('name1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name2', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('name2', []))

      const varMsg = reports[0].message
      const fnMsg = reports[1].message

      const pattern = /^'.*' is already defined\.$/
      expect(varMsg).toMatch(pattern)
      expect(fnMsg).toMatch(pattern)
    })
  })

  describe('multiple reports', () => {
    test('should report 5 redeclarations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      for (let i = 0; i < 6; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('dup5', i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 redeclarations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      for (let i = 0; i < 11; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('dup10', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report 50 redeclarations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      for (let i = 0; i < 51; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('dup50', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should report 100 redeclarations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      for (let i = 0; i < 101; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('dup100', i + 1, 0))
      }

      expect(reports.length).toBe(100)
    })

    test('should report each redeclaration of different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))

      expect(reports.length).toBe(3)
    })

    test('should report mixed redeclarations at scale', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      for (let i = 0; i < 10; i++) {
        const name = `name${i}`
        visitor.VariableDeclarator(createVariableDeclarator(name))
        visitor.FunctionDeclaration(createFunctionDeclaration(name, []))
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function foo() { const x = 1; const x = 2; }',
      )
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/empty.ts', '')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with options in context', () => {
      const { context, reports } = createMockContext({ someOption: true })
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\Users\\dev\\project\\file.ts')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with relative file path', () => {
      const { context, reports } = createMockContext({}, './src/relative.ts')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports.length).toBe(1)
    })

    test('should work with deep nested file path', () => {
      const { context, reports } = createMockContext({}, '/a/b/c/d/e/f/g/deep.ts')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('deep'))
      visitor.VariableDeclarator(createVariableDeclarator('deep'))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext({}, '/src/script.js')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('js'))
      visitor.VariableDeclarator(createVariableDeclarator('js'))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('tsx'))
      visitor.VariableDeclarator(createVariableDeclarator('tsx'))

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export the rule as named export', () => {
      expect(noRedeclareRule).toBeDefined()
    })

    test('should export an object with meta property', () => {
      expect(noRedeclareRule).toHaveProperty('meta')
    })

    test('should export an object with create property', () => {
      expect(noRedeclareRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noRedeclareRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noRedeclareRule.meta).toBe('object')
      expect(noRedeclareRule.meta).not.toBeNull()
    })
  })

  describe('visitor independence', () => {
    test('should not share state between two visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noRedeclareRule.create(ctx1)
      const visitor2 = noRedeclareRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('independent'))

      visitor2.VariableDeclarator(createVariableDeclarator('independent'))
      visitor2.VariableDeclarator(createVariableDeclarator('independent'))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('should not share state between visitors with function declarations', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noRedeclareRule.create(ctx1)
      const visitor2 = noRedeclareRule.create(ctx2)

      visitor1.FunctionDeclaration(createFunctionDeclaration('fn', []))

      visitor2.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor2.FunctionDeclaration(createFunctionDeclaration('fn', []))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('should not share state across mixed visitor types', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const { context: ctx3, reports: reports3 } = createMockContext()

      const visitor1 = noRedeclareRule.create(ctx1)
      const visitor2 = noRedeclareRule.create(ctx2)
      const visitor3 = noRedeclareRule.create(ctx3)

      visitor1.VariableDeclarator(createVariableDeclarator('cross'))
      visitor1.FunctionDeclaration(createFunctionDeclaration('cross', []))

      visitor2.VariableDeclarator(createVariableDeclarator('cross'))

      visitor3.VariableDeclarator(createVariableDeclarator('cross'))
      visitor3.FunctionDeclaration(createFunctionDeclaration('cross', []))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
      expect(reports3.length).toBe(1)
    })

    test('should track declarations independently per visitor', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noRedeclareRule.create(ctx1)
      const visitor2 = noRedeclareRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('a'))
      visitor1.VariableDeclarator(createVariableDeclarator('b'))
      visitor2.VariableDeclarator(createVariableDeclarator('b'))
      visitor2.VariableDeclarator(createVariableDeclarator('a'))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(0)
    })

    test('should isolate many visitors from each other', () => {
      const visitors = Array.from({ length: 10 }, () => {
        const { context, reports } = createMockContext()
        return { context, reports, visitor: noRedeclareRule.create(context) }
      })

      visitors.forEach(({ visitor }) => {
        visitor.VariableDeclarator(createVariableDeclarator('isolated'))
      })

      visitors.forEach(({ visitor }) => {
        visitor.VariableDeclarator(createVariableDeclarator('isolated'))
      })

      visitors.forEach(({ reports }) => {
        expect(reports.length).toBe(1)
      })
    })
  })

  describe('safe cases - no redeclaration', () => {
    test.each([
      { name: 'x' },
      { name: 'y' },
      { name: 'z' },
      { name: 'abc' },
      { name: 'myVariable' },
      { name: '_private' },
      { name: '$jquery' },
      { name: 'camelCase' },
      { name: 'PascalCase' },
      { name: 'UPPER_CASE' },
      { name: '__proto__' },
      { name: 'a1' },
      { name: 'test123' },
      { name: 'foo_bar_baz' },
      { name: 'résumé' },
    ])('should not report single declaration of $name', ({ name }) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(name))

      expect(reports.length).toBe(0)
    })

    test.each([
      ['x', 'y'],
      ['a', 'b'],
      ['foo', 'bar'],
      ['var1', 'var2'],
      ['alpha', 'beta'],
      ['first', 'second'],
      ['one', 'two'],
      ['src', 'dest'],
      ['input', 'output'],
      ['begin', 'end'],
    ])('should not report unique variables %s and %s', (name1, name2) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(name1))
      visitor.VariableDeclarator(createVariableDeclarator(name2))

      expect(reports.length).toBe(0)
    })

    test.each([
      { name: 'fn1' },
      { name: 'handler' },
      { name: 'callback' },
      { name: 'process' },
      { name: 'validate' },
      { name: 'transform' },
      { name: 'compute' },
      { name: 'render' },
      { name: 'init' },
      { name: 'destroy' },
    ])('should not report single function declaration of $name', ({ name }) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(name, []))

      expect(reports.length).toBe(0)
    })

    test.each([
      ['fn1', 'fn2'],
      ['onClick', 'onChange'],
      ['getData', 'setData'],
      ['parse', 'stringify'],
      ['encode', 'decode'],
      ['serialize', 'deserialize'],
      ['mount', 'unmount'],
      ['connect', 'disconnect'],
      ['open', 'close'],
      ['start', 'stop'],
    ])('should not report unique functions %s and %s', (name1, name2) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(name1, []))
      visitor.FunctionDeclaration(createFunctionDeclaration(name2, []))

      expect(reports.length).toBe(0)
    })

    test.each([
      { varName: 'data', fnName: 'process' },
      { varName: 'count', fnName: 'increment' },
      { varName: 'items', fnName: 'filter' },
      { varName: 'name', fnName: 'greet' },
      { varName: 'result', fnName: 'calculate' },
      { varName: 'config', fnName: 'setup' },
      { varName: 'path', fnName: 'resolve' },
      { varName: 'value', fnName: 'transform' },
      { varName: 'error', fnName: 'handleError' },
      { varName: 'state', fnName: 'update' },
    ])('should not report variable "$varName" and function "$fnName"', ({ varName, fnName }) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(varName))
      visitor.FunctionDeclaration(createFunctionDeclaration(fnName, []))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-matching node types', () => {
    test.each([
      { type: 'ExpressionStatement' },
      { type: 'BlockStatement' },
      { type: 'IfStatement' },
      { type: 'ForStatement' },
      { type: 'WhileStatement' },
      { type: 'ReturnStatement' },
      { type: 'ThrowStatement' },
      { type: 'TryStatement' },
      { type: 'ClassDeclaration' },
      { type: 'ImportDeclaration' },
    ])('should not crash on $type in VariableDeclarator handler', ({ type }) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        id: createIdentifier('testNode'),
        init: null,
        type,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test.each([
      { type: 'ExpressionStatement' },
      { type: 'BlockStatement' },
      { type: 'IfStatement' },
      { type: 'ForStatement' },
      { type: 'WhileStatement' },
      { type: 'ReturnStatement' },
      { type: 'ArrowFunctionExpression' },
      { type: 'ClassDeclaration' },
      { type: 'ImportDeclaration' },
      { type: 'ExportNamedDeclaration' },
    ])('should not crash on $type in FunctionDeclaration handler', ({ type }) => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const node = {
        body: { body: [], type: 'BlockStatement' },
        id: createIdentifier('testNode'),
        params: [],
        type,
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('identifier name variations', () => {
    test('should handle single letter names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('a'))

      expect(reports[0].message).toBe("'a' is already defined.")
    })

    test('should handle very long names', () => {
      const longName = 'a'.repeat(200)
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(longName))
      visitor.VariableDeclarator(createVariableDeclarator(longName))

      expect(reports[0].message).toBe(`'${longName}' is already defined.`)
    })

    test('should handle names with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('__private__'))
      visitor.VariableDeclarator(createVariableDeclarator('__private__'))

      expect(reports[0].message).toBe("'__private__' is already defined.")
    })

    test('should handle names with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$jquery'))
      visitor.VariableDeclarator(createVariableDeclarator('$jquery'))

      expect(reports[0].message).toBe("'$jquery' is already defined.")
    })

    test('should handle unicode names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('π'))
      visitor.VariableDeclarator(createVariableDeclarator('π'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('π')
    })

    test('should handle names that look like keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('classy'))
      visitor.VariableDeclarator(createVariableDeclarator('classy'))

      expect(reports.length).toBe(1)
    })
  })

  describe('declaration order', () => {
    test('should report when variable comes before function with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('order'))
      visitor.FunctionDeclaration(createFunctionDeclaration('order', []))

      expect(reports.length).toBe(1)
    })

    test('should report when function comes before variable with same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('order', []))
      visitor.VariableDeclarator(createVariableDeclarator('order'))

      expect(reports.length).toBe(1)
    })

    test('should track declarations in order of invocation', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.FunctionDeclaration(createFunctionDeclaration('d', []))
      visitor.FunctionDeclaration(createFunctionDeclaration('e', []))
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', []))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.FunctionDeclaration(createFunctionDeclaration('d', []))
      visitor.VariableDeclarator(createVariableDeclarator('e'))

      expect(reports.length).toBe(5)
    })
  })

  describe('return value of visitor methods', () => {
    test('should return undefined from VariableDeclarator for valid node', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const result = visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(result).toBeUndefined()
    })

    test('should return undefined from FunctionDeclaration for valid node', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const result = visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))

      expect(result).toBeUndefined()
    })

    test('should return undefined from VariableDeclarator for null node', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const result = visitor.VariableDeclarator(null)

      expect(result).toBeUndefined()
    })

    test('should return undefined from FunctionDeclaration for null node', () => {
      const { context } = createMockContext()
      const visitor = noRedeclareRule.create(context)

      const result = visitor.FunctionDeclaration(null)

      expect(result).toBeUndefined()
    })
  })
})
