import { describe, test, expect, vi } from 'vitest'
import { noNonNullAssertionRule } from '../../../../src/rules/patterns/no-non-null-assertion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createTSNonNullExpression(line = 1, column = 0): unknown {
  return {
    type: 'TSNonNullExpression',
    expression: {
      type: 'Identifier',
      name: 'value',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createRegularExpression(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'value',
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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
      end: { line, column: column + 15 },
    },
  }
}

describe('no-non-null-assertion rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noNonNullAssertionRule.meta.type).toBe('suggestion')
    })

    test('should have warning severity', () => {
      expect(noNonNullAssertionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noNonNullAssertionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNonNullAssertionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noNonNullAssertionRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noNonNullAssertionRule.meta.fixable).toBe('code')
    })

    test('should mention non-null assertion in description', () => {
      expect(noNonNullAssertionRule.meta.docs?.description.toLowerCase()).toContain('non-null')
    })

    test('should have empty schema array', () => {
      expect(noNonNullAssertionRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(visitor).toHaveProperty('TSNonNullExpression')
    })
  })

  describe('detecting non-null assertions', () => {
    test('should report TSNonNullExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!')
    })

    test('should report with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toBe("Unexpected use of non-null assertion operator '!'.")
    })
  })

  describe('allowing other expressions', () => {
    test('should not report regular expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createRegularExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createMemberExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention ! operator in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain('!')
    })

    test('should use single quotes around !', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain("'!'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression('string')).not.toThrow()
      expect(() => visitor.TSNonNullExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'Identifier',
          name: 'value',
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-TSNonNullExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'console',
        },
        property: {
          type: 'Identifier',
          name: 'log',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

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
        getSource: () => 'const x = value!;',
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

      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(createTSNonNullExpression())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'Identifier',
          name: 'value',
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle different expression types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const memberExprNode = {
        type: 'TSNonNullExpression',
        expression: {
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

      visitor.TSNonNullExpression(memberExprNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple non-null assertions', () => {
    test('should report multiple non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(2, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report non-null but not regular expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      visitor.TSNonNullExpression(createRegularExpression())
      visitor.TSNonNullExpression(createMemberExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('additional scenarios', () => {
    test('should handle chained non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSNonNullExpression',
          expression: {
            type: 'Identifier',
            name: 'value',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle call expression with non-null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'fn',
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('meta - extended properties', () => {
    test('should have meta as a plain object', () => {
      expect(typeof noNonNullAssertionRule.meta).toBe('object')
    })

    test('should have meta.type as a string', () => {
      expect(typeof noNonNullAssertionRule.meta.type).toBe('string')
    })

    test('should have meta.severity as a string', () => {
      expect(typeof noNonNullAssertionRule.meta.severity).toBe('string')
    })

    test('should have meta.docs as an object', () => {
      expect(typeof noNonNullAssertionRule.meta.docs).toBe('object')
    })

    test('should have meta.docs.description as a string', () => {
      expect(typeof noNonNullAssertionRule.meta.docs?.description).toBe('string')
    })

    test('should mention assertion in description', () => {
      expect(noNonNullAssertionRule.meta.docs?.description.toLowerCase()).toContain('assertion')
    })

    test('should mention null in description', () => {
      expect(noNonNullAssertionRule.meta.docs?.description.toLowerCase()).toContain('null')
    })

    test('should mention runtime errors in description', () => {
      expect(noNonNullAssertionRule.meta.docs?.description.toLowerCase()).toContain('runtime')
    })

    test('should have docs.url defined', () => {
      expect(noNonNullAssertionRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof noNonNullAssertionRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing codeforge', () => {
      expect(noNonNullAssertionRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have docs.url containing rule name', () => {
      expect(noNonNullAssertionRule.meta.docs?.url).toContain('no-non-null-assertion')
    })

    test('should have fixable set to code', () => {
      expect(noNonNullAssertionRule.meta.fixable).toBe('code')
    })

    test('should have fixable as a string', () => {
      expect(typeof noNonNullAssertionRule.meta.fixable).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noNonNullAssertionRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noNonNullAssertionRule.meta.replacedBy).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(noNonNullAssertionRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noNonNullAssertionRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noNonNullAssertionRule.meta.schema).toHaveLength(0)
    })

    test('should have valid severity values', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noNonNullAssertionRule.meta.severity)
    })

    test('should have valid type values', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noNonNullAssertionRule.meta.type)
    })
  })

  describe('create - visitor structure', () => {
    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should return a defined visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(visitor).toBeDefined()
    })

    test('should return an object type visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have TSNonNullExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(typeof visitor.TSNonNullExpression).toBe('function')
    })

    test('should return same structure on multiple create calls', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor1 = noNonNullAssertionRule.create(context)
      const visitor2 = noNonNullAssertionRule.create(context)
      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should return independent visitors on separate create calls', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor1 = noNonNullAssertionRule.create(context)
      const visitor2 = noNonNullAssertionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should have exactly one key in visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(1)
    })

    test('should have TSNonNullExpression as the only key', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)
      expect(Object.keys(visitor)).toEqual(['TSNonNullExpression'])
    })

    test('create should be a function on the rule', () => {
      expect(typeof noNonNullAssertionRule.create).toBe('function')
    })

    test('meta should be an object on the rule', () => {
      expect(typeof noNonNullAssertionRule.meta).toBe('object')
    })
  })

  describe('detection - various expression types inside TSNonNullExpression', () => {
    test('should detect non-null on identifier expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should detect non-null on member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ArrayExpression',
          elements: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ObjectExpression',
          properties: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on parenthesized expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ParenthesizedExpression',
          expression: { type: 'Identifier', name: 'val' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect non-null on type assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'val' },
          typeAnnotation: { type: 'TSAnyKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detection - non-matching node types', () => {
    test('should not report for plain Identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createRegularExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createMemberExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for NewExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Cls' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'Literal',
        value: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BinaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ArrowFunctionExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({})
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(3, 7))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 99999))

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should report loc as an object with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })
  })

  describe('message content', () => {
    test('should contain word Unexpected', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain word assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })

    test('should contain word operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message.toLowerCase()).toContain('operator')
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have consistent message across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      const firstMessage = reports[0].message

      visitor.TSNonNullExpression(createTSNonNullExpression(2, 0))
      const secondMessage = reports[1].message

      expect(firstMessage).toBe(secondMessage)
    })

    test('should not contain undefined in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).not.toContain('undefined')
    })

    test('should not have standalone null in message outside non-null term', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message).toContain('non-null')
    })
  })

  describe('edge cases - null/undefined/primitive nodes', () => {
    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(true)).not.toThrow()
    })

    test('should handle false node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(false)).not.toThrow()
    })

    test('should handle zero node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(0)).not.toThrow()
    })

    test('should handle negative number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(-1)).not.toThrow()
    })

    test('should handle empty string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression('')).not.toThrow()
    })

    test('should handle NaN node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(Number.NaN)).not.toThrow()
    })

    test('should handle Infinity node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(Number.POSITIVE_INFINITY)).not.toThrow()
    })

    test('should not report for boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(true)
      expect(reports.length).toBe(0)
    })

    test('should not report for number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(42)
      expect(reports.length).toBe(0)
    })

    test('should not report for string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression('hello')
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node with null expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: 'not-an-object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with number expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: null,
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: {},
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string loc properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: {
          start: { line: '1' as unknown as number, column: '0' as unknown as number },
          end: { line: '1' as unknown as number, column: '10' as unknown as number },
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extra: 'data',
        another: true,
        nested: { deep: { value: 123 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with range property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value', range: [0, 5] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 6] as [number, number],
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with only end loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: ['not', 'valid'] as unknown,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.TSNonNullExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor shape', () => {
    test('should have message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc in report when node has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start.line in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have loc.start.column in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have loc.end.line in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(typeof reports[0].loc?.end?.line).toBe('number')
    })

    test('should have loc.end.column in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(typeof reports[0].loc?.end?.column).toBe('number')
    })

    test('should have message as a string in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('multiple assertions', () => {
    test('should report exactly 2 for 2 non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report exactly 5 for 5 non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report exactly 10 for 10 non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report exactly 20 for 20 non-null assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should report correct location for each assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(5, 10))
      visitor.TSNonNullExpression(createTSNonNullExpression(10, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report correct message for each assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createTSNonNullExpression(2, 0))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should count correctly with mixed types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createRegularExpression())
      visitor.TSNonNullExpression(createTSNonNullExpression(3, 0))
      visitor.TSNonNullExpression(createMemberExpression())
      visitor.TSNonNullExpression(createTSNonNullExpression(5, 0))

      expect(reports.length).toBe(3)
    })

    test('should count zero when only non-matching types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createRegularExpression())
      visitor.TSNonNullExpression(createMemberExpression())
      visitor.TSNonNullExpression(createRegularExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: '/src/other/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: '/src/component.tsx' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: '/src/a/b/c/d/e/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'const x = '.repeat(1000) + 'value!;'
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extra: true, nested: { value: 1 } }], source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should work with config that has no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = value!;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(createTSNonNullExpression())).not.toThrow()
    })
  })

  describe('report callback behavior', () => {
    test('should call report exactly once per detected assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should not call report for non-matching nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createRegularExpression())

      expect(reports.length).toBe(0)
    })

    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(2)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(3)
    })

    test('should not reset reports between calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(2)
    })
  })

  describe('rule exports', () => {
    test('should export rule as default export', () => {
      expect(noNonNullAssertionRule).toBeDefined()
    })

    test('should have create method', () => {
      expect(noNonNullAssertionRule.create).toBeDefined()
      expect(typeof noNonNullAssertionRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(noNonNullAssertionRule.meta).toBeDefined()
      expect(typeof noNonNullAssertionRule.meta).toBe('object')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noNonNullAssertionRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should be immutable meta', () => {
      const originalType = noNonNullAssertionRule.meta.type
      expect(originalType).toBe('suggestion')
    })
  })

  describe('visitor return behavior', () => {
    test('TSNonNullExpression handler should return undefined for valid node', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const result = visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(result).toBeUndefined()
    })

    test('TSNonNullExpression handler should return undefined for null node', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const result = visitor.TSNonNullExpression(null)

      expect(result).toBeUndefined()
    })

    test('TSNonNullExpression handler should return undefined for non-matching node', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const result = visitor.TSNonNullExpression(createRegularExpression())

      expect(result).toBeUndefined()
    })
  })

  describe('hasNonNullAssertion internal logic', () => {
    test('should return false-like for empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({})
      expect(reports.length).toBe(0)
    })

    test('should return false-like for object without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ name: 'test' })
      expect(reports.length).toBe(0)
    })

    test('should return true-like for object with TSNonNullExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'TSNonNullExpression' })
      expect(reports.length).toBe(1)
    })

    test('should be case-sensitive on type check', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'tsnonnullexpression' })
      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive on type check with mixed case', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'TsNonNullExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not match similar type names', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'TSNonNullExpressions' })
      expect(reports.length).toBe(0)
    })

    test('should not match with prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'ATSNonNullExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not match with suffix', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({ type: 'TSNonNullExpressionX' })
      expect(reports.length).toBe(0)
    })

    test('should match exact type only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('idempotency and consistency', () => {
    test('should produce same message for same node type across visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = value!;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = value!;' })

      const visitor1 = noNonNullAssertionRule.create(ctx1)
      const visitor2 = noNonNullAssertionRule.create(ctx2)

      visitor1.TSNonNullExpression(createTSNonNullExpression())
      visitor2.TSNonNullExpression(createTSNonNullExpression())

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should produce consistent results when called twice with same input', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = createTSNonNullExpression(1, 0)

      visitor.TSNonNullExpression(node)
      visitor.TSNonNullExpression(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should not affect other visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const x = value!;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const x = value!;' })

      const visitor1 = noNonNullAssertionRule.create(ctx1)
      const visitor2 = noNonNullAssertionRule.create(ctx2)

      visitor1.TSNonNullExpression(createTSNonNullExpression())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)

      visitor2.TSNonNullExpression(createTSNonNullExpression())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })
  })

  describe('deeply nested expression scenarios', () => {
    test('should handle deeply nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'a' },
              property: { type: 'Identifier', name: 'b' },
            },
            property: { type: 'Identifier', name: 'c' },
          },
          property: { type: 'Identifier', name: 'd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle call expression with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [
            { type: 'Literal', value: 1 },
            { type: 'Identifier', name: 'x' },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle optional chain expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ChainExpression',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'method' },
              optional: true,
            },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle template literal expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle ternary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle spread element expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'arr' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle type assertion expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: {
          type: 'TSAsExpression',
          expression: { type: 'Identifier', name: 'val' },
          typeAnnotation: { type: 'TSStringKeyword' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('context logger interactions', () => {
    test('should not throw when logger methods are vi.fn()', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(createTSNonNullExpression())).not.toThrow()
    })

    test('should work when logger.debug is a function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when logger has all required methods', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x!',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should not call report for primitive node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(Symbol('test') as unknown)
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      expect(() => visitor.TSNonNullExpression(BigInt(42) as unknown)).not.toThrow()
    })
  })

  describe('getAST and getTokens context', () => {
    test('should work when getAST returns object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'const x = value!;',
        getTokens: () => [{ type: 'Punctuator', value: '!' }],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when getTokens returns multiple tokens', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = value!;',
        getTokens: () => [
          { type: 'Keyword', value: 'const' },
          { type: 'Identifier', value: 'x' },
          { type: 'Punctuator', value: '=' },
          { type: 'Identifier', value: 'value' },
          { type: 'Punctuator', value: '!' },
        ],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work when getComments returns comments', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = value!;',
        getTokens: () => [],
        getComments: () => [{ type: 'Line', value: ' assertion here' }],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('node with range property', () => {
    test('should report correctly when node has range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value', range: [11, 16] },
        loc: { start: { line: 1, column: 11 }, end: { line: 1, column: 17 } },
        range: [11, 17] as [number, number],
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report correctly when node has range but no expression range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      const node = {
        type: 'TSNonNullExpression',
        expression: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.TSNonNullExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('stress testing', () => {
    test('should handle 50 rapid consecutive assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle 100 rapid consecutive assertions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle interleaved valid and invalid 50 times each', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.TSNonNullExpression(createTSNonNullExpression(i + 1, 0))
        visitor.TSNonNullExpression(createRegularExpression())
      }

      expect(reports.length).toBe(50)
    })
  })

  describe('getFilePath variations', () => {
    test('should work with root path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: '/' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: 'C:\\Users\\dev\\file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with file in current directory', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: 'file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with file having dots in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;', filePath: '/src/my.file.name.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('getSource variations', () => {
    test('should work with source containing only assertion', () => {
      const { context, reports } = createMockRuleContext({ source: 'x!', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with source containing unicode', () => {
      const { context, reports } = createMockRuleContext({ source: 'const 测试 = 值!;', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source', () => {
      const source = 'const a = 1;\nconst b = value!;\nconst c = 3;'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with source containing tabs', () => {
      const { context, reports } = createMockRuleContext({ source: '\tconst x = value!;', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with single character source', () => {
      const { context, reports } = createMockRuleContext({ source: '!', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with whitespace-only source', () => {
      const { context, reports } = createMockRuleContext({ source: '   ', filePath: '/src/file.ts' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('workspace root variations', () => {
    test('should work with empty workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = value!;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })

    test('should work with long workspace root', () => {
      const deep = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p'
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => `${deep}/src/file.ts`,
        getAST: () => null,
        getSource: () => 'const x = value!;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: deep,
      } as unknown as RuleContext

      const visitor = noNonNullAssertionRule.create(context)
      visitor.TSNonNullExpression(createTSNonNullExpression())
      expect(reports.length).toBe(1)
    })
  })

  describe('sequential mixed operations', () => {
    test('should correctly track reports after null then valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(null)
      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should correctly track reports after valid then non-matching', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression())
      visitor.TSNonNullExpression(createRegularExpression())

      expect(reports.length).toBe(1)
    })

    test('should correctly track reports in alternating pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(createTSNonNullExpression(1, 0))
      visitor.TSNonNullExpression(createRegularExpression())
      visitor.TSNonNullExpression(createTSNonNullExpression(3, 0))
      visitor.TSNonNullExpression(createMemberExpression())
      visitor.TSNonNullExpression(createTSNonNullExpression(5, 0))
      visitor.TSNonNullExpression(null)
      visitor.TSNonNullExpression(createTSNonNullExpression(7, 0))

      expect(reports.length).toBe(4)
    })

    test('should correctly track after empty object then valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression({})
      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })

    test('should correctly track after boolean then valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = value!;' })
      const visitor = noNonNullAssertionRule.create(context)

      visitor.TSNonNullExpression(true)
      visitor.TSNonNullExpression(createTSNonNullExpression())

      expect(reports.length).toBe(1)
    })
  })
})
