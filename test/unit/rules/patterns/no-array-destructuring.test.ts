import { describe, test, expect, vi } from 'vitest'
import { noArrayDestructuringRule } from '../../../../src/rules/patterns/no-array-destructuring.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const arr = [...items];',
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

function createArrayExpression(elements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createSpreadElement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

describe('no-array-destructuring rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noArrayDestructuringRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noArrayDestructuringRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noArrayDestructuringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have performance category', () => {
      expect(noArrayDestructuringRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(noArrayDestructuringRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noArrayDestructuringRule.meta.fixable).toBeUndefined()
    })

    test('should mention spread operator in description', () => {
      expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention performance in description', () => {
      expect(noArrayDestructuringRule.meta.docs?.description.toLowerCase()).toContain('performance')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      expect(visitor).toHaveProperty('ArrayExpression')
    })
  })

  describe('detecting spread operator in array literals', () => {
    test('should report spread operator on array', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 1, 5)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
      expect(reports[0].message).toContain('concat')
      expect(reports[0].message).toContain('slice')
    })

    test('should report spread operator on array with different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('myArray'), 2, 10)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myArray')
    })

    test('should report spread operator with other elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createLiteral(1),
        createSpreadElement(createIdentifier('items'), 3, 2),
        createLiteral(2),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple spread operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createSpreadElement(createIdentifier('items1'), 1, 0),
        createSpreadElement(createIdentifier('items2'), 1, 10),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('nested destructuring', () => {
    test('should report nested array with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const innerArray = createArrayExpression([
        createSpreadElement(createIdentifier('innerItems'), 2, 5),
      ])
      const node = createArrayExpression([
        createSpreadElement(createIdentifier('outerItems'), 1, 0),
        innerArray,
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('outerItems')
    })

    test('should not report spread inside nested array (rule does not recursively visit)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const innerArray = createArrayExpression([
        createSpreadElement(createIdentifier('innerItems'), 2, 10),
      ])
      const node = createArrayExpression([createLiteral(1), innerArray, createLiteral(2)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases (no destructuring)', () => {
    test('should not report array without spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createLiteral(1), createLiteral(2), createLiteral(3)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report array with only literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createLiteral('a'),
        createLiteral('b'),
        createLiteral('c'),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report array with only identifiers (non-spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      expect(() => visitor.ArrayExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      expect(() => visitor.ArrayExpression('string')).not.toThrow()
      expect(() => visitor.ArrayExpression(123)).not.toThrow()
    })

    test('should handle node without elements property', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = {
        type: 'ArrayExpression',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle elements as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: undefined,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle spread element with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(null)])

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle spread element with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const spreadElement = {
        type: 'SpreadElement',
        argument: undefined,
      }
      const node = createArrayExpression([spreadElement])

      expect(() => visitor.ArrayExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle spread element with non-identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createSpreadElement(createMemberExpression(createIdentifier('obj'), 'arr')),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 10, 5)])

      visitor.ArrayExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const spreadArg = createMemberExpression(createIdentifier('obj'), 'items')
      const node = createArrayExpression([createSpreadElement(spreadArg)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should handle spread element on line 10, column 15', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'), 10, 15)])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('message quality', () => {
    test('should include array name in message when argument is identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('myArray'))])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('myArray')
    })

    test('should use fallback name when argument is not identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const spreadArg = createMemberExpression(createIdentifier('obj'), 'items')
      const node = createArrayExpression([createSpreadElement(spreadArg)])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('array')
    })

    test('should mention concat in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('concat')
    })

    test('should mention slice in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('slice')
    })

    test('should mention performance in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('performance')
    })

    test('should mention large arrays in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])

      visitor.ArrayExpression(node)

      expect(reports[0].message).toContain('large')
    })
  })

  describe('element type checking', () => {
    test('should not report non-spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createLiteral(1),
        createIdentifier('x'),
        createLiteral('test'),
        createMemberExpression(createIdentifier('obj'), 'prop'),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should only report spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createLiteral(1),
        createSpreadElement(createIdentifier('items1')),
        createLiteral(2),
        createIdentifier('x'),
        createSpreadElement(createIdentifier('items2')),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('items1')
      expect(reports[1].message).toContain('items2')
    })

    test('should handle elements array with null values', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        null,
        createSpreadElement(createIdentifier('items')),
        null,
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle elements array with undefined values', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        undefined,
        createSpreadElement(createIdentifier('items')),
        undefined,
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('type guard functions', () => {
    test('should handle various node types in ArrayExpression check', () => {
      const { context } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      expect(() => visitor.ArrayExpression(null)).not.toThrow()
      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
      expect(() => visitor.ArrayExpression('not an object')).not.toThrow()
      expect(() => visitor.ArrayExpression(123)).not.toThrow()
      expect(() => visitor.ArrayExpression({ type: 'NotArrayExpression' })).not.toThrow()
    })
  })

  describe('empty options', () => {
    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('items'))])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('integration-like scenarios', () => {
    test('should report common pattern: [...array]', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([createSpreadElement(createIdentifier('array'))])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report common pattern: [1, 2, ...array]', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createLiteral(1),
        createLiteral(2),
        createSpreadElement(createIdentifier('array')),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report common pattern: [...array, 3, 4]', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayDestructuringRule.create(context)

      const node = createArrayExpression([
        createSpreadElement(createIdentifier('array')),
        createLiteral(3),
        createLiteral(4),
      ])

      visitor.ArrayExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
