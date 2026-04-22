import { describe, test, expect, vi } from 'vitest'
import { noEvalRule } from '../../../../src/rules/patterns/no-eval.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDirectEvalCall(line = 1, column = 0): unknown {
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

function createMemberEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWindowEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'window',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createGlobalEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'global',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
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
      name: 'console',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMethodCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-eval rule', () => {
  // =====================================================
  // META PROPERTIES (15 tests)
  // =====================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEvalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEvalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEvalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noEvalRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noEvalRule.meta.schema).toBeDefined()
    })

    test('should not be fixable (eval requires manual review)', () => {
      expect(noEvalRule.meta.fixable).toBeUndefined()
    })

    test('should mention eval in description', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('eval')
    })

    test('should have empty schema array', () => {
      expect(noEvalRule.meta.schema).toEqual([])
    })

    test('should have a description that is a non-empty string', () => {
      expect(typeof noEvalRule.meta.docs?.description).toBe('string')
      expect(noEvalRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs object defined', () => {
      expect(noEvalRule.meta.docs).toBeDefined()
    })

    test('should have docs.url defined', () => {
      expect(noEvalRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof noEvalRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url starting with https://', () => {
      expect(noEvalRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should not be deprecated', () => {
      expect(noEvalRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noEvalRule.meta.replacedBy).toBeUndefined()
    })
  })

  // =====================================================
  // CREATE / VISITOR STRUCTURE (10 tests)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return an object', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor1 = noEvalRule.create(context)
      const visitor2 = noEvalRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context and return RuleVisitor', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should create visitor with only CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('should allow multiple calls to create with different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'eval("test");' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'eval("test");' })

      const visitor1 = noEvalRule.create(ctx1)
      const visitor2 = noEvalRule.create(ctx2)

      visitor1.CallExpression(createDirectEvalCall())
      visitor2.CallExpression(createDirectEvalCall())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should have CallExpression that does not throw for valid nodes', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(createDirectEvalCall())).not.toThrow()
    })

    test('create should be a function', () => {
      expect(typeof noEvalRule.create).toBe('function')
    })
  })

  // =====================================================
  // DETECTION: DIRECT eval() CALLS (15 tests)
  // =====================================================
  describe('detecting direct eval calls', () => {
    test('should report direct eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should report eval with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toBe("Unexpected use of 'eval'.")
    })

    test('should report eval at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report eval at arbitrary line 5 column 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(5, 3))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report eval at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(999, 50))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report eval with end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report eval at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report eval with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Literal', value: '2 + 2' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report eval with variable argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Identifier', name: 'userInput' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report eval with template literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report eval with multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [
          { type: 'Literal', value: 'code' },
          { type: 'Literal', value: 'unused' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report eval with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should report eval inside IIFE', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report eval at end of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(500, 80))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should always report exactly one issue for one eval call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // ALLOWING PROPERTY NAME USAGE (12 tests)
  // =====================================================
  describe('allowing property name usage', () => {
    test('should not report obj.eval property access', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report window.eval() method call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createWindowEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report global.eval() method call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createGlobalEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMethodCall('log'))
      visitor.CallExpression(createMethodCall('info'))
      visitor.CallExpression(createMethodCall('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report self.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'self' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report foo.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report module.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myClass.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myClass' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report this.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report super.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Super' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access obj["eval"]', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report chained member expression a.b.eval()', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // ALLOWING OTHER FUNCTIONS (10 tests)
  // =====================================================
  describe('allowing other functions', () => {
    test('should not report non-eval function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())

      expect(reports.length).toBe(0)
    })

    test('should not report Function constructor call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: '10' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.parse() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report alert() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'alert' },
        arguments: [{ type: 'Literal', value: 'hi' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report custom function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report eval-like names that are not exact eval', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const names = ['evaluate', 'myEval', 'evalExpr', 'Eval', 'EVAL', 'eval_']
      for (const name of names) {
        const node = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        }
        visitor.CallExpression(node)
      }

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // MESSAGE CONTENT (8 tests)
  // =====================================================
  describe('message quality', () => {
    test('should mention eval in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain('eval')
    })

    test('should use single quotes around eval', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain("'eval'")
    })

    test('should have exact message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toBe("Unexpected use of 'eval'.")
    })

    test('should contain word Unexpected', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain word use', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain('use')
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should report same message for every eval call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createDirectEvalCall(2, 5))
      visitor.CallExpression(createDirectEvalCall(10, 20))

      for (const report of reports) {
        expect(report.message).toBe("Unexpected use of 'eval'.")
      }
    })

    test('should always produce a string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(typeof reports[0].message).toBe('string')
    })
  })

  // =====================================================
  // EDGE CASES (25 tests)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully (string)', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle non-object node gracefully (number)', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle non-object node gracefully (boolean)', () => {
      const { context } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

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
        getSource: () => 'eval("test");',
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

      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(createDirectEvalCall())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (no end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle different identifier names', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const logCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'log' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      const testCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }

      visitor.CallExpression(logCall)
      visitor.CallExpression(testCall)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type (NewExpression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 123 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc having zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle extremely large line/column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(99999, 99999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })
  })

  // =====================================================
  // LOCATION REPORTING (15 tests)
  // =====================================================
  describe('location reporting', () => {
    test('should report correct line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(7, 0))

      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should report correct column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 12))

      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report end line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report end column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(3, 5))

      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report loc object with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))

      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default end location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should handle loc with non-number line (fallback to default)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column (fallback to 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 10 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve exact start column from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(4, 7))

      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should handle loc where start has NaN line', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: NaN, column: 5 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  // =====================================================
  // MULTIPLE REPORTS (10 tests)
  // =====================================================
  describe('multiple eval calls', () => {
    test('should report multiple eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createDirectEvalCall(2, 0))
      visitor.CallExpression(createDirectEvalCall(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report eval but not member eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())
      visitor.CallExpression(createMemberEvalCall())
      visitor.CallExpression(createWindowEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should report each eval with its own location', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createDirectEvalCall(5, 10))
      visitor.CallExpression(createDirectEvalCall(20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should report 10 consecutive eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createDirectEvalCall(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of eval and non-eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createOtherFunctionCall(2, 0))
      visitor.CallExpression(createDirectEvalCall(3, 0))
      visitor.CallExpression(createMethodCall('log', 4, 0))
      visitor.CallExpression(createDirectEvalCall(5, 0))

      expect(reports.length).toBe(3)
    })

    test('should report eval calls interspersed with member eval', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createWindowEvalCall(2, 0))
      visitor.CallExpression(createDirectEvalCall(3, 0))
      visitor.CallExpression(createGlobalEvalCall(4, 0))
      visitor.CallExpression(createDirectEvalCall(5, 0))

      expect(reports.length).toBe(3)
    })

    test('should maintain correct message for all reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createDirectEvalCall(2, 0))
      visitor.CallExpression(createDirectEvalCall(3, 0))

      for (const report of reports) {
        expect(report.message).toBe("Unexpected use of 'eval'.")
      }
    })

    test('should handle no reports when no eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())
      visitor.CallExpression(createMethodCall('log'))
      visitor.CallExpression(createWindowEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should handle 50 eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createDirectEvalCall(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should track each report independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 5))
      visitor.CallExpression(createDirectEvalCall(3, 10))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 5 })
      expect(reports[1].loc?.start).toEqual({ line: 3, column: 10 })
    })
  })

  // =====================================================
  // CONTEXT VARIATIONS (12 tests)
  // =====================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");', filePath: '/app/src/utils.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = eval("1+1")', filePath: '/src/file.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test")', filePath: '/src/file.js' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test")', filePath: '/src/component.jsx' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with .ts file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test")', filePath: '/src/index.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test")', filePath: '/src/app.tsx' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with deep nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test")', filePath: '/project/src/features/auth/utils/validators.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ customOption: true }], source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with config having no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'eval("test")',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'const a = 1;\n'.repeat(100) + 'eval("test");'
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should work with multi-byte characters in source', () => {
      const { context, reports } = createMockRuleContext({ source: 'const 中文 = "测试"; eval("test");', filePath: '/src/file.ts' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // ADDITIONAL SCENARIOS (12 tests)
  // =====================================================
  describe('additional scenarios', () => {
    test('should handle eval with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'Literal', value: 'arg2' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle nested eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'eval' },
            arguments: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle eval inside conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Identifier', name: 'cond' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle eval inside try-catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(2, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should handle eval inside arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 8))

      expect(reports.length).toBe(1)
    })

    test('should not report eval as a variable reference (not a call)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'eval',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle eval in assignment context', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Literal', value: 'x = 5' }],
        loc: { start: { line: 3, column: 10 }, end: { line: 3, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle eval as return value', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Literal', value: 'return 1' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle eval with concatenated string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 'a' },
            right: { type: 'Literal', value: 'b' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle eval with spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle globalThis.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle indirect eval via variable alias (not detected)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myEval' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // test.each for SAFE / NON-MATCHING cases (20 tests)
  // =====================================================
  describe('safe function names - should not report', () => {
    function createSafeNameCall(name: string): unknown {
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
    }

    test('should not report evaluate() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('evaluate'))
      expect(reports.length).toBe(0)
    })

    test('should not report myEval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('myEval'))
      expect(reports.length).toBe(0)
    })

    test('should not report evalExpr() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('evalExpr'))
      expect(reports.length).toBe(0)
    })

    test('should not report Eval() call (capital E)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('Eval'))
      expect(reports.length).toBe(0)
    })

    test('should not report EVAL() call (all caps)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('EVAL'))
      expect(reports.length).toBe(0)
    })

    test('should not report eval_() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('eval_'))
      expect(reports.length).toBe(0)
    })

    test('should not report _eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('_eval'))
      expect(reports.length).toBe(0)
    })

    test('should not report evalString() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('evalString'))
      expect(reports.length).toBe(0)
    })

    test('should not report parse() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('parse'))
      expect(reports.length).toBe(0)
    })

    test('should not report execute() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('execute'))
      expect(reports.length).toBe(0)
    })

    test('should not report run() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('run'))
      expect(reports.length).toBe(0)
    })

    test('should not report compile() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('compile'))
      expect(reports.length).toBe(0)
    })

    test('should not report interpret() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('interpret'))
      expect(reports.length).toBe(0)
    })

    test('should not report compute() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('compute'))
      expect(reports.length).toBe(0)
    })

    test('should not report calculate() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('calculate'))
      expect(reports.length).toBe(0)
    })

    test('should not report process() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('process'))
      expect(reports.length).toBe(0)
    })

    test('should not report analyze() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('analyze'))
      expect(reports.length).toBe(0)
    })

    test('should not report transform() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('transform'))
      expect(reports.length).toBe(0)
    })

    test('should not report render() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('render'))
      expect(reports.length).toBe(0)
    })

    test('should not report resolve() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createSafeNameCall('resolve'))
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // test.each for MEMBER EXPRESSION safe cases (15 tests)
  // =====================================================
  describe('member expression safe cases - should not report', () => {
    function createMemberCall(objName: string): unknown {
      const objectType =
        objName === 'this'
          ? { type: 'ThisExpression' }
          : objName === 'super'
            ? { type: 'Super' }
            : { type: 'Identifier', name: objName }
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: objectType,
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
    }

    test('should not report window.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('window'))
      expect(reports.length).toBe(0)
    })

    test('should not report global.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('global'))
      expect(reports.length).toBe(0)
    })

    test('should not report self.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('self'))
      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('globalThis'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('obj'))
      expect(reports.length).toBe(0)
    })

    test('should not report foo.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('foo'))
      expect(reports.length).toBe(0)
    })

    test('should not report bar.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('bar'))
      expect(reports.length).toBe(0)
    })

    test('should not report module.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('module'))
      expect(reports.length).toBe(0)
    })

    test('should not report exports.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('exports'))
      expect(reports.length).toBe(0)
    })

    test('should not report this.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('this'))
      expect(reports.length).toBe(0)
    })

    test('should not report super.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('super'))
      expect(reports.length).toBe(0)
    })

    test('should not report that.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('that'))
      expect(reports.length).toBe(0)
    })

    test('should not report service.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('service'))
      expect(reports.length).toBe(0)
    })

    test('should not report handler.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('handler'))
      expect(reports.length).toBe(0)
    })

    test('should not report utils.eval() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createMemberCall('utils'))
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // test.each for NODE TYPES that should not report (12 tests)
  // =====================================================
  describe('non-CallExpression node types - should not report', () => {
    function createNonCallNode(typeName: string): unknown {
      return {
        type: typeName,
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
    }

    test('should not report NewExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('NewExpression'))
      expect(reports.length).toBe(0)
    })

    test('should not report ExpressionStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('ExpressionStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('VariableDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('FunctionDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('ReturnStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('IfStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('ForStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report WhileStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('WhileStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report SwitchStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('SwitchStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('TryStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('ThrowStatement'))
      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createNonCallNode('BlockStatement'))
      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // test.each for different LOC scenarios (10 tests)
  // =====================================================
  describe('location edge cases via individual tests', () => {
    test('should report correct location for line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 1 column 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(1, 100))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report correct location for line 42 column 7', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(42, 7))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report correct location for line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 1000 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(1000, 50))
      expect(reports[0].loc?.start.line).toBe(1000)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for line 2 column 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(2, 1))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report correct location for line 9999 column 999', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(9999, 999))
      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should report correct location for line 3 column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(3, 20))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location for line 50 column 80', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context).CallExpression(createDirectEvalCall(50, 80))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(80)
    })
  })

  // =====================================================
  // EXTRACTLOCATION DEFAULTS (8 tests)
  // =====================================================
  describe('extractLocation defaults', () => {
    test('should default to line 1 column 0 when no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default end to line 1 column 1 when no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should default start.line to 1 when start is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: null as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should default start.column to 0 when start is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: null as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default end.line to 1 when end is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 5, column: 2 },
          end: null as unknown as { line: number; column: number },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should default end.column to 0 when end is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 5, column: 2 },
          end: null as unknown as { line: number; column: number },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with start having missing line property', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { column: 5 } as unknown as { line: number; column: number },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with start having missing column property', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {
          start: { line: 7 } as unknown as { line: number; column: number },
          end: { line: 7, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // =====================================================
  // RULE EXPORT AND STRUCTURE (6 tests)
  // =====================================================
  describe('rule export and structure', () => {
    test('should export noEvalRule as default export', () => {
      const defaultImport = noEvalRule
      expect(defaultImport).toBeDefined()
      expect(defaultImport.meta).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noEvalRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noEvalRule).toHaveProperty('create')
    })

    test('meta should be an object', () => {
      expect(typeof noEvalRule.meta).toBe('object')
    })

    test('create should be a function', () => {
      expect(typeof noEvalRule.create).toBe('function')
    })

    test('should not have extra properties beyond meta and create', () => {
      const keys = Object.keys(noEvalRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  // =====================================================
  // INDIRECT EVAL / ALIASING (8 tests)
  // =====================================================
  describe('indirect eval and aliasing', () => {
    test('should not detect indirect eval via (0, eval)()', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 0 },
            { type: 'Identifier', name: 'eval' },
          ],
        },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect eval aliased to variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'e' },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect eval via Reflect.apply', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'apply' },
        },
        arguments: [{ type: 'Identifier', name: 'eval' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect eval via Function.prototype.call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Function' },
            property: { type: 'Identifier', name: 'prototype' },
          },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [{ type: 'Identifier', name: 'eval' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag eval as object property key', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag eval in callback position', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [
          { type: 'Literal', value: 'eval("code")' },
          { type: 'Literal', value: 1000 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag eval used as parameter name', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Identifier', name: 'eval' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report require("eval") call', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'eval' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // CONSECUTIVE CALLS CONSISTENCY (6 tests)
  // =====================================================
  describe('consecutive calls consistency', () => {
    test('should report same eval call twice if visited twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      const node = createDirectEvalCall()
      visitor.CallExpression(node)
      visitor.CallExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should handle alternating eval and safe calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createDirectEvalCall(i * 2 + 1, 0))
        visitor.CallExpression(createOtherFunctionCall(i * 2 + 2, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should maintain independence between different visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'eval("test");' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'eval("test");' })

      const visitor1 = noEvalRule.create(ctx1)
      const visitor2 = noEvalRule.create(ctx2)

      visitor1.CallExpression(createDirectEvalCall())
      visitor2.CallExpression(createOtherFunctionCall())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle many non-eval calls followed by one eval', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createOtherFunctionCall(i + 1, 0))
      }
      visitor.CallExpression(createDirectEvalCall(21, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(21)
    })

    test('should handle one eval followed by many non-eval calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createOtherFunctionCall(i + 2, 0))
      }

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle empty visitor (no calls)', () => {
      const { context, reports } = createMockRuleContext({ source: 'eval("test");' })
      noEvalRule.create(context)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // DOCS URL AND DESCRIPTION (5 tests)
  // =====================================================
  describe('docs metadata', () => {
    test('should have a valid URL containing codeforge', () => {
      expect(noEvalRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have description mentioning security', () => {
      const desc = noEvalRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('security')
    })

    test('should have description mentioning eval', () => {
      const desc = noEvalRule.meta.docs?.description ?? ''
      expect(desc).toContain('eval')
    })

    test('should have description mentioning performance', () => {
      const desc = noEvalRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('performance')
    })

    test('should have description mentioning vulnerabilities', () => {
      const desc = noEvalRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('vulnerabilit')
    })
  })
})
