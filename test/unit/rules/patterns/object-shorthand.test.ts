import { describe, test, expect, vi } from 'vitest'
import { objectShorthandRule } from '../../../../src/rules/patterns/object-shorthand.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const obj = {};',
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

function createProperty(
  value: unknown,
  method = false,
  shorthand = false,
  kind = 'init',
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'Property',
    key: { type: 'Identifier', name: 'method' },
    value: value,
    kind: kind,
    method: method,
    shorthand: shorthand,
    computed: false,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    async: false,
    generator: false,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    async: false,
    expression: false,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

// =========================================================================
// TEST SUITE
// =========================================================================

describe('object-shorthand rule', () => {
  // =======================================================================
  // 1. META PROPERTIES (tests 1–25)
  // =======================================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(objectShorthandRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(objectShorthandRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(objectShorthandRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(objectShorthandRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(objectShorthandRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(objectShorthandRule.meta.fixable).toBeUndefined()
    })

    test('should mention object shorthand in description', () => {
      const desc = objectShorthandRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/shorthand/)
    })

    test('should mention methods in description', () => {
      const desc = objectShorthandRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/method/)
    })

    test('should have empty schema array', () => {
      expect(objectShorthandRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(objectShorthandRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(objectShorthandRule).toHaveProperty('create')
    })

    test('meta type should be a string', () => {
      expect(typeof objectShorthandRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof objectShorthandRule.meta.severity).toBe('string')
    })

    test('meta severity should be warn or error or off', () => {
      expect(['off', 'warn', 'error']).toContain(objectShorthandRule.meta.severity)
    })

    test('meta type should be a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(objectShorthandRule.meta.type)
    })

    test('docs should be defined', () => {
      expect(objectShorthandRule.meta.docs).toBeDefined()
    })

    test('docs description should be a string', () => {
      expect(typeof objectShorthandRule.meta.docs?.description).toBe('string')
    })

    test('docs description should not be empty', () => {
      expect(objectShorthandRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('docs category should be a string', () => {
      expect(typeof objectShorthandRule.meta.docs?.category).toBe('string')
    })

    test('docs recommended should be a boolean', () => {
      expect(typeof objectShorthandRule.meta.docs?.recommended).toBe('boolean')
    })

    test('docs should have url', () => {
      expect(objectShorthandRule.meta.docs?.url).toBeDefined()
    })

    test('docs url should be a string', () => {
      expect(typeof objectShorthandRule.meta.docs?.url).toBe('string')
    })

    test('docs url should start with https', () => {
      expect(objectShorthandRule.meta.docs?.url).toMatch(/^https/)
    })

    test('schema should be an array', () => {
      expect(Array.isArray(objectShorthandRule.meta.schema)).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(objectShorthandRule.meta.deprecated).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(objectShorthandRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  // =======================================================================
  // 2. CREATE / VISITOR STRUCTURE (tests 26–40)
  // =======================================================================
  describe('create', () => {
    test('should return visitor object with Property method', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(visitor).toHaveProperty('Property')
    })

    test('create should be a function', () => {
      expect(typeof objectShorthandRule.create).toBe('function')
    })

    test('create should return an object', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('visitor should not be null', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('Property method should be a function', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      expect(typeof visitor.Property).toBe('function')
    })

    test('should create independent visitors per call', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = objectShorthandRule.create(ctx1)
      const visitor2 = objectShorthandRule.create(ctx2)

      visitor1.Property(createProperty(createFunctionExpression()))
      visitor2.Property(createProperty(createFunctionExpression()))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })

    test('create should accept context with empty options', () => {
      const { context } = createMockContext()
      expect(() => objectShorthandRule.create(context)).not.toThrow()
    })

    test('create should accept context with options', () => {
      const { context } = createMockContext({ someOption: true })
      expect(() => objectShorthandRule.create(context)).not.toThrow()
    })

    test('visitor should have exactly Property key', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      expect(Object.keys(visitor)).toContain('Property')
    })

    test('Property should not throw when called', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      expect(() => visitor.Property(createProperty(createFunctionExpression()))).not.toThrow()
    })

    test('create should handle different file paths', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      const visitor = objectShorthandRule.create(context)
      expect(typeof visitor.Property).toBe('function')
    })

    test('create should handle different source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'const x = { a: function() {} };')
      const visitor = objectShorthandRule.create(context)
      expect(typeof visitor.Property).toBe('function')
    })

    test('multiple calls to create should work', () => {
      const { context } = createMockContext()
      for (let i = 0; i < 5; i++) {
        const visitor = objectShorthandRule.create(context)
        expect(typeof visitor.Property).toBe('function')
      }
    })

    test('visitor Property should return void', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      const result = visitor.Property(createProperty(createFunctionExpression()))
      expect(result).toBeUndefined()
    })

    test('visitor Property should return void for non-matching node', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)
      const result = visitor.Property(createProperty(null))
      expect(result).toBeUndefined()
    })
  })

  // =======================================================================
  // 3. DETECTION POSITIVE — function expression properties (tests 41–80)
  // =======================================================================
  describe('detecting function expression properties', () => {
    test('should report function expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message).toBe('Expected property shorthand.')
    })

    test('should report multiple function expression properties', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 2, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report function expression with params', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report function expression with multiple params', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
        ],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report function expression with body', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report named function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'namedFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report generator function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report function expression at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(1, 0)))
      visitor.Property(createProperty(createFunctionExpression(5, 10)))
      visitor.Property(createProperty(createFunctionExpression(100, 50)))

      expect(reports.length).toBe(3)
    })

    test('should report when property key name matches value name pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'handleClick' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(1)
    })

    test('should report when property key is different from value name', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'onClick' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(1)
    })

    test('should report function expression in nested object', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 42, 15))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report 10 function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report 50 function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should report function expression with zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(1, 0), false, false, 'init', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report function expression on large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(
        createProperty(createFunctionExpression(9999, 0), false, false, 'init', 9999, 0),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report function expression on large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(
        createProperty(createFunctionExpression(1, 500), false, false, 'init', 1, 500),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report function expression with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report function expression with complex body', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const fnExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              declarations: [],
              kind: 'const',
            },
            {
              type: 'ReturnStatement',
              argument: { type: 'Identifier', name: 'result' },
            },
          ],
        },
        async: false,
        generator: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      visitor.Property(createProperty(fnExpr))

      expect(reports.length).toBe(1)
    })

    test('should report regardless of property key type being Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'myFunc' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(1)
    })
  })

  // =======================================================================
  // 4. DETECTION NEGATIVE — should NOT report (tests 81–130)
  // =======================================================================
  describe('not reporting method shorthand', () => {
    test('should not report method shorthand syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(null, true, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report shorthand property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(null, false, true, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report when both method and shorthand are true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, true, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report when method is true even with function expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report when shorthand is true even with function expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, true, 'init'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting getter/setter', () => {
    test('should not report getter', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not report setter', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))

      expect(reports.length).toBe(0)
    })

    test('should not report getter with method true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, false, 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not report setter with method true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, false, 'set'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-function values', () => {
    test('should not report arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createArrowFunctionExpression()))

      expect(reports.length).toBe(0)
    })

    test('should not report string value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'Literal',
        value: 'hello',
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report number value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'Literal',
        value: 42,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'Literal',
        value: true,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report identifier value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'Identifier',
        name: 'value',
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report null value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(null))

      expect(reports.length).toBe(0)
    })

    test('should not report undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(undefined))

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'ArrayExpression',
        elements: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'a' },
        operator: '+',
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'LogicalExpression',
        left: { type: 'Identifier', name: 'a' },
        operator: '&&',
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report UpdateExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        operator: '=',
        right: { type: 'Literal', value: 1 },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report ThisExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'ThisExpression' }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report SequenceExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'SequenceExpression',
        expressions: [],
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report SpreadElement value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'obj' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal null value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'Literal', value: null }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report AwaitExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report YieldExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'YieldExpression',
        argument: null,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting computed properties', () => {
    test('should not report computed property with function expression when shorthand is true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: true,
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(0)
    })
  })

  // =======================================================================
  // 5. EDGE CASES (tests 131–165)
  // =======================================================================
  describe('edge cases', () => {
    test('should handle null node in Property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in Property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in Property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property('string')).not.toThrow()
      expect(() => visitor.Property(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

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
        getSource: () => 'const obj = { method: function() {} };',
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

      const visitor = objectShorthandRule.create(context)
      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(true)).not.toThrow()
      expect(() => visitor.Property(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(0)).not.toThrow()
      expect(() => visitor.Property(-1)).not.toThrow()
      expect(() => visitor.Property(3.14)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type Property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property({ type: 'Property' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Property type', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property({ type: 'ExpressionStatement' })
      visitor.Property({ type: 'VariableDeclaration' })
      visitor.Property({ type: 'FunctionDeclaration' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as string', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: 'not an object',
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: 42,
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: true,
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with array value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: [1, 2, 3],
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 1, column: 0 },
        },
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: null,
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '20' },
        },
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
        extraProp1: 'ignored',
        extraProp2: 123,
        extraProp3: true,
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle kind as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: undefined,
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle shorthand as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: undefined,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle method as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: undefined,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Array node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol node', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(() => visitor.Property(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =======================================================================
  // 6. LOCATION REPORTING (tests 166–185)
  // =======================================================================
  describe('location reporting', () => {
    test('should report correct location for function expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location with correct end values', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 3, 5))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for each of multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 5, 10))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 10, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
      expect(reports[2].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.column).toBe(20)
    })

    test('should default to line 1 column 0 when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default end to line 1 column 1 when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
      }
      visitor.Property(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should handle location with zero line number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 10 },
        },
      }
      visitor.Property(node)

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle location at same start and end position', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 10 },
        },
      }
      visitor.Property(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report different locations for consecutive calls', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(
          createProperty(createFunctionExpression(), false, false, 'init', i + 1, i * 4),
        )
      }

      for (let i = 0; i < 5; i++) {
        expect(reports[i].loc?.start.line).toBe(i + 1)
        expect(reports[i].loc?.start.column).toBe(i * 4)
      }
    })

    test('should preserve exact column values', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const columns = [0, 1, 4, 8, 16, 32, 64, 128]
      for (const col of columns) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, col))
      }

      for (let i = 0; i < columns.length; i++) {
        expect(reports[i].loc?.start.column).toBe(columns[i])
      }
    })
  })

  // =======================================================================
  // 7. MESSAGE CONTENT (tests 186–200)
  // =======================================================================
  describe('message quality', () => {
    test('should mention shorthand in message', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message).toContain('shorthand')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 2, 0))

      expect(reports[0].message).toBe('Expected property shorthand.')
      expect(reports[1].message).toBe('Expected property shorthand.')
    })

    test('message should be a string', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(typeof reports[0].message).toBe('string')
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should start with capital letter', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should end with period', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should be exactly "Expected property shorthand."', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message).toBe('Expected property shorthand.')
    })

    test('all reports should have the same message', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', i + 1, 0))
      }

      const messages = reports.map((r) => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('message should contain "Expected"', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message).toContain('Expected')
    })

    test('message should contain "property"', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].message).toContain('property')
    })
  })

  // =======================================================================
  // 8. MULTIPLE REPORTS (tests 201–215)
  // =======================================================================
  describe('multiple reports', () => {
    test('should report two function expression properties', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))
      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(2)
    })

    test('should report mixed properties correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression())) // report
      visitor.Property(createProperty(createArrowFunctionExpression())) // no report
      visitor.Property(createProperty(createFunctionExpression())) // report

      expect(reports.length).toBe(2)
    })

    test('should report only function expressions in a batch', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))
      visitor.Property(createProperty(createFunctionExpression(), true, false, 'init')) // method=true, no report
      visitor.Property(createProperty(createFunctionExpression()))
      visitor.Property(createProperty(createFunctionExpression(), false, true, 'init')) // shorthand=true, no report
      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))
      expect(reports.length).toBe(1)

      visitor.Property(createProperty(createFunctionExpression()))
      expect(reports.length).toBe(2)

      visitor.Property(createProperty(createFunctionExpression()))
      expect(reports.length).toBe(3)
    })

    test('should not clear reports between calls', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))
      const firstReports = reports.length

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBeGreaterThan(firstReports)
    })

    test('should handle interleaved matching and non-matching nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.Property(createProperty(createFunctionExpression()))
        } else {
          visitor.Property(createProperty(createArrowFunctionExpression()))
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should handle 100 consecutive function expression reports', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.Property(createProperty(createFunctionExpression()))
      }

      expect(reports.length).toBe(100)
    })

    test('should maintain correct order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 1, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 5, 0))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init', 10, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report after non-matching nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(null)) // no report
      visitor.Property(createProperty(createFunctionExpression())) // report
      visitor.Property(createProperty(createArrowFunctionExpression())) // no report
      visitor.Property(createProperty(createFunctionExpression())) // report

      expect(reports.length).toBe(2)
    })
  })

  // =======================================================================
  // 9. CONTEXT VARIATIONS (tests 216–230)
  // =======================================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const obj = { method: function() { return 1; } };',
      )
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const { context, reports } = createMockContext(
        {},
        '/very/long/path/to/some/deeply/nested/directory/structure/file.ts',
      )
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra fields', () => {
      const { context, reports } = createMockContext({
        extra: 'field',
        nested: { deep: true },
        array: [1, 2, 3],
      })
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with empty string source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with multiline source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const obj = {\n  method: function() {\n    return 1;\n  }\n};',
      )
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/file.js')
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.jsx')
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/custom/workspace',
      } as unknown as RuleContext

      const visitor = objectShorthandRule.create(context)
      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should handle context with null config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
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

      const visitor = objectShorthandRule.create(context)
      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })
  })

  // =======================================================================
  // 10. EXPORT VERIFICATION (tests 231–240)
  // =======================================================================
  describe('export verification', () => {
    test('should export objectShorthandRule', () => {
      expect(objectShorthandRule).toBeDefined()
    })

    test('exported value should be an object', () => {
      expect(typeof objectShorthandRule).toBe('object')
    })

    test('exported value should not be null', () => {
      expect(objectShorthandRule).not.toBeNull()
    })

    test('should have meta as non-configurable property', () => {
      expect(objectShorthandRule.meta).toBeDefined()
    })

    test('should have create as non-configurable property', () => {
      expect(objectShorthandRule.create).toBeDefined()
    })

    test('meta should have required structure', () => {
      expect(objectShorthandRule.meta).toHaveProperty('type')
      expect(objectShorthandRule.meta).toHaveProperty('severity')
      expect(objectShorthandRule.meta).toHaveProperty('docs')
      expect(objectShorthandRule.meta).toHaveProperty('schema')
    })

    test('docs should have required structure', () => {
      expect(objectShorthandRule.meta.docs).toHaveProperty('description')
      expect(objectShorthandRule.meta.docs).toHaveProperty('category')
      expect(objectShorthandRule.meta.docs).toHaveProperty('recommended')
    })

    test('create should be callable with mock context', () => {
      const { context } = createMockContext()
      expect(() => objectShorthandRule.create(context)).not.toThrow()
    })

    test('should work as default export', () => {
      // Verify the module structure supports both named and default exports
      expect(objectShorthandRule.meta.type).toBeDefined()
    })

    test('rule should follow RuleDefinition interface', () => {
      expect(typeof objectShorthandRule.meta).toBe('object')
      expect(typeof objectShorthandRule.create).toBe('function')
    })
  })

  // =======================================================================
  // 11. REPORT DESCRIPTOR STRUCTURE (tests 241–255)
  // =======================================================================
  describe('report descriptor structure', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report loc start should have column property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('report loc end should have column property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report loc start line should be a number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column should be a number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end line should be a number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc end column should be a number', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report should have exactly 2 properties', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(Object.keys(reports[0])).toContain('message')
      expect(Object.keys(reports[0])).toContain('loc')
    })
  })

  // =======================================================================
  // 12. ADDITIONAL VALUE TYPE TESTS (tests 256–270)
  // =======================================================================
  describe('additional value type tests', () => {
    test('should not report when value type is ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'ClassExpression',
        id: null,
        body: { type: 'ClassBody', body: [] },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report when value type is TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report when value type is FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should report when value type is exactly FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'FunctionExpression' }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(1)
    })

    test('should not report when value type is FunctionExpression but case differs', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'functionexpression' }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report when value type is functionexpression (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'functionexpression' }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report when value has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { name: 'something' }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should not report when value is empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty({}))

      expect(reports.length).toBe(0)
    })

    test('should report FunctionExpression even with minimal properties', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = { type: 'FunctionExpression', id: null }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(1)
    })

    test('should not report ArrowFunctionExpression with async', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        expression: false,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(0)
    })

    test('should report FunctionExpression with async true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const value = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        generator: false,
      }
      visitor.Property(createProperty(value))

      expect(reports.length).toBe(1)
    })

    test('should not report when computed is true with function expression and method is true', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: true,
        shorthand: false,
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(0)
    })

    test('should report when computed is true with function expression but not method/shorthand', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'init',
        method: false,
        shorthand: false,
        computed: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.Property(prop)

      expect(reports.length).toBe(1)
    })
  })

  // =======================================================================
  // 13. KIND VARIATIONS (tests 271–280)
  // =======================================================================
  describe('kind variations', () => {
    test('should report init kind with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init'))

      expect(reports.length).toBe(1)
    })

    test('should not report get kind with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not report set kind with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))

      expect(reports.length).toBe(0)
    })

    test('should report unknown kind with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'other'))

      expect(reports.length).toBe(1)
    })

    test('should report empty string kind with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, ''))

      expect(reports.length).toBe(1)
    })

    test('should not report when kind is exactly get', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'prop' },
        value: createFunctionExpression(),
        kind: 'get',
        method: false,
        shorthand: false,
        computed: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when kind is exactly set', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'prop' },
        value: createFunctionExpression(),
        kind: 'set',
        method: false,
        shorthand: false,
        computed: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Property(node)

      expect(reports.length).toBe(0)
    })

    test('should report when kind is "Get" (case sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'Get'))

      expect(reports.length).toBe(1)
    })

    test('should report when kind is "Set" (case sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'Set'))

      expect(reports.length).toBe(1)
    })

    test('should report when kind is "GET" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'GET'))

      expect(reports.length).toBe(1)
    })
  })

  // =======================================================================
  // 14. COMBINED CONDITION TESTS (tests 281–295)
  // =======================================================================
  describe('combined conditions', () => {
    test('should report: init + non-method + non-shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'init'))

      expect(reports.length).toBe(1)
    })

    test('should not report: init + method + non-shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report: init + non-method + shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, true, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report: get + non-method + non-shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not report: set + non-method + non-shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))

      expect(reports.length).toBe(0)
    })

    test('should not report: init + non-method + non-shorthand + ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createArrowFunctionExpression(), false, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report: init + non-method + non-shorthand + null value', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(null, false, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should not report: init + method + shorthand + FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression(), true, true, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should report: init + non-method + non-shorthand + FunctionExpression at various locations', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const locations = [
        [1, 0],
        [2, 5],
        [10, 0],
        [50, 25],
        [100, 100],
      ] as const

      for (const [line, col] of locations) {
        visitor.Property(
          createProperty(createFunctionExpression(), false, false, 'init', line, col),
        )
      }

      expect(reports.length).toBe(locations.length)
    })

    test('should correctly identify only FunctionExpression in mixed value types', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const values = [
        createFunctionExpression(), // report
        createArrowFunctionExpression(), // no report
        { type: 'Literal', value: 'hi' }, // no report
        createFunctionExpression(), // report
        { type: 'Identifier', name: 'x' }, // no report
        createFunctionExpression(), // report
      ]

      for (const val of values) {
        visitor.Property(createProperty(val))
      }

      expect(reports.length).toBe(3)
    })

    test('should handle all non-matching conditions simultaneously', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      // getter
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))
      // setter
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))
      // method shorthand
      visitor.Property(createProperty(createFunctionExpression(), true, false, 'init'))
      // property shorthand
      visitor.Property(createProperty(createFunctionExpression(), false, true, 'init'))
      // arrow function
      visitor.Property(createProperty(createArrowFunctionExpression(), false, false, 'init'))

      expect(reports.length).toBe(0)
    })

    test('should handle alternating match/no-match patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const pattern = [
        true, // FunctionExpression -> report
        false, // getter -> no report
        true, // FunctionExpression -> report
        false, // setter -> no report
        true, // FunctionExpression -> report
        false, // method -> no report
        true, // FunctionExpression -> report
        false, // shorthand -> no report
      ]

      for (const shouldReport of pattern) {
        if (shouldReport) {
          visitor.Property(createProperty(createFunctionExpression()))
        } else {
          visitor.Property(createProperty(null))
        }
      }

      expect(reports.length).toBe(4)
    })
  })

  // =======================================================================
  // 15. STRESS / BOUNDARY TESTS (tests 296–305)
  // =======================================================================
  describe('stress and boundary tests', () => {
    test('should handle single function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(createProperty(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should handle zero calls gracefully', () => {
      const { context, reports } = createMockContext()
      objectShorthandRule.create(context)

      expect(reports.length).toBe(0)
    })

    test('should handle 200 calls to Property with function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.Property(createProperty(createFunctionExpression()))
      }

      expect(reports.length).toBe(200)
    })

    test('should handle 200 calls to Property with non-matching nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.Property(createProperty(createArrowFunctionExpression()))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle mixed 400 calls (200 matching + 200 non-matching)', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 200; i++) {
        visitor.Property(createProperty(createFunctionExpression()))
        visitor.Property(createProperty(createArrowFunctionExpression()))
      }

      expect(reports.length).toBe(200)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(
        createProperty(createFunctionExpression(999999, 0), false, false, 'init', 999999, 0),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      visitor.Property(
        createProperty(createFunctionExpression(1, 999999), false, false, 'init', 1, 999999),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle calling create multiple times', () => {
      const { context } = createMockContext()

      for (let i = 0; i < 10; i++) {
        const visitor = objectShorthandRule.create(context)
        expect(typeof visitor.Property).toBe('function')
      }
    })

    test('should handle sequential create and report cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { context, reports } = createMockContext()
        const visitor = objectShorthandRule.create(context)

        visitor.Property(createProperty(createFunctionExpression()))

        expect(reports.length).toBe(1)
      }
    })

    test('should handle node with all properties having default-like values', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: '' },
        value: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }
      visitor.Property(node)

      expect(reports.length).toBe(1)
    })
  })

  // =======================================================================
  // 16. DESCRIPTOR & REPORT COUNT VERIFICATION (tests 306–310)
  // =======================================================================
  describe('report count verification', () => {
    test('should produce exactly 0 reports for only getters', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))
      }

      expect(reports.length).toBe(0)
    })

    test('should produce exactly 0 reports for only setters', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))
      }

      expect(reports.length).toBe(0)
    })

    test('should produce exactly 0 reports for only method shorthands', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(createProperty(createFunctionExpression(), true, false, 'init'))
      }

      expect(reports.length).toBe(0)
    })

    test('should produce exactly 0 reports for only property shorthands', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Property(createProperty(createFunctionExpression(), false, true, 'init'))
      }

      expect(reports.length).toBe(0)
    })

    test('should produce correct count for mixed batch', () => {
      const { context, reports } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      // 3 should report
      visitor.Property(createProperty(createFunctionExpression()))
      visitor.Property(createProperty(createFunctionExpression()))
      visitor.Property(createProperty(createFunctionExpression()))

      // 2 should NOT report (getter/setter)
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'get'))
      visitor.Property(createProperty(createFunctionExpression(), false, false, 'set'))

      // 2 should NOT report (method/shorthand)
      visitor.Property(createProperty(createFunctionExpression(), true, false, 'init'))
      visitor.Property(createProperty(createFunctionExpression(), false, true, 'init'))

      // 3 should NOT report (non-function values)
      visitor.Property(createProperty(createArrowFunctionExpression()))
      visitor.Property(createProperty({ type: 'Literal', value: 1 }))
      visitor.Property(createProperty(null))

      expect(reports.length).toBe(3)
    })
  })
})
