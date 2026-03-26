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
  })

  describe('message quality', () => {
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
  })
})
