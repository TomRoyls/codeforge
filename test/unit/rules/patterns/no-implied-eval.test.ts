import { describe, test, expect, vi } from 'vitest'
import { noImpliedEvalRule } from '../../../../src/rules/patterns/no-implied-eval.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSetTimeoutWithString(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Literal',
        value: 'alert(1)',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetIntervalWithString(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setInterval',
    },
    arguments: [
      {
        type: 'Literal',
        value: 'alert(1)',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'FunctionExpression',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithArrowFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'myCallback',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithTemplateLiteral(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: [
          {
            type: 'TemplateElement',
            value: { raw: 'alert', cooked: 'alert' },
          },
        ],
        expressions: [],
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithNumber(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Literal',
        value: 123,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createOtherFunctionCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'eval',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-implied-eval rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noImpliedEvalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noImpliedEvalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noImpliedEvalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noImpliedEvalRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noImpliedEvalRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noImpliedEvalRule.meta.fixable).toBeUndefined()
    })

    test('should mention setTimeout/setInterval in description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('settimeout')
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('setinterval')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting implied eval - setTimeout', () => {
    test('should report setTimeout with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })

    test('should report setTimeout with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithTemplateLiteral())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })

    test('should not report setTimeout with function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithFunction())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithArrowFunction())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with identifier (function reference)', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithIdentifier())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithNumber())

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting implied eval - setInterval', () => {
    test('should report setInterval with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetIntervalWithString())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })
  })

  describe('ignoring other functions', () => {
    test('should not report other function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention setTimeout/setInterval in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toContain('setTimeout')
      expect(reports[0].message).toContain('setInterval')
    })

    test('should mention first argument in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toContain('first argument')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'setTimeout' },
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-object first argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 123,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
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
        getSource: () => 'setTimeout("code", 100);',
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

      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(createSetTimeoutWithString())).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('meta - extended properties', () => {
    test('should have docs.url defined', () => {
      expect(noImpliedEvalRule.meta.docs?.url).toBeDefined()
      expect(typeof noImpliedEvalRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing rules reference', () => {
      expect(noImpliedEvalRule.meta.docs?.url).toContain('no-implied-eval')
    })

    test('should have non-empty description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention execScript in description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('execscript')
    })

    test('should mention string arguments in description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('string')
    })

    test('should mention security risks in description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('security')
    })

    test('should not be deprecated', () => {
      expect(noImpliedEvalRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noImpliedEvalRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noImpliedEvalRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(Array.isArray(noImpliedEvalRule.meta.schema)).toBe(true)
    })

    test('should have valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noImpliedEvalRule.meta.type)
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(noImpliedEvalRule.meta.severity)
    })

    test('should have docs object defined', () => {
      expect(noImpliedEvalRule.meta.docs).toBeDefined()
    })

    test('should have meta object defined', () => {
      expect(noImpliedEvalRule.meta).toBeDefined()
      expect(typeof noImpliedEvalRule.meta).toBe('object')
    })

    test('should have meta.type as string', () => {
      expect(typeof noImpliedEvalRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noImpliedEvalRule.meta.severity).toBe('string')
    })
  })

  describe('create - extended', () => {
    test('should return visitor that is an object', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })

      const visitor1 = noImpliedEvalRule.create(ctx1)
      const visitor2 = noImpliedEvalRule.create(ctx2)

      visitor1.CallExpression(createSetTimeoutWithString())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)

      visitor2.CallExpression(createSetTimeoutWithString())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })

      expect(() => noImpliedEvalRule.create(context)).not.toThrow()
    })

    test('should return same visitor structure on multiple create calls', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor1 = noImpliedEvalRule.create(context)
      const visitor2 = noImpliedEvalRule.create(context)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })
  })

  describe('detecting implied eval - setTimeout extended', () => {
    test('should report setTimeout with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with whitespace-only string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: '   ' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with complex code string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'document.cookie = "stolen"' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with multiline code string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'var x = 1;\nvar y = 2;' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with unicode string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'alert("日本語")' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with template literal containing expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'alert(', cooked: 'alert(' } },
              { type: 'TemplateElement', value: { raw: ')', cooked: ')' } },
            ],
            expressions: [{ type: 'Identifier', name: 'x' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with template literal with no quasis', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report setTimeout with boolean literal first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with null literal first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with regex literal first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: /test/ }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with object expression first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'ObjectExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with array expression first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'ArrayExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with call expression first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getCallback' },
            arguments: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with member expression first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting implied eval - setInterval extended', () => {
    test('should report setInterval with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'alert(1)', cooked: 'alert(1)' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setInterval with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setInterval with complex code string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Literal', value: 'while(true) { break; }' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report setInterval with function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'FunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setInterval with arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'ArrowFunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setInterval with identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Identifier', name: 'tick' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setInterval with number first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setInterval with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report setInterval with template literal containing expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'console.log(', cooked: 'console.log(' } },
              { type: 'TemplateElement', value: { raw: ')', cooked: ')' } },
            ],
            expressions: [{ type: 'Identifier', name: 'count' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting implied eval - execScript', () => {
    test('should report execScript with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'alert(1)' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })

    test('should report execScript with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'alert(1)', cooked: 'alert(1)' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report execScript with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report execScript with function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'FunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report execScript with arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'ArrowFunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report execScript with identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Identifier', name: 'callback' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report execScript with number first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report execScript with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report execScript with multiline string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'var a=1;\nvar b=2;\nreturn a+b;' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location for execScript', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report execScript with template literal containing expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'run(', cooked: 'run(' } },
              { type: 'TemplateElement', value: { raw: ')', cooked: ')' } },
            ],
            expressions: [{ type: 'Identifier', name: 'cmd' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should mention execScript in report message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('execScript')
    })
  })

  describe('ignoring other functions - extended', () => {
    test('should not report requestAnimationFrame with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'requestAnimationFrame' },
        arguments: [{ type: 'Literal', value: 'animate()' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Function constructor with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [{ type: 'Literal', value: 'return 1' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report fetch with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [{ type: 'Literal', value: 'https://example.com' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report custom function with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myCustomFunc' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report queueMicrotask with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'queueMicrotask' },
        arguments: [{ type: 'Literal', value: 'task()' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report process.nextTick with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'nextTick' },
        arguments: [{ type: 'Literal', value: 'tick()' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Promise constructor with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Literal', value: 'resolve()' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report clearTimeout', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clearTimeout' },
        arguments: [{ type: 'Identifier', name: 'id' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report clearInterval', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clearInterval' },
        arguments: [{ type: 'Identifier', name: 'id' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report eval - handled by separate rule', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report window.setTimeout via MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'setTimeout' },
        },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.setTimeout via MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'setTimeout' },
        },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [{ type: 'Literal', value: 'string' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality - extended', () => {
    test('should produce exact expected message for setTimeout', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toBe(
        'Implied eval. Do not use strings as the first argument to setTimeout/setInterval/execScript.',
      )
    })

    test('should produce exact expected message for setInterval', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetIntervalWithString())

      expect(reports[0].message).toBe(
        'Implied eval. Do not use strings as the first argument to setTimeout/setInterval/execScript.',
      )
    })

    test('should contain eval word in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message.toLowerCase()).toContain('eval')
    })

    test('should contain string word in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should contain argument word in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message.toLowerCase()).toContain('argument')
    })

    test('should be consistent message across all target functions', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const { context: ctx3, reports: reports3 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })

      const visitor1 = noImpliedEvalRule.create(ctx1)
      const visitor2 = noImpliedEvalRule.create(ctx2)
      const visitor3 = noImpliedEvalRule.create(ctx3)

      visitor1.CallExpression(createSetTimeoutWithString())
      visitor2.CallExpression(createSetIntervalWithString())
      visitor3.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports1[0].message).toBe(reports2[0].message)
      expect(reports2[0].message).toBe(reports3[0].message)
    })

    test('should mention execScript in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toContain('execScript')
    })

    test('should not have undefined in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).not.toContain('undefined')
    })

    test('should mention do not use in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message.toLowerCase()).toContain('do not use')
    })
  })

  describe('location reporting - extended', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for setInterval', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetIntervalWithString(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should default to line 1 column 0 when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle zero line and column values', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line and column values', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 99999, column: 99999 }, end: { line: 99999, column: 100000 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle multline location span', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 5, column: 2 }, end: { line: 8, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should default column to 0 when start has no column', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 3 }, end: { line: 3, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('edge cases - extended', () => {
    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle boolean false node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle number zero node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
    })

    test('should handle negative number node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(-1)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'setTimeout',
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined first argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string first argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: ['not-an-object'],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with number first argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [42],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: null, name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having no name', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with Literal with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: undefined }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: 'invalid',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle deeply nested arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
          {
            type: 'Literal',
            value: 1000,
          },
          {
            type: 'Literal',
            value: 'extra',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN as node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(NaN)).not.toThrow()
    })

    test('should handle Infinity as node', () => {
      const { context } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(Infinity)).not.toThrow()
    })
  })

  describe('multiple reports', () => {
    test('should report multiple setTimeout calls separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(1, 0))
      visitor.CallExpression(createSetTimeoutWithString(5, 10))
      visitor.CallExpression(createSetTimeoutWithString(10, 20))

      expect(reports.length).toBe(3)
    })

    test('should report mixed setTimeout and setInterval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())
      visitor.CallExpression(createSetIntervalWithString())

      expect(reports.length).toBe(2)
    })

    test('should report setTimeout, setInterval, and execScript together', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())
      visitor.CallExpression(createSetIntervalWithString())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(3)
    })

    test('should only report string calls not function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())
      visitor.CallExpression(createSetTimeoutWithFunction())
      visitor.CallExpression(createSetTimeoutWithArrowFunction())

      expect(reports.length).toBe(1)
    })

    test('should report correct locations for each call in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(1, 0))
      visitor.CallExpression(createSetTimeoutWithString(2, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should handle many rapid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createSetTimeoutWithString(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle interleaved valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithFunction())
      visitor.CallExpression(createSetTimeoutWithString())
      visitor.CallExpression(createSetTimeoutWithIdentifier())
      visitor.CallExpression(createSetIntervalWithString())
      visitor.CallExpression(createSetTimeoutWithArrowFunction())

      expect(reports.length).toBe(2)
    })

    test('should handle same visitor reused after non-reporting call', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())
      expect(reports.length).toBe(0)

      visitor.CallExpression(createSetTimeoutWithString())
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor reusability', () => {
    test('should maintain report count across calls on same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())
      expect(reports.length).toBe(1)

      visitor.CallExpression(createSetTimeoutWithString())
      expect(reports.length).toBe(2)
    })

    test('should not accumulate state from non-reporting calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createSetTimeoutWithFunction())
      }

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should work correctly after null node handling', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should work correctly after undefined node handling', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(undefined)
      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should work correctly after edge case handling', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression('string')
      visitor.CallExpression(123)
      visitor.CallExpression({})
      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should have a named export', () => {
      expect(noImpliedEvalRule).toBeDefined()
    })

    test('should have meta property on export', () => {
      expect(noImpliedEvalRule.meta).toBeDefined()
    })

    test('should have create method on export', () => {
      expect(typeof noImpliedEvalRule.create).toBe('function')
    })

    test('should be a valid RuleDefinition', () => {
      expect(noImpliedEvalRule).toHaveProperty('meta')
      expect(noImpliedEvalRule).toHaveProperty('create')
    })
  })

  describe('context handling', () => {
    test('should handle context with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);', filePath: '/different/path.ts' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should handle context with different source', () => {
      const { context, reports } = createMockRuleContext({ source: 'setInterval("code", 100);', filePath: '/src/file.ts' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty options object', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should handle context with extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ customOption: true }], source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })

    test('should handle context with undefined config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
    })
  })

  describe('specific string patterns', () => {
    test('should report setTimeout with HTML string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: '<script>alert(1)</script>' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with escaped characters string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'alert("\\x41")' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with single character string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setInterval with very long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const longStr = 'a'.repeat(10000)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Literal', value: longStr }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report execScript with try-catch string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [{ type: 'Literal', value: 'try { x } catch(e) { y }' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with IIFE string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: '(function(){ return 1; })()' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with newlines and tabs string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: '\t\n\tvar x = 1;\n' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('setTimeout case sensitivity', () => {
    test('should not report settimeout with lowercase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'settimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report SETTIMEOUT with uppercase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'SETTIMEOUT' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report SetTimeout with mixed case name', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'SetTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('Literal with string-like non-string values', () => {
    test('should not report setTimeout with boolean Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: false }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setInterval with BigInt Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [{ type: 'Literal', value: BigInt(9007199254740991) }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('callee edge cases', () => {
    test('should handle callee with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: undefined, name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee that is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: [{ type: 'Identifier', name: 'setTimeout' }],
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('arguments edge cases', () => {
    test('should handle arguments with extra properties on first arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'Literal',
            value: 'code',
            extra: true,
            raw: '"code"',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle first argument with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle single argument setTimeout with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'alert(1)' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 3, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with empty start object', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: {}, end: {} },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 'one', column: 0 }, end: { line: 'one', column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 'zero' }, end: { line: 1, column: 'five' } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: null, end: { line: 1, column: 5 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('concurrent visitor usage', () => {
    test('should handle two visitors for same context pattern', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })

      const visitor1 = noImpliedEvalRule.create(ctx1)
      const visitor2 = noImpliedEvalRule.create(ctx2)

      visitor1.CallExpression(createSetTimeoutWithString(1, 0))
      visitor2.CallExpression(createSetIntervalWithString(2, 5))
      visitor1.CallExpression(createSetTimeoutWithString(3, 10))

      expect(reports1.length).toBe(2)
      expect(reports2.length).toBe(1)
    })
  })

  describe('report descriptor completeness', () => {
    test('should include loc in report for setTimeout string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc in report for setInterval string', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetIntervalWithString())

      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc with start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should include loc with end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should produce a single report per violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('TemplateLiteral variations', () => {
    test('should report setInterval with complex template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              {
                type: 'TemplateElement',
                value: { raw: 'for(var i=0;i<10;i++){', cooked: 'for(var i=0;i<10;i++){' },
              },
              { type: 'TemplateElement', value: { raw: '}', cooked: '}' } },
            ],
            expressions: [{ type: 'Identifier', name: 'body' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report execScript with template literal having multiple quasis', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'a', cooked: 'a' } },
              { type: 'TemplateElement', value: { raw: 'b', cooked: 'b' } },
              { type: 'TemplateElement', value: { raw: 'c', cooked: 'c' } },
            ],
            expressions: [
              { type: 'Identifier', name: 'x' },
              { type: 'Identifier', name: 'y' },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setTimeout with template literal having single quasi', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'alert(1)', cooked: 'alert(1)' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report setInterval with empty template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setInterval' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report execScript with template literal having nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'execScript' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [
              { type: 'TemplateElement', value: { raw: 'console.log(', cooked: 'console.log(' } },
              { type: 'TemplateElement', value: { raw: ')', cooked: ')' } },
            ],
            expressions: [
              {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'obj' },
                property: { type: 'Identifier', name: 'value' },
              },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('idempotency', () => {
    test('should produce same result when called twice with same node', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'setTimeout("code", 100);' })

      const visitor1 = noImpliedEvalRule.create(ctx1)
      const visitor2 = noImpliedEvalRule.create(ctx2)

      const node = createSetTimeoutWithString(7, 3)

      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(reports1.length).toBe(reports2.length)
      expect(reports1[0].message).toBe(reports2[0].message)
      expect(reports1[0].loc?.start.line).toBe(reports2[0].loc?.start.line)
      expect(reports1[0].loc?.start.column).toBe(reports2[0].loc?.start.column)
    })
  })
})
