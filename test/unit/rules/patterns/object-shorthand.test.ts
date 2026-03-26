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

describe('object-shorthand rule', () => {
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
  })

  describe('create', () => {
    test('should return visitor object with Property method', () => {
      const { context } = createMockContext()
      const visitor = objectShorthandRule.create(context)

      expect(visitor).toHaveProperty('Property')
    })
  })

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
  })

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
  })

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
  })

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
  })

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
  })
})
