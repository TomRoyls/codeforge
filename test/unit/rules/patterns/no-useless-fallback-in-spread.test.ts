import { describe, test, expect, vi } from 'vitest'
import { noUselessFallbackInSpreadRule } from '../../../../src/rules/patterns/no-useless-fallback-in-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = { ...obj || {} };',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createIdentifier(name: string, start = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + name.length },
    },
    range: [start, start + name.length],
  }
}

function createEmptyObjectLiteral(start = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 2 },
    },
    range: [start, start + 2],
  }
}

function createEmptyArrayLiteral(start = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 2 },
    },
    range: [start, start + 2],
  }
}

function createLogicalOrExpression(left: unknown, right: unknown, start = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '||',
    left,
    right,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 10 },
    },
    range: [start, start + 10],
  }
}

function createLiteral(value: unknown, start = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 1 },
    },
    range: [start, start + 1],
  }
}

function createLogicalAndExpression(left: unknown, right: unknown, start = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left,
    right,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 10 },
    },
    range: [start, start + 10],
  }
}

function createSpreadElement(argument: unknown, start = 0, line = 1): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column: start },
      end: { line, column: start + 15 },
    },
    range: [start, start + 15],
  }
}

function createNonEmptyObjectLiteral(start = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: createIdentifier('a', start + 2),
        value: createLiteral(1, start + 6),
      },
    ],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 8 },
    },
    range: [start, start + 8],
  }
}

function createNonEmptyArrayLiteral(start = 0): unknown {
  return {
    type: 'ArrayExpression',
    elements: [createLiteral(1, start + 1)],
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 3 },
    },
    range: [start, start + 3],
  }
}

describe('no-useless-fallback-in-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUselessFallbackInSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUselessFallbackInSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUselessFallbackInSpreadRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUselessFallbackInSpreadRule.meta.fixable).toBe('code')
    })

    test('should mention spread in description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention fallback in description', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.description.toLowerCase()).toContain(
        'fallback',
      )
    })

    test('should have documentation URL', () => {
      expect(noUselessFallbackInSpreadRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-fallback-in-spread',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with SpreadElement method', () => {
      const { context } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      expect(visitor).toHaveProperty('SpreadElement')
      expect(typeof visitor.SpreadElement).toBe('function')
    })
  })

  describe('detecting useless fallback in object spread', () => {
    test('should report ...obj || {} in object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless fallback')
      expect(reports[0].message).toContain('spread')
    })

    test('should report ...data || {} in object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('data', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...config || {} in object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('config', 0)
      const rightOperand = createEmptyObjectLiteral(10)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should provide fix to remove || {}', () => {
      const source = 'const x = { ...obj || {} };'
      // Position 15: 'o' (start of obj), Position 22: '{' (start of {}), Spread at 12
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 15)
      const rightOperand = createEmptyObjectLiteral(22)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('obj')
    })
  })

  describe('detecting useless fallback in array spread', () => {
    test('should report ...arr || [] in array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 0)
      const rightOperand = createEmptyArrayLiteral(7)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless fallback')
    })

    test('should report ...items || [] in array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('items', 0)
      const rightOperand = createEmptyArrayLiteral(9)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should report ...list || [] in array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('list', 0)
      const rightOperand = createEmptyArrayLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
    })

    test('should provide fix to remove || []', () => {
      const source = 'const x = [...arr || []];'
      // Position 14: 'a' (start of arr), Position 21: '[' (start of []), Spread at 11
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 14)
      const rightOperand = createEmptyArrayLiteral(21)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('arr')
    })
  })

  describe('valid patterns that should not report', () => {
    test('should not report spread without fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const spreadElement = createSpreadElement(leftOperand, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with non-empty object fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createNonEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with non-empty array fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 0)
      const rightOperand = createNonEmptyArrayLiteral(7)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with && operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalAndExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with null fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createLiteral(null, 8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with undefined fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createLiteral(undefined, 8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with number fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createLiteral(0, 8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread with string fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createLiteral('', 8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should not report spread not in object or array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = { type: 'CallExpression' }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      visitor.SpreadElement(null)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      visitor.SpreadElement(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      expect(() => visitor.SpreadElement('string')).not.toThrow()
      expect(() => visitor.SpreadElement(123)).not.toThrow()
      expect(() => visitor.SpreadElement(true)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle spread element without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const spreadElement = {
        type: 'SpreadElement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle spread element without parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)

      visitor.SpreadElement(spreadElement)

      expect(reports.length).toBe(0)
    })

    test('should handle logical expression without right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
      }
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle logical expression without left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        right: rightOperand,
      }
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(0)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const spreadElement = {
        type: 'SpreadElement',
        argument: logicalExpr,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0, 42)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention useless fallback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('useless fallback')
    })

    test('should mention spread pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })

    test('should mention safe for object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].message.toLowerCase()).toContain('safe')
    })

    test('should show ...obj || {} can be simplified', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].message).toContain('...obj || {}')
      expect(reports[0].message).toContain('...obj')
    })

    test('should show ...arr || [] can be simplified', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 0)
      const rightOperand = createEmptyArrayLiteral(7)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 0)
      const spreadElement = createSpreadElement(logicalExpr, 0)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].message).toContain('...arr || []')
      expect(reports[0].message).toContain('...arr')
    })
  })

  describe('fix functionality', () => {
    test('should provide fix for ...obj || {}', () => {
      const source = 'const x = { ...obj || {} };'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 15)
      const rightOperand = createEmptyObjectLiteral(22)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('obj')
    })

    test('should provide fix for ...data || {}', () => {
      const source = 'const x = { ...data || {} };'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('data', 15)
      const rightOperand = createEmptyObjectLiteral(24)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 15)
      const spreadElement = createSpreadElement(logicalExpr, 12)
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('data')
    })

    test('should provide fix for ...arr || []', () => {
      const source = 'const x = [...arr || []];'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('arr', 14)
      const rightOperand = createEmptyArrayLiteral(21)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('arr')
    })

    test('should provide fix for ...items || []', () => {
      const source = 'const x = [...items || []];'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('items', 14)
      const rightOperand = createEmptyArrayLiteral(23)
      const logicalExpr = createLogicalOrExpression(leftOperand, rightOperand, 14)
      const spreadElement = createSpreadElement(logicalExpr, 11)
      const parent = {
        type: 'ArrayExpression',
        elements: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('items')
    })

    test('should not provide fix when range is not available', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessFallbackInSpreadRule.create(context)

      const leftOperand = createIdentifier('obj', 0)
      const rightOperand = createEmptyObjectLiteral(8)
      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: leftOperand,
        right: rightOperand,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const spreadElement = {
        type: 'SpreadElement',
        argument: logicalExpr,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      const parent = {
        type: 'ObjectExpression',
        properties: [],
      }

      ;(visitor.SpreadElement as (node: unknown, parent?: unknown) => void)(spreadElement, parent)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
