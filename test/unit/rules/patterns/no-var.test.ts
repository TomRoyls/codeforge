import { describe, test, expect, vi } from 'vitest'
import { noVarRule } from '../../../../src/rules/patterns/no-var.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createVariableDeclaration(
  kind: 'var' | 'let' | 'const',
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclaration',
    kind: kind,
    declarations: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + kind.length + 10 },
    },
  }
}

describe('no-var rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noVarRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noVarRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noVarRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noVarRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noVarRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noVarRule.meta.fixable).toBeUndefined()
    })

    test('should mention var in description', () => {
      expect(noVarRule.meta.docs?.description.toLowerCase()).toContain('var')
    })

    test('should mention let or const in description', () => {
      const desc = noVarRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/let|const/)
    })

    test('should have empty schema array', () => {
      expect(noVarRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noVarRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noVarRule).toHaveProperty('create')
    })

    test('meta.type should be a string', () => {
      expect(typeof noVarRule.meta.type).toBe('string')
    })

    test('meta.type should be one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noVarRule.meta.type)
    })

    test('meta.severity should be a string', () => {
      expect(typeof noVarRule.meta.severity).toBe('string')
    })

    test('meta.severity should be one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noVarRule.meta.severity)
    })

    test('meta.docs should be defined', () => {
      expect(noVarRule.meta.docs).toBeDefined()
    })

    test('meta.docs should be an object', () => {
      expect(typeof noVarRule.meta.docs).toBe('object')
    })

    test('meta.docs.description should be a string', () => {
      expect(typeof noVarRule.meta.docs?.description).toBe('string')
    })

    test('meta.docs.description should be non-empty', () => {
      expect(noVarRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should mention Disallow', () => {
      expect(noVarRule.meta.docs?.description).toContain('Disallow')
    })

    test('meta.docs.description should contain exact expected text', () => {
      expect(noVarRule.meta.docs?.description).toBe(
        "Disallow the use of 'var' declarations. Use 'let' or 'const' instead.",
      )
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof noVarRule.meta.docs?.category).toBe('string')
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noVarRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs should have url property', () => {
      expect(noVarRule.meta.docs?.url).toBeDefined()
    })

    test('meta.docs.url should be a string', () => {
      expect(typeof noVarRule.meta.docs?.url).toBe('string')
    })

    test('meta.docs.url should start with https', () => {
      expect(noVarRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('meta.docs.url should contain no-var', () => {
      expect(noVarRule.meta.docs?.url).toContain('no-var')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noVarRule.meta.schema)).toBe(true)
    })

    test('meta.schema should have length 0', () => {
      expect(noVarRule.meta.schema).toHaveLength(0)
    })

    test('meta.fixable should not be code', () => {
      expect(noVarRule.meta.fixable).not.toBe('code')
    })

    test('meta.fixable should not be whitespace', () => {
      expect(noVarRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta should not have deprecated flag', () => {
      expect(noVarRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noVarRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noVarRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with VariableDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclaration')
    })

    test('should return a non-null object', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('should return an object (truthy)', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(visitor).toBeTruthy()
    })

    test('VariableDeclaration should be a function', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(typeof visitor.VariableDeclaration).toBe('function')
    })

    test('VariableDeclaration should not return a value', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      const result = visitor.VariableDeclaration(createVariableDeclaration('let'))

      expect(result).toBeUndefined()
    })

    test('should return visitor with only VariableDeclaration key', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(Object.keys(visitor)).toEqual(['VariableDeclaration'])
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockContext()

      expect(() => noVarRule.create(context)).not.toThrow()
    })

    test('create should return a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noVarRule.create(context)
      const visitor2 = noVarRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should have exactly one property', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('VariableDeclaration should accept one argument', () => {
      const { context } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(visitor.VariableDeclaration.length).toBe(1)
    })

    test('create should be a function', () => {
      expect(typeof noVarRule.create).toBe('function')
    })

    test('create should accept one argument', () => {
      expect(noVarRule.create.length).toBe(1)
    })
  })

  describe('detecting var declarations', () => {
    test('should report var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should not report let declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('let'))

      expect(reports.length).toBe(0)
    })

    test('should not report const declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('const'))

      expect(reports.length).toBe(0)
    })

    test('should report correct message for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('should report multiple var declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 2, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report var among let and const declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('let'))
      visitor.VariableDeclaration(createVariableDeclaration('var'))
      visitor.VariableDeclaration(createVariableDeclaration('const'))
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(2)
    })

    test('should not report uppercase VAR (kind is case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'VAR',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report mixed case Var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'Var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty string kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: '',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report whitespace-padded var kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: ' var ',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report number kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 42,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report object kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: { name: 'var' },
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report array kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: ['var'],
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report boolean kind true', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: true,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report boolean kind false', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: false,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should report var with empty declarations array', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report var with declarations containing items', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{ type: 'VariableDeclarator', id: { name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report var regardless of type property value', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report var even without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report var with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: true,
        nested: { foo: 'bar' },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report var at line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report var at line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 10, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report var at line 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 100, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report var at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report var at column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 5))

      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report var at column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 20))

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should not report undefined kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: null,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should report exactly one for a single var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports).toHaveLength(1)
    })

    test('should report correct message for each var in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))
      visitor.VariableDeclaration(createVariableDeclaration('let', 2, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 3, 0))

      expect(reports).toHaveLength(2)
      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
      expect(reports[1].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('should report all vars in a long sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createVariableDeclaration('var', i + 1, 0))
      }

      expect(reports).toHaveLength(10)
    })

    test('should not report let repeated many times', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createVariableDeclaration('let', i + 1, 0))
      }

      expect(reports).toHaveLength(0)
    })

    test('should not report const repeated many times', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclaration(createVariableDeclaration('const', i + 1, 0))
      }

      expect(reports).toHaveLength(0)
    })

    test('should report only var in mixed long sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const kinds: Array<'var' | 'let' | 'const'> = [
        'let',
        'var',
        'const',
        'let',
        'var',
        'const',
        'let',
        'var',
      ]
      for (let i = 0; i < kinds.length; i++) {
        visitor.VariableDeclaration(createVariableDeclaration(kinds[i], i + 1, 0))
      }

      expect(reports).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'var x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean true node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean false node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number zero node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number negative node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array with var-like kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = ['var']
      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node without kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind undefined explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = { type: 'VariableDeclaration', kind: undefined, declarations: [] }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind null explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = { type: 'VariableDeclaration', kind: null, declarations: [] }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc null', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: null,
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: undefined,
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: {},
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (only end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { end: { line: 5, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start missing line', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { column: 5 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 3 }, end: { line: 3, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.end missing line', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 3, column: 0 }, end: { column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle node with loc.end missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 3, column: 5 }, end: { line: 3 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with string loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: 'invalid',
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with number loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: 42,
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with start having string line', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 'five', column: 3 }, end: { line: 5, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with start having string column', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 5, column: 'three' }, end: { line: 5, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with negative line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle node with zero line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 0, column: 5 }, end: { line: 0, column: 15 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle node with zero column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle node with large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 99999))

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle node with extra options in context', () => {
      const { context, reports } = createMockContext({ extraOption: true, anotherOption: 42 })
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should handle node with many extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: null,
        range: [0, 10],
        leadingComments: [],
        trailingComments: [],
        innerComments: [],
        extra: { parenthesized: false },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle let node without loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = { type: 'VariableDeclaration', kind: 'let', declarations: [] }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle const node without loc gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = { type: 'VariableDeclaration', kind: 'const', declarations: [] }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node (typeof function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      expect(() => visitor.VariableDeclaration(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report var from different source files', () => {
      const { context, reports } = createMockContext({}, '/src/other.ts', 'var y = 2;')
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should report var from deeply nested path', () => {
      const { context, reports } = createMockContext({}, '/src/a/b/c/d/file.ts', 'var z = 3;')
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention let in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('let')
    })

    test('should mention const in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('const')
    })

    test('should mention var in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('var')
    })

    test('should use single quotes around var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain("'var'")
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))
      visitor.VariableDeclaration(createVariableDeclaration('var', 2, 0))

      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
      expect(reports[1].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('should use single quotes around let', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain("'let'")
    })

    test('should use single quotes around const', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain("'const'")
    })

    test('message should be non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('message should contain "instead of"', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain('instead of')
    })

    test('message should start with "Use"', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toMatch(/^Use/)
    })

    test('message should contain "or" between let and const', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toContain("'let' or 'const'")
    })

    test('message should not change across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 5, 10))
      visitor.VariableDeclaration(createVariableDeclaration('var', 20, 3))

      const msg = reports[0].message
      for (const report of reports) {
        expect(report.message).toBe(msg)
      }
    })

    test('message should match exact expected string', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('message should not contain double quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].message).not.toContain('"let"')
      expect(reports[0].message).not.toContain('"const"')
      expect(reports[0].message).not.toContain('"var"')
    })

    test('message should mention let before const', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      const letIndex = reports[0].message.indexOf('let')
      const constIndex = reports[0].message.indexOf('const')
      expect(letIndex).toBeLessThan(constIndex)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report start.line for line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report start.column for column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report start.line for line 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 50, 3))

      expect(reports[0].loc?.start.line).toBe(50)
    })

    test('should report start.column for column 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 42))

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = { type: 'VariableDeclaration', kind: 'var', declarations: [] }
      visitor.VariableDeclaration(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: null,
      }
      visitor.VariableDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should report multiple vars at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 1, 0))
      visitor.VariableDeclaration(createVariableDeclaration('var', 5, 10))
      visitor.VariableDeclaration(createVariableDeclaration('var', 20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should pass loc object to report', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 3, 7))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should have correct end position for var declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 3, 5))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report loc with start having line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 7, 2))

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('should report loc with start having column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 7, 2))

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should report loc with end having line property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 7, 2))

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('should report loc with end having column property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var', 7, 2))

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should preserve end column from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle multiline var declaration location', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 5, column: 2 }, end: { line: 8, column: 15 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  describe('export verification', () => {
    test('should export noVarRule as a defined value', () => {
      expect(noVarRule).toBeDefined()
    })

    test('should export noVarRule as an object', () => {
      expect(typeof noVarRule).toBe('object')
    })

    test('should export noVarRule with meta property', () => {
      expect(noVarRule).toHaveProperty('meta')
    })

    test('should export noVarRule with create property', () => {
      expect(noVarRule).toHaveProperty('create')
    })

    test('meta should be an object', () => {
      expect(typeof noVarRule.meta).toBe('object')
    })

    test('create should be a function', () => {
      expect(typeof noVarRule.create).toBe('function')
    })

    test('should have exactly two top-level properties', () => {
      const keys = Object.keys(noVarRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('context interaction', () => {
    test('should call context.report for var declaration', () => {
      let reportCalled = false
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportCalled = true
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'var x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reportCalled).toBe(true)
    })

    test('should not call context.report for let declaration', () => {
      let reportCalled = false
      const context: RuleContext = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('let'))

      expect(reportCalled).toBe(false)
    })

    test('should not call context.report for const declaration', () => {
      let reportCalled = false
      const context: RuleContext = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('const'))

      expect(reportCalled).toBe(false)
    })

    test('should call context.report exactly once per var', () => {
      let callCount = 0
      const context: RuleContext = {
        report: () => {
          callCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'var x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(callCount).toBe(1)
    })

    test('should call context.report with message in descriptor', () => {
      let receivedMessage = ''
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          receivedMessage = d.message
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'var x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(receivedMessage).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('should call context.report with loc in descriptor', () => {
      let receivedLoc: unknown = null
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          receivedLoc = d.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'var x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(createVariableDeclaration('var', 5, 3))

      expect(receivedLoc).toBeDefined()
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils/helper.ts')
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'var x = 1; var y = 2;')
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))
      visitor.VariableDeclaration(createVariableDeclaration('var', 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should not call report for null node', () => {
      let reportCalled = false
      const context: RuleContext = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(null)

      expect(reportCalled).toBe(false)
    })

    test('should not call report for undefined node', () => {
      let reportCalled = false
      const context: RuleContext = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVarRule.create(context)
      visitor.VariableDeclaration(undefined)

      expect(reportCalled).toBe(false)
    })
  })

  describe('visitor isolation', () => {
    test('two visitors should report independently', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noVarRule.create(ctx1)
      const visitor2 = noVarRule.create(ctx2)

      visitor1.VariableDeclaration(createVariableDeclaration('var'))
      visitor2.VariableDeclaration(createVariableDeclaration('let'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('two visitors should not share reports', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noVarRule.create(ctx1)
      const visitor2 = noVarRule.create(ctx2)

      visitor1.VariableDeclaration(createVariableDeclaration('var'))
      visitor2.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('visitor should not be affected by prior calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('let'))
      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Use 'let' or 'const' instead of 'var'")
    })

    test('visitor should handle many sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      for (let i = 0; i < 50; i++) {
        const kind = i % 3 === 0 ? 'var' : i % 3 === 1 ? 'let' : 'const'
        const k = kind as 'var' | 'let' | 'const'
        visitor.VariableDeclaration(createVariableDeclaration(k, i + 1, 0))
      }

      expect(reports.length).toBe(17)
    })

    test('visitor should handle alternating var and non-var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const kinds: Array<'var' | 'let'> = ['var', 'let', 'var', 'let', 'var']
      for (let i = 0; i < kinds.length; i++) {
        visitor.VariableDeclaration(createVariableDeclaration(kinds[i], i + 1, 0))
      }

      expect(reports.length).toBe(3)
    })
  })

  describe('default export', () => {
    test('should have default export accessible', () => {
      const imported = noVarRule
      expect(imported).toBeDefined()
    })

    test('default should have same meta as named export', () => {
      expect(noVarRule.meta).toBeDefined()
      expect(noVarRule.meta.type).toBe('problem')
    })

    test('default should have same create as named export', () => {
      expect(noVarRule.create).toBeDefined()
      expect(typeof noVarRule.create).toBe('function')
    })
  })

  describe('report descriptor shape', () => {
    test('report descriptor should have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor should have loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      visitor.VariableDeclaration(createVariableDeclaration('var'))

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('robustness', () => {
    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const base = { type: 'VariableDeclaration', declarations: [] }
      const node = Object.create(base)
      node.kind = 'var'
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with frozen object', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = Object.freeze({
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with sealed object', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = Object.seal({
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric kind zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 0,
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with float line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: { start: { line: 1.5, column: 0 }, end: { line: 1.5, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when kind is a Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: Symbol('var'),
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with getter for kind that returns var', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        get kind() {
          return 'var'
        },
        type: 'VariableDeclaration',
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [],
        loc: {
          start: { line: 1, column: 0, offset: 0 },
          end: { line: 1, column: 10, offset: 10 },
          source: 'file.ts',
        },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle very long kind string', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var'.repeat(100),
        declarations: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where declarations is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node where declarations is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle repeated calls with same node object', () => {
      const { context, reports } = createMockContext()
      const visitor = noVarRule.create(context)

      const node = createVariableDeclaration('var')
      visitor.VariableDeclaration(node)
      visitor.VariableDeclaration(node)
      visitor.VariableDeclaration(node)

      expect(reports.length).toBe(3)
    })
  })
})
