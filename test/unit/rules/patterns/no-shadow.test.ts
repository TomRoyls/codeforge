import { describe, test, expect, vi } from 'vitest'
import { noShadowRule } from '../../../../src/rules/patterns/no-shadow.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name,
    },
    init: null,
    loc: {
      start: { line, column },
      end: { line, column: name.length + 5 },
    },
  }
}

function createRegularIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'value',
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Identifier',
      name: 'prop',
    },
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

describe('no-shadow rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noShadowRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noShadowRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noShadowRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noShadowRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noShadowRule.meta.schema).toBeDefined()
    })

    test('should not be auto-fixable (renaming shadowed vars is unsafe)', () => {
      expect(noShadowRule.meta.fixable).toBeUndefined()
    })

    test('should mention shadow in description', () => {
      expect(noShadowRule.meta.docs?.description.toLowerCase()).toContain('shadow')
    })

    test('should have empty schema array', () => {
      expect(noShadowRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noShadowRule).toHaveProperty('meta')
    })

    test('should have create method', () => {
      expect(noShadowRule).toHaveProperty('create')
      expect(typeof noShadowRule.create).toBe('function')
    })

    test('should have docs property with url', () => {
      expect(noShadowRule.meta.docs?.url).toBeDefined()
      expect(typeof noShadowRule.meta.docs?.url).toBe('string')
    })

    test('should have docs property with description', () => {
      expect(noShadowRule.meta.docs?.description).toBeDefined()
      expect(typeof noShadowRule.meta.docs?.description).toBe('string')
    })

    test('should mention variable in description', () => {
      expect(noShadowRule.meta.docs?.description.toLowerCase()).toContain('variable')
    })

    test('should mention confusion or bugs in description', () => {
      const desc = noShadowRule.meta.docs?.description.toLowerCase()
      const mentionsRationale = desc?.includes('confusion') || desc?.includes('bug')
      expect(mentionsRationale).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with VariableDeclarator as function', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor1 = noShadowRule.create(context)
      const visitor2 = noShadowRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only VariableDeclarator method', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toEqual(['VariableDeclarator'])
    })
  })

  describe('detecting variable shadowing', () => {
    test('should report shadowed variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message).toContain('already declared')
    })

    test('should report with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myVar', 2, 0))

      expect(reports[0].message).toBe("Variable 'myVar' is already declared in an outer scope.")
    })

    test('should report shadowing on second declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should report shadowing with same name different lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('count', 5, 4))
      visitor.VariableDeclarator(createVariableDeclarator('count', 15, 8))

      expect(reports.length).toBe(1)
    })

    test('should report shadowing with same name same line different column', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('idx', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('idx', 3, 20))

      expect(reports.length).toBe(1)
    })

    test('should report single-letter variable shadowing', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('i', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('i', 2, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'i'")
    })

    test('should report long variable name shadowing', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const longName = 'veryLongVariableNameThatGoesOnAndOn'
      visitor.VariableDeclarator(createVariableDeclarator(longName, 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator(longName, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })
  })

  describe('allowing new variables', () => {
    test('should not report unique variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('z', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report non-VariableDeclarator nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createRegularIdentifier())
      visitor.VariableDeclarator(createMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report first declaration of a variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('first', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report many unique variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const names = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta']
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, 0))
      })

      expect(reports.length).toBe(0)
    })

    test('should not report single variable declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('solo', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report variables differing only by case', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MYVAR', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MyVar', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myvar', 4, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('testVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('testVar', 2, 0))

      expect(reports[0].message).toContain('testVar')
    })

    test('should mention outer scope in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports[0].message).toContain('outer scope')
    })

    test('should use single quotes around variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myVar', 2, 0))

      expect(reports[0].message).toContain("'myVar'")
    })

    test('should use proper message format for any variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('result', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('result', 2, 0))

      expect(reports[0].message).toBe("Variable 'result' is already declared in an outer scope.")
    })

    test('should include period at end of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should use word Variable at start of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports[0].message.startsWith('Variable')).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-VariableDeclarator type', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

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
        getSource: () => 'let x = 1;',
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

      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle variable with non-string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 123,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle missing name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(() => visitor.VariableDeclarator(false)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
      expect(() => visitor.VariableDeclarator(-1)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator('')).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(Symbol('test'))).not.toThrow()
    })

    test('should handle BigInt as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(BigInt(9007199254740991))).not.toThrow()
    })
  })

  describe('multiple shadowed variables', () => {
    test('should report multiple shadowed variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('z', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should report shadowing but not unique variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should report triple shadowing of same variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should report quadruple shadowing of same variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('v', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('v', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('v', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('v', 4, 0))

      expect(reports.length).toBe(3)
    })

    test('should report each shadowing independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 0))

      expect(reports.length).toBe(4)
    })

    test('should report multiple different variables shadowed', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correct message for each shadowed variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('foo', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('bar', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('foo', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('bar', 4, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'foo'")
      expect(reports[1].message).toContain("'bar'")
    })

    test('should handle interleaved unique and shadowed variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('d', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 6, 0))
      visitor.VariableDeclarator(createVariableDeclarator('e', 7, 0))

      expect(reports.length).toBe(2)
    })

    test('should count shadows correctly with many declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const names = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10']
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, 0))
      })

      visitor.VariableDeclarator(createVariableDeclarator('n1', 11, 0))
      visitor.VariableDeclarator(createVariableDeclarator('n5', 12, 0))
      visitor.VariableDeclarator(createVariableDeclarator('n10', 13, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('additional scenarios', () => {
    test('should handle multiple declarations of same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = createVariableDeclarator('x')

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(2)
    })

    test('should handle variables with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_private', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('$global', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('_private', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should handle case sensitivity', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myvar', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MYVAR', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MyVar', 4, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle dollar sign variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('$', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'$'")
    })

    test('should handle underscore variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('_', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'_'")
    })

    test('should handle double underscore variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('__dirname', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('__dirname', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle dollar-prefix variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$scope', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('$scope', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle underscore-prefix variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_temp', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('_temp', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle numbers-only variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x1', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x1', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle camelCase variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVariableName', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myVariableName', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle SCREAMING_SNAKE_CASE variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('MAX_LENGTH', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MAX_LENGTH', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle snake_case variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('my_var_name', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('my_var_name', 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {},
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 99999, column: 99999 },
          end: { line: 99999, column: 100010 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle loc with negative line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: -1, column: -1 },
          end: { line: -1, column: 5 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with null values', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: null as unknown as number, column: null as unknown as number },
          end: { line: null as unknown as number, column: null as unknown as number },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where start.line is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { column: 5 },
          end: { line: 2, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where start is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: null,
          end: { line: 2, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where loc itself is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: null,
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where loc is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: 'invalid',
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc where loc is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: 42,
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor isolation', () => {
    test('each visitor should track names independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'let x = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'let x = 1;' })

      const visitor1 = noShadowRule.create(ctx1)
      const visitor2 = noShadowRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      visitor2.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor2.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('second visitor should not see first visitor declarations', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'let x = 1;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'let x = 1;' })

      const visitor1 = noShadowRule.create(ctx1)
      const visitor2 = noShadowRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('shared', 1, 0))

      visitor2.VariableDeclarator(createVariableDeclarator('shared', 1, 0))

      expect(reports2.length).toBe(0)
    })

    test('visitors with different contexts should work independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'let x = 1;', filePath: '/src/a.ts' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'let x = 1;', filePath: '/src/b.ts' })

      const v1 = noShadowRule.create(ctx1)
      const v2 = noShadowRule.create(ctx2)

      v1.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      v1.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      v2.VariableDeclarator(createVariableDeclarator('y', 1, 0))
      v2.VariableDeclarator(createVariableDeclarator('y', 2, 0))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should not carry state between create calls', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })

      const visitor1 = noShadowRule.create(context)
      visitor1.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor1.VariableDeclarator(createVariableDeclarator('a', 2, 0))

      const { reports: reports2 } = createMockRuleContext({ source: 'let x = 1;' })
      const context2: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports2.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor2 = noShadowRule.create(context2)
      visitor2.VariableDeclarator(createVariableDeclarator('a', 1, 0))

      expect(reports2.length).toBe(0)
    })
  })

  describe('location in reports', () => {
    test('should report location of shadowing declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 3))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should not report location of first declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 100, 50))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.line).not.toBe(100)
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 7))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for multiple shadows', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 4))
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(8)
    })

    test('should preserve end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 7))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const nodeNoLoc = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
      }

      visitor.VariableDeclarator(nodeNoLoc)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('node type variations', () => {
    test('should not report for ObjectPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ArrayPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ArrayPattern',
          elements: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for AssignmentPattern id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for RestElement id', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'RestElement',
          argument: { type: 'Identifier', name: 'args' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with FunctionDeclaration type', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with ClassDeclaration type', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where id is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: 'not-an-object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where id is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where id is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;', filePath: '/some/deep/path/file.ts' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1; const x = 2;', filePath: '/src/file.ts' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        extraProp: 'value',
        anotherProp: 42,
      }], source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('unicode and special names', () => {
    test('should handle unicode variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('日本語', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('日本語', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle emoji-like variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('π', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('π', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle accented characters in names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('café', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('café', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle names with digits', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('var1', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('var2', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('var1', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle single character variable names uniquely', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('d', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('e', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should shadow single character variables', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 3, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('stress testing', () => {
    test('should handle many unique declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`var${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle many shadowed declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('x', i + 1, 0))
      }

      expect(reports.length).toBe(49)
    })

    test('should handle alternating pattern of unique and shadowed', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 6, 0))

      expect(reports.length).toBe(4)
    })

    test('should handle rapid unique then shadow pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const names = ['a', 'b', 'c', 'd', 'e']
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, 0))
      })
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 6, 0))
      })

      expect(reports.length).toBe(5)
    })

    test('should handle 100 unique variable names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`unique_${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid nodes in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(null)
      visitor.VariableDeclarator(undefined)
      visitor.VariableDeclarator(createRegularIdentifier())
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should maintain correct count after null nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(null)
      visitor.VariableDeclarator(undefined)
      visitor.VariableDeclarator(createVariableDeclarator('b', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 6, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('report descriptor completeness', () => {
    test('should always include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('test', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('test', 2, 0))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should always include loc in report when node has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('test', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('test', 2, 4))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should produce consistent message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const names = ['a', 'b', 'c']
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, 0))
      })
      names.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 4, 0))
      })

      reports.forEach((report) => {
        expect(report.message).toMatch(/^Variable '.+' is already declared in an outer scope\.$/)
      })
    })
  })

  describe('Identifier node handling', () => {
    test('should handle raw Identifier node directly', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const idNode = {
        type: 'Identifier',
        name: 'x',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }

      visitor.VariableDeclarator(idNode)
      visitor.VariableDeclarator(idNode)

      expect(reports.length).toBe(1)
    })

    test('should distinguish between Identifier and VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const identifierNode = {
        type: 'Identifier',
        name: 'x',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }

      visitor.VariableDeclarator(identifierNode)
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('mixed node sequences', () => {
    test('should handle MemberExpression before VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createMemberExpression())
      visitor.VariableDeclarator(createVariableDeclarator('value', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression after VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should handle mix of valid and invalid node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator({ type: 'ExpressionStatement' })
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should track names through invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator({ type: 'SomeOtherType' })
      visitor.VariableDeclarator(createVariableDeclarator('y', 3, 0))
      visitor.VariableDeclarator({ type: 'YetAnotherType' })
      visitor.VariableDeclarator(createVariableDeclarator('x', 5, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('destructured-like patterns', () => {
    test('should handle node with destructured object pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node1 = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node1)

      expect(reports.length).toBe(0)
    })

    test('should handle node with destructured array pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node1 = {
        type: 'VariableDeclarator',
        id: {
          type: 'ArrayPattern',
          elements: [{ type: 'Identifier', name: 'a' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node1)

      expect(reports.length).toBe(0)
    })
  })

  describe('realistic variable names', () => {
    test('should shadow common loop variable i', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('i', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('j', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('i', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'i'")
    })

    test('should shadow common names like err, result, data', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('err', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('result', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('data', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('err', 4, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report for common unique names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const commonNames = ['err', 'req', 'res', 'next', 'config', 'options', 'callback']
      commonNames.forEach((name, i) => {
        visitor.VariableDeclarator(createVariableDeclarator(name, i + 1, 0))
      })

      expect(reports.length).toBe(0)
    })

    test('should shadow callback and cb', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('callback', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('cb', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('callback', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('cb', 4, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle this-like patterns with self', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('self', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('self', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle common TypeScript names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('props', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('state', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('dispatch', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('props', 4, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('name tracking accuracy', () => {
    test('should track names added after shadowing', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 4, 0))

      expect(reports.length).toBe(2)
    })

    test('should not shadow name that was never declared', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should add shadowed name to set after reporting', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should correctly count shadows in complex sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('d', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 6, 0))
      visitor.VariableDeclarator(createVariableDeclarator('e', 7, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 8, 0))
      visitor.VariableDeclarator(createVariableDeclarator('f', 9, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 10, 0))

      expect(reports.length).toBe(4)
    })
  })

  describe('VariableDeclarator with init property', () => {
    test('should handle node with init property', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node1 = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      const node2 = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 99 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
    })

    test('should handle node with complex init expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'fn' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('frozen/sealed objects', () => {
    test('should handle frozen node object', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = Object.freeze({
        type: 'VariableDeclarator',
        id: Object.freeze({ type: 'Identifier', name: 'x' }),
        loc: Object.freeze({
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        }),
      })

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle sealed node object', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = Object.seal({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      })

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('prototype-polluted objects', () => {
    test('should handle node with inherited properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const base = { type: 'VariableDeclarator' }
      const node = Object.create(base)
      node.id = { type: 'Identifier', name: 'x' }
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } }

      visitor.VariableDeclarator(node)

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional meta tests', () => {
    test('should have string type value', () => {
      expect(typeof noShadowRule.meta.type).toBe('string')
    })

    test('should have string severity value', () => {
      expect(typeof noShadowRule.meta.severity).toBe('string')
    })

    test('should have boolean recommended value', () => {
      expect(typeof noShadowRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have string category value', () => {
      expect(typeof noShadowRule.meta.docs?.category).toBe('string')
    })

    test('should have array schema value', () => {
      expect(Array.isArray(noShadowRule.meta.schema)).toBe(true)
    })

    test('should have schema with length zero', () => {
      expect(noShadowRule.meta.schema).toHaveLength(0)
    })

    test('should export the rule as default', () => {
      const mod = noShadowRule
      expect(mod).toBeDefined()
      expect(mod.meta).toBeDefined()
      expect(mod.create).toBeDefined()
    })
  })

  describe('additional detection tests', () => {
    test('should detect shadow after many unique names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`unique${i}`, i + 1, 0))
      }
      visitor.VariableDeclarator(createVariableDeclarator('unique0', 21, 0))

      expect(reports.length).toBe(1)
    })

    test('should not detect shadow when only first of many is repeated', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect shadow in reverse order declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('z', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('z', 4, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'z'")
    })

    test('should report for variable name with trailing digits', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('temp1', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('temp2', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('temp1', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should report each subsequent re-declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.VariableDeclarator(createVariableDeclarator('dup', i + 1, 0))
      }

      expect(reports.length).toBe(9)
    })

    test('should handle single name declared twice on adjacent lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('val', 7, 0))
      visitor.VariableDeclarator(createVariableDeclarator('val', 8, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle same variable at lines far apart', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('far', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('far', 500, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle all same-length names that differ', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('abc', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('def', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('ghi', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should shadow a two-char variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('fn', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('fn', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'fn'")
    })
  })

  describe('additional loc tests', () => {
    test('should use default line 1 when both nodes lack loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node1 = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
      }
      const node2 = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
      }

      visitor.VariableDeclarator(node1)
      visitor.VariableDeclarator(node2)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should reflect loc of second node in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 3))
      visitor.VariableDeclarator(createVariableDeclarator('x', 7, 9))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(9)
    })

    test('should handle floating point loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 2.5, column: 1.5 },
          end: { line: 2.5, column: 5.5 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional node structure tests', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
        range: [0, 5],
        leadingComments: [],
        trailingComments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node where type is not a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 42,
        id: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where id.type is not a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 123, name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested id without Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'a' },
              value: { type: 'Identifier', name: 'a' },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Date object as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new Date())).not.toThrow()
    })

    test('should handle RegExp as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(/test/)).not.toThrow()
    })

    test('should handle Map as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new Map())).not.toThrow()
    })

    test('should handle Set as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new Set())).not.toThrow()
    })

    test('should handle WeakRef as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new WeakRef({}))).not.toThrow()
    })

    test('should handle Error as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new Error('test'))).not.toThrow()
    })

    test('should handle Proxy as node', () => {
      const { context } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(new Proxy({}, {}))).not.toThrow()
    })
  })

  describe('additional name format tests', () => {
    test('should handle variable name with mixed $ and _', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('$_$', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('$_$', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle variable name with $ at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('element$', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('element$', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle variable name with _ at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('backup_', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('backup_', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should differentiate between similar names with trailing digits', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('item', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('item1', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('item2', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle PascalCase names', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('MyComponent', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MyComponent', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle names with consecutive underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('__proto__', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('__proto__', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle very long variable name shadowing', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      const longName = 'a'.repeat(200)
      visitor.VariableDeclarator(createVariableDeclarator(longName, 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator(longName, 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('order of reports', () => {
    test('should report shadows in order they occur', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('c', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 5, 0))

      expect(reports).toHaveLength(2)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report shadow of same variable in order', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('v', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('v', 5, 0))
      visitor.VariableDeclarator(createVariableDeclarator('v', 10, 0))

      expect(reports).toHaveLength(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })
  })

  describe('context edge cases', () => {
    test('should work when getFilePath returns empty string', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work when config options is undefined', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'let x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noShadowRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with multiple report calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'let x = 1;' })
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('a', 5, 0))

      expect(reports).toHaveLength(3)
      expect(reports[0].message).toContain("'a'")
      expect(reports[1].message).toContain("'b'")
      expect(reports[2].message).toContain("'a'")
    })
  })
})
