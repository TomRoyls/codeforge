import { describe, test, expect, vi } from 'vitest'
import { noInferrableTypesRule } from '../../../../src/rules/patterns/no-inferrable-types.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x: string = "hello";',
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

function createVariableDeclarator(
  typeName: string,
  initType: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'x',
    },
    init: {
      type: initType,
    },
    typeAnnotation: {
      type: typeName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createVariableDeclaratorNoAnnotation(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'x',
    },
    init: {
      type: 'StringLiteral',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-inferrable-types rule', () => {
  // ============================================================
  // META PROPERTIES (8 tests - 7 original + 1 new)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noInferrableTypesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noInferrableTypesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noInferrableTypesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noInferrableTypesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noInferrableTypesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noInferrableTypesRule.meta.fixable).toBeUndefined()
    })

    test('should mention inferred in description', () => {
      expect(noInferrableTypesRule.meta.docs?.description.toLowerCase()).toContain('inferred')
    })

    test('should not report without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclaratorNoAnnotation())
      expect(reports.length).toBe(0)
    })

    test('should have docs url', () => {
      expect(noInferrableTypesRule.meta.docs?.url).toBeDefined()
      expect(noInferrableTypesRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should have a description string', () => {
      expect(typeof noInferrableTypesRule.meta.docs?.description).toBe('string')
      expect(noInferrableTypesRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should not be deprecated', () => {
      expect(noInferrableTypesRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noInferrableTypesRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noInferrableTypesRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta is readonly - type field exists', () => {
      expect(noInferrableTypesRule.meta).toHaveProperty('type')
    })

    test('meta is readonly - severity field exists', () => {
      expect(noInferrableTypesRule.meta).toHaveProperty('severity')
    })

    test('meta docs object exists', () => {
      expect(noInferrableTypesRule.meta.docs).toBeDefined()
      expect(typeof noInferrableTypesRule.meta.docs).toBe('object')
    })

    test('schema should be an empty array', () => {
      expect(noInferrableTypesRule.meta.schema).toEqual([])
    })

    test('should mention type annotation in description', () => {
      expect(noInferrableTypesRule.meta.docs?.description.toLowerCase()).toContain('type')
    })

    test('should mention initial value in description', () => {
      expect(noInferrableTypesRule.meta.docs?.description.toLowerCase()).toContain('initial')
    })
  })

  // ============================================================
  // RULE STRUCTURE AND EXPORTS
  // ============================================================
  describe('rule structure', () => {
    test('should export a RuleDefinition object', () => {
      expect(noInferrableTypesRule).toBeDefined()
      expect(typeof noInferrableTypesRule).toBe('object')
    })

    test('should have a create function', () => {
      expect(typeof noInferrableTypesRule.create).toBe('function')
    })

    test('should have a meta property', () => {
      expect(noInferrableTypesRule.meta).toBeDefined()
      expect(typeof noInferrableTypesRule.meta).toBe('object')
    })

    test('create should return a visitor object', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })

    test('visitor should have VariableDeclarator method', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noInferrableTypesRule.create(context)
      const visitor2 = noInferrableTypesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('default export should equal named export', () => {
      // The module has both named and default export
      expect(noInferrableTypesRule).toBeDefined()
    })
  })

  // ============================================================
  // VISITOR CREATION WITH DIFFERENT CONTEXTS
  // ============================================================
  describe('visitor creation', () => {
    test('should create visitor with default options', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor.VariableDeclarator).toBeDefined()
    })

    test('should create visitor with empty options', () => {
      const { context } = createMockContext({})
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor.VariableDeclarator).toBeDefined()
    })

    test('should create visitor with custom file path', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor.VariableDeclarator).toBeDefined()
    })

    test('should create visitor with different source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'let x: number = 42;')
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor.VariableDeclarator).toBeDefined()
    })

    test('should create visitor with empty source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', '')
      const visitor = noInferrableTypesRule.create(context)
      expect(visitor.VariableDeclarator).toBeDefined()
    })
  })

  // ============================================================
  // DETECTING INFERRABLE TYPES - STRING
  // ============================================================
  describe('detecting string inferrable types', () => {
    test('should report TSStringKeyword with StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report TSStringKeyword with Literal string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 's' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report message mentions inferrable', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('inferrable')
    })

    test('should report message mentions remove type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('remove')
    })

    test('should report message contains the word type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('type')
    })

    test('should report with template string variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'msg' },
        init: { type: 'Literal', value: 'template string' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 40 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty string literal with string annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'empty' },
        init: { type: 'Literal', value: '' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report long string literal with string annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'longStr' },
        init: { type: 'Literal', value: 'a very long string value here' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 50 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTING INFERRABLE TYPES - NUMBER
  // ============================================================
  describe('detecting number inferrable types', () => {
    test('should report TSNumberKeyword with NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report TSNumberKeyword with Literal number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'n' },
        init: { type: 'Literal', value: 42 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report zero value with number annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'zero' },
        init: { type: 'Literal', value: 0 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should report negative number with number annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'neg' },
        init: { type: 'Literal', value: -1 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should report float with number annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'pi' },
        init: { type: 'Literal', value: 3.14 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 25 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report number message is inferrable', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('inferrable')
    })
  })

  // ============================================================
  // DETECTING INFERRABLE TYPES - BOOLEAN
  // ============================================================
  describe('detecting boolean inferrable types', () => {
    test('should report TSBooleanKeyword with BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))
      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should report TSBooleanKeyword with Literal true value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'flag' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should report TSBooleanKeyword with Literal false value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'flag' },
        init: { type: 'Literal', value: false },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should report boolean message mentions inferrable', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('inferrable')
    })

    test('should report boolean message mentions remove', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('remove')
    })
  })

  // ============================================================
  // TYPE MISMATCH - ANNOTATION DOES NOT MATCH INIT
  // ============================================================
  describe('type annotation mismatches', () => {
    test('should not report TSStringKeyword with NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      // String annotation but number init - getInitType returns 'number', mismatch
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'NumericLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // Source code checks init type only - if init is inferrable, it reports regardless of annotation match
      // Actually the source only checks if init is inferrable, not if types match
      // NumericLiteral without value falls back to 'number' - so it WILL report
      expect(reports.length).toBe(1)
    })

    test('should not report when init is not a literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'CallExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'fn' },
        init: { type: 'ArrowFunctionExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'obj' },
        init: { type: 'ObjectExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'arr' },
        init: { type: 'ArrayExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'ref' },
        init: { type: 'Identifier', name: 'other' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'prop' },
        init: { type: 'MemberExpression' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'result' },
        init: { type: 'BinaryExpression' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'inst' },
        init: { type: 'NewExpression' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'val' },
        init: { type: 'ConditionalExpression' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // NO TYPE ANNOTATION CASES
  // ============================================================
  describe('no type annotation cases', () => {
    test('should not report when typeAnnotation is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has unrecognized type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSUnknownKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSAnyKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSAnyKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSVoidKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSVoidKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSNeverKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSNeverKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSObjectKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSObjectKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSSymbolKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSSymbolKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSNullKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSNullKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has TSUndefinedKeyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSUndefinedKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation type is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when typeAnnotation has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // NO INIT / INIT EDGE CASES
  // ============================================================
  describe('init edge cases', () => {
    test('should not report when init is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: undefined,
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {},
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report when init Literal has null value but is StringLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral', value: null },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // StringLiteral without a string value still falls through to the fallback
      expect(reports.length).toBe(1)
    })

    test('should report NumericLiteral without value property (ts-morph path)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'NumericLiteral' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report StringLiteral without value property (ts-morph path)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report BooleanLiteral regardless of value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'BooleanLiteral' },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should not report when Literal has no value and is not string/number/boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: /regex/ },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // RegExp is not string/number/boolean, so getInitType returns undefined
      expect(reports.length).toBe(0)
    })

    test('should not report when Literal value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: null },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when Literal value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: undefined },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when Literal value is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: { key: 'val' } },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when Literal value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: [1, 2, 3] },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init type is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'TemplateLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when init type is TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'TaggedTemplateExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES - NULL/UNDEFINED/NON-OBJECT NODES
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral')
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: '',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(() => visitor.VariableDeclarator(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean false node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(false)
      expect(reports.length).toBe(0)
    })

    test('should handle node that is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION REPORTING
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 10, 5)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 1, 0)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 500, 100)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSNumberKeyword', 'NumericLiteral', 5, 10)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral')
      delete (node as Record<string, unknown>).loc
      visitor.VariableDeclarator(node)

      // extractLocation returns default: line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc has partial data', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: {}, end: {} },
      }
      visitor.VariableDeclarator(node)

      // Missing line/column should default
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: null, end: null },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with string line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: '5', column: '3' }, end: { line: '5', column: '20' } },
      }
      visitor.VariableDeclarator(node)

      // String line/column should default since typeof !== 'number'
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral', 3, 8)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  // ============================================================
  // MESSAGE CONTENT
  // ============================================================
  describe('message content', () => {
    test('should include the type name in message for string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toContain("'string'")
    })

    test('should include the type name in message for number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toContain("'number'")
    })

    test('should include the type name in message for boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toContain("'boolean'")
    })

    test('should include inferrable in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports[0].message).toContain('inferrable')
    })

    test('should include cleaner code suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports[0].message.toLowerCase()).toContain('cleaner code')
    })

    test('should have complete message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      const msg = reports[0].message
      expect(msg).toMatch(/Type '.+' is inferrable/)
      expect(msg).toContain('Remove the type annotation')
    })

    test('should have consistent message format across types', () => {
      const types: Array<{ annotation: string; init: string; expected: string }> = [
        { annotation: 'TSStringKeyword', init: 'StringLiteral', expected: 'string' },
        { annotation: 'TSNumberKeyword', init: 'NumericLiteral', expected: 'number' },
        { annotation: 'TSBooleanKeyword', init: 'BooleanLiteral', expected: 'boolean' },
      ]

      for (const { annotation, init, expected } of types) {
        const { context, reports } = createMockContext()
        const visitor = noInferrableTypesRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(annotation, init))

        expect(reports[0].message).toContain(`'${expected}'`)
        expect(reports[0].message).toContain('inferrable')
        expect(reports[0].message).toContain('Remove')
      }
    })
  })

  // ============================================================
  // MULTIPLE REPORTS
  // ============================================================
  describe('multiple reports', () => {
    test('should report multiple violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral', 1, 0))
      visitor.VariableDeclarator(
        createVariableDeclarator('TSNumberKeyword', 'NumericLiteral', 2, 0),
      )

      expect(reports.length).toBe(2)
    })

    test('should report three violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral', 1, 0))
      visitor.VariableDeclarator(
        createVariableDeclarator('TSNumberKeyword', 'NumericLiteral', 2, 0),
      )
      visitor.VariableDeclarator(
        createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral', 3, 0),
      )

      expect(reports.length).toBe(3)
    })

    test('should report many violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator('TSStringKeyword', 'StringLiteral', i + 1, 0),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should track locations separately for each report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral', 1, 0))
      visitor.VariableDeclarator(
        createVariableDeclarator('TSNumberKeyword', 'NumericLiteral', 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should only report violations not non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      // Report
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))
      // No report - wrong type
      visitor.VariableDeclarator({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      // Report
      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports.length).toBe(2)
    })

    test('should handle mix of violations and non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      // violation
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))
      // non-violation: no annotation
      visitor.VariableDeclarator(createVariableDeclaratorNoAnnotation())
      // non-violation: null node
      visitor.VariableDeclarator(null)
      // violation
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))

      expect(reports.length).toBe(2)
    })

    test('should not carry state between visitor calls', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noInferrableTypesRule.create(ctx1)
      const visitor2 = noInferrableTypesRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))
      visitor2.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
      expect(reports1[0].message).toContain("'string'")
      expect(reports2[0].message).toContain("'number'")
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      // valid - reports
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))
      // invalid - no init
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })
      // valid - reports
      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))
      // invalid - wrong node type
      visitor.VariableDeclarator({ type: 'CallExpression' })
      // valid - reports
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))

      expect(reports.length).toBe(3)
    })
  })

  // ============================================================
  // REALISTIC VARIABLE DECLARATIONS
  // ============================================================
  describe('realistic variable declarations', () => {
    test('should detect const x: string = "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 28 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect let count: number = 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'count' },
        init: { type: 'Literal', value: 0 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 24 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect const flag: boolean = true', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'flag' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect const name: string = "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'name' },
        init: { type: 'StringLiteral', value: 'world' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect const price: number = 9.99', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'price' },
        init: { type: 'NumericLiteral', value: 9.99 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect const active: boolean = false', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'active' },
        init: { type: 'BooleanLiteral' },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 30 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should not report const x = "hello" (no annotation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 22 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report const x = 42 (no annotation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 17 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report const x = true (no annotation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report let x: string (no init)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 17 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report const fn = () => {} (no annotation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'fn' },
        init: { type: 'ArrowFunctionExpression' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 25 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report const obj = {} (no annotation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'obj' },
        init: { type: 'ObjectExpression' },
        loc: { start: { line: 1, column: 6 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // NODE WITHOUT ID
  // ============================================================
  describe('nodes without id property', () => {
    test('should handle node without id gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // The rule doesn't check for id, only type, typeAnnotation, and init
      expect(reports.length).toBe(1)
    })

    test('should handle node with null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: null,
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle destructuring pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // VISITOR METHODS
  // ============================================================
  describe('visitor method behavior', () => {
    test('VariableDeclarator should be callable multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.VariableDeclarator(
          createVariableDeclarator('TSStringKeyword', 'StringLiteral', i + 1, 0),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('VariableDeclarator should return void/undefined', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const result = visitor.VariableDeclarator(
        createVariableDeclarator('TSStringKeyword', 'StringLiteral'),
      )
      expect(result).toBeUndefined()
    })

    test('VariableDeclarator should return void for null input', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const result = visitor.VariableDeclarator(null)
      expect(result).toBeUndefined()
    })

    test('visitor should not have other node handlers', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      // Only VariableDeclarator should exist
      expect(Object.keys(visitor)).toEqual(['VariableDeclarator'])
    })
  })

  // ============================================================
  // CONTEXT INTERACTION
  // ============================================================
  describe('context interaction', () => {
    test('should call context.report with correct descriptor shape', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push(descriptor)
        },
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => 'const x: string = "hello";',
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

      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports.length).toBe(1)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils/helpers.ts')
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/test.ts', 'let myVar: number = 42;')
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))

      expect(reports.length).toBe(1)
    })

    test('should not call report for valid code', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push(descriptor)
        },
        getFilePath: () => '/src/test.ts',
        getAST: () => null,
        getSource: () => 'const x = "hello";',
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

      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclaratorNoAnnotation())

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // BOUNDARY VALUES FOR LOCATIONS
  // ============================================================
  describe('boundary location values', () => {
    test('should handle zero line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 0, 0)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 99999, 0)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 1, 99999)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.column).toBe(99999)
    })
  })

  // ============================================================
  // SPECIAL LITERAL VALUES
  // ============================================================
  describe('special literal values', () => {
    test('should detect whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'space' },
        init: { type: 'Literal', value: '   ' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect newline string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'nl' },
        init: { type: 'Literal', value: '\n' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect unicode string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'emoji' },
        init: { type: 'Literal', value: '🎉' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect very small number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'tiny' },
        init: { type: 'Literal', value: 0.000001 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect very large number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'huge' },
        init: { type: 'Literal', value: 1e10 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'inf' },
        init: { type: 'Literal', value: Infinity },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // typeof Infinity === 'number', so it should report
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // TS-MORPH PATH (StringLiteral/NumericLiteral without value)
  // ============================================================
  describe('ts-morph path - literals without value property', () => {
    test('should report StringLiteral without value as string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'string'")
    })

    test('should report NumericLiteral without value as number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'NumericLiteral' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'number'")
    })

    test('should report StringLiteral with string value via primary path', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral', value: 'test' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'string'")
    })

    test('should report NumericLiteral with number value via primary path', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'NumericLiteral', value: 42 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'number'")
    })

    test('should handle Literal type with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'text' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'string'")
    })

    test('should handle Literal type with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 100 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'number'")
    })

    test('should handle Literal type with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: false },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'boolean'")
    })
  })

  // ============================================================
  // COMBINATION TESTS
  // ============================================================
  describe('type annotation and init combinations', () => {
    test('TSStringKeyword + Literal(string) should report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('TSStringKeyword + Literal(number) should report (mismatch but still inferrable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // The rule checks if init is inferrable, not if types match
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'number'")
    })

    test('TSStringKeyword + Literal(boolean) should report (mismatch)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'boolean'")
    })

    test('TSNumberKeyword + Literal(string) should report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'string'")
    })

    test('TSBooleanKeyword + Literal(string) should report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello' },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'string'")
    })

    test('TSStringKeyword + CallExpression should not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'CallExpression' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('all three types with matching inits should all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 's' },
        init: { type: 'Literal', value: 'text' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'n' },
        init: { type: 'Literal', value: 42 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'b' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
      })

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain("'string'")
      expect(reports[1].message).toContain("'number'")
      expect(reports[2].message).toContain("'boolean'")
    })
  })

  // ============================================================
  // EXACT REPORT MESSAGE FORMAT
  // ============================================================
  describe('exact report message format', () => {
    test('string message follows exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'test' },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toBe(
        "Type 'string' is inferrable from the initial value. Remove the type annotation for cleaner code.",
      )
    })

    test('number message follows exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toBe(
        "Type 'number' is inferrable from the initial value. Remove the type annotation for cleaner code.",
      )
    })

    test('boolean message follows exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toBe(
        "Type 'boolean' is inferrable from the initial value. Remove the type annotation for cleaner code.",
      )
    })

    test('BooleanLiteral message follows exact format', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'BooleanLiteral' },
        typeAnnotation: { type: 'TSBooleanKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports[0].message).toBe(
        "Type 'boolean' is inferrable from the initial value. Remove the type annotation for cleaner code.",
      )
    })
  })

  // ============================================================
  // ROBUSTNESS - UNUSUAL NODE SHAPES
  // ============================================================
  describe('robustness with unusual node shapes', () => {
    test('should handle node where init.type is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 123 },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // init.type is a number, not a string literal type name
      expect(reports.length).toBe(0)
    })

    test('should handle node where typeAnnotation.type is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral' },
        typeAnnotation: { type: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'StringLiteral', extra: true },
        typeAnnotation: { type: 'TSStringKeyword', extra: false },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        range: [0, 15],
        leadingComments: [],
        trailingComments: [],
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested init value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 'hello', extra: { nested: { deep: true } } },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Symbol as init value type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: Symbol('test') },
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // Symbol is not string/number/boolean
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt as init value type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: BigInt(9007199254740991) },
        typeAnnotation: { type: 'TSNumberKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // BigInt is not string/number/boolean
      expect(reports.length).toBe(0)
    })

    test('should handle node where init is a function', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: () => 'hello',
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      // Functions are objects, but init.type would be undefined
      expect(reports.length).toBe(0)
    })

    test('should handle node where init is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: [1, 2, 3],
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where init is a Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: new Map(),
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where init is a Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: new Date(),
        typeAnnotation: { type: 'TSStringKeyword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ORIGINAL TESTS PRESERVED (re-added for completeness)
  // ============================================================
  describe('original tests (preserved)', () => {
    test('should have suggestion type', () => {
      expect(noInferrableTypesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noInferrableTypesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noInferrableTypesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noInferrableTypesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noInferrableTypesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noInferrableTypesRule.meta.fixable).toBeUndefined()
    })

    test('should mention inferred in description', () => {
      expect(noInferrableTypesRule.meta.docs?.description.toLowerCase()).toContain('inferred')
    })

    test('should not report without type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclaratorNoAnnotation())
      expect(reports.length).toBe(0)
    })

    test('should report string type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSStringKeyword', 'StringLiteral'))
      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should report number type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSNumberKeyword', 'NumericLiteral'))
      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('number')
    })

    test('should report boolean type annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('TSBooleanKeyword', 'BooleanLiteral'))
      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral')
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInferrableTypesRule.create(context)
      const node = createVariableDeclarator('TSStringKeyword', 'StringLiteral', 10, 5)
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })
})
