import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noEvalRule } from '../../../../src/rules/security/no-eval.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

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

function createEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'eval' },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Function' },
    arguments: [{ type: 'Literal', value: 'return 1' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNewFunction(line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Function' },
    arguments: [{ type: 'Literal', value: 'return 1' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberEvalCall(objectName = 'window', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'eval' },
    },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWithStatement(line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object: { type: 'Identifier', name: 'obj' },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSafeCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'console' },
    property: { type: 'Identifier', name: 'log' },
    arguments: [{ type: 'Literal', value: 'hello' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberCall(objectName: string, propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifierCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [{ type: 'Literal', value: 'code' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-eval rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noEvalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEvalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEvalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noEvalRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noEvalRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noEvalRule.meta.docs?.description).toContain('eval()')
    })

    test('should mention security in description', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('security')
    })

    test('should have docs url', () => {
      expect(noEvalRule.meta.docs?.url).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(noEvalRule.meta.fixable).toBe('code')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noEvalRule.meta.schema)).toBe(true)
    })

    test('should have allowIndirect in schema', () => {
      const schema = noEvalRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0].properties).toHaveProperty('allowIndirect')
    })

    test('should have allowWith in schema', () => {
      const schema = noEvalRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0].properties).toHaveProperty('allowWith')
    })

    test('should have description mentioning injection', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('injection')
    })

    test('should have description mentioning vulnerabilities', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('vulnerabilit')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('WithStatement')
      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should report direct eval() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
      expect(reports[0].message).toContain('security')
    })

    test('should report Function constructor call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createFunctionCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should report new Function() expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should report member expression eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should report global.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('global'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should report with statement by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('with')
    })

    test('should not report safe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createSafeCall())

      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in WithStatement', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('eval detection', () => {
    test('should flag direct eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should flag eval at different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(42, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should flag eval at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should flag eval with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag eval with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [
          { type: 'Literal', value: 'code' },
          { type: 'Literal', value: 'more' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag window.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should flag global.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('global'))

      expect(reports.length).toBe(1)
    })

    test('should flag self.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('self'))

      expect(reports.length).toBe(1)
    })

    test('should flag globalThis.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('globalThis'))

      expect(reports.length).toBe(1)
    })

    test('should flag top.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('top'))

      expect(reports.length).toBe(1)
    })

    test('should flag parent.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('parent'))

      expect(reports.length).toBe(1)
    })

    test('should flag frames.eval call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('frames'))

      expect(reports.length).toBe(1)
    })

    test('should flag eval with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'Identifier', name: 'userInput' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag eval with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [{ type: 'TemplateLiteral', quasis: [] }],
        loc: { start: { line: 3, column: 8 }, end: { line: 3, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag chained eval obj.a.b.eval via MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'a' },
          },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })
  })

  describe('Function constructor detection', () => {
    test('should flag Function() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createFunctionCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should flag new Function() expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should flag window.Function() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'Function'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should flag global.Function() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('global', 'Function'))

      expect(reports.length).toBe(1)
    })

    test('should flag self.Function() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('self', 'Function'))

      expect(reports.length).toBe(1)
    })

    test('should flag Function() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag Function() with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'return a + b' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag new Function() with location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction(10, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should flag new Function() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should flag new Function() message mentions equivalent to eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction())

      expect(reports[0].message).toContain('equivalent to eval')
    })

    test('should flag window.Function() with allowIndirect still flags Function', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'Function'))

      // allowIndirect only skips eval via MemberExpression, not Function
      expect(reports.length).toBe(1)
    })

    test('should not flag new MyFunction() - non-Function constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should flag globalThis.Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('globalThis', 'Function'))

      expect(reports.length).toBe(1)
    })
  })

  describe('timer functions', () => {
    test('should flag window.setTimeout with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setTimeout'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('setTimeout')
    })

    test('should flag window.setInterval with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setInterval'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('setInterval')
    })

    test('should flag window.setImmediate with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setImmediate'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('setImmediate')
    })

    test('should flag global.setTimeout with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('global', 'setTimeout'))

      expect(reports.length).toBe(1)
    })

    test('should flag global.setInterval with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('global', 'setInterval'))

      expect(reports.length).toBe(1)
    })

    test('should flag global.setImmediate with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('global', 'setImmediate'))

      expect(reports.length).toBe(1)
    })

    test('should not flag direct setTimeout call (not Identifier eval/Function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('setTimeout'))

      expect(reports.length).toBe(0)
    })

    test('should not flag direct setInterval call (not Identifier eval/Function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('setInterval'))

      expect(reports.length).toBe(0)
    })

    test('should not flag direct setImmediate call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('setImmediate'))

      expect(reports.length).toBe(0)
    })

    test('should flag self.setTimeout', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('self', 'setTimeout'))

      expect(reports.length).toBe(1)
    })

    test('should flag self.setInterval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('self', 'setInterval'))

      expect(reports.length).toBe(1)
    })

    test('should flag self.setImmediate', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('self', 'setImmediate'))

      expect(reports.length).toBe(1)
    })

    test('should flag globalThis.setTimeout', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('globalThis', 'setTimeout'))

      expect(reports.length).toBe(1)
    })

    test('should flag globalThis.setInterval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('globalThis', 'setInterval'))

      expect(reports.length).toBe(1)
    })

    test('should flag globalThis.setImmediate', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('globalThis', 'setImmediate'))

      expect(reports.length).toBe(1)
    })

    test('should not report setTimeout via MemberExpression with callback function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      // setTimeout in DANGEROUS_FUNCTIONS, so it gets flagged by member expression
      // regardless of argument type (the rule checks callee, not args)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'setTimeout' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', body: {} }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      // The rule flags based on the function name, not the arg type
      expect(reports.length).toBe(1)
    })
  })

  describe('execScript detection', () => {
    test('should flag window.execScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'execScript'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('execScript')
    })

    test('should flag global.execScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('global', 'execScript'))

      expect(reports.length).toBe(1)
    })

    test('should flag self.execScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('self', 'execScript'))

      expect(reports.length).toBe(1)
    })

    test('should flag globalThis.execScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('globalThis', 'execScript'))

      expect(reports.length).toBe(1)
    })

    test('should not flag direct execScript call (Identifier, not eval/Function)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('execScript'))

      expect(reports.length).toBe(0)
    })

    test('should not flag custom.myExecScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('custom', 'myExecScript'))

      expect(reports.length).toBe(0)
    })

    test('should flag execScript with location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'execScript', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should flag execScript with empty arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'execScript' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not flag obj.executeScript', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'executeScript'))

      expect(reports.length).toBe(0)
    })

    test('should not flag obj.script', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'script'))

      expect(reports.length).toBe(0)
    })
  })

  describe('indirect eval', () => {
    test('should flag window.eval without allowIndirect', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))

      expect(reports.length).toBe(1)
    })

    test('should not flag window.eval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))

      expect(reports.length).toBe(0)
    })

    test('should still flag direct eval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should flag global.eval without allowIndirect', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('global'))

      expect(reports.length).toBe(1)
    })

    test('should not flag global.eval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('global'))

      expect(reports.length).toBe(0)
    })

    test('should not flag self.eval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('self'))

      expect(reports.length).toBe(0)
    })

    test('should not flag globalThis.eval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('globalThis'))

      expect(reports.length).toBe(0)
    })

    test('should still flag window.Function with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'Function'))

      expect(reports.length).toBe(1)
    })

    test('should still flag window.setTimeout with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setTimeout'))

      expect(reports.length).toBe(1)
    })

    test('should still flag window.setInterval with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setInterval'))

      expect(reports.length).toBe(1)
    })

    test('should still flag window.execScript with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'execScript'))

      expect(reports.length).toBe(1)
    })

    test('should flag chained eval via MemberExpression without allowIndirect', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'obj' },
          },
          property: { type: 'Identifier', name: 'eval' },
        },
        arguments: [{ type: 'Literal', value: 'code' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('with statement', () => {
    test('should flag with statement by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('with')
    })

    test('should not flag with statement when allowWith=true', () => {
      const { context, reports } = createMockContext({ allowWith: true })
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(0)
    })

    test('should flag with statement with location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement(12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should flag with statement with correct message about deprecation', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports[0].message).toContain('deprecated')
    })

    test('should flag with statement with different object types', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'WithStatement',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should flag with statement even with allowIndirect=true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(1)
    })

    test('should flag with statement when both options are false', () => {
      const { context, reports } = createMockContext({ allowIndirect: false, allowWith: false })
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(1)
    })

    test('should not flag with statement when only allowWith is true', () => {
      const { context, reports } = createMockContext({ allowWith: true, allowIndirect: false })
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(0)
    })

    test('should flag multiple with statements independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement(1, 0))
      visitor.WithStatement(createWithStatement(5, 2))
      visitor.WithStatement(createWithStatement(10, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle with statement at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('not flagging safe code', () => {
    test('should not flag myEval()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('myEval'))

      expect(reports.length).toBe(0)
    })

    test('should not flag console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createSafeCall())

      expect(reports.length).toBe(0)
    })

    test('should not flag Math.random()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('Math', 'random'))

      expect(reports.length).toBe(0)
    })

    test('should not flag JSON.parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('JSON', 'parse'))

      expect(reports.length).toBe(0)
    })

    test('should not flag Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('Array', 'isArray'))

      expect(reports.length).toBe(0)
    })

    test('should not flag Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('Object', 'keys'))

      expect(reports.length).toBe(0)
    })

    test('should not flag custom.setTimeout()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('custom', 'setTimeout'))

      // This IS flagged - setTimeout is in DANGEROUS_FUNCTIONS
      expect(reports.length).toBe(1)
    })

    test('should not flag myObj.eval()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      // myObj.eval IS flagged because eval is in DANGEROUS_FUNCTIONS
      visitor.CallExpression(createMemberCall('myObj', 'eval'))

      expect(reports.length).toBe(1)
    })

    test('should not flag regularFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('regularFunction'))

      expect(reports.length).toBe(0)
    })

    test('should not flag parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('parse'))

      expect(reports.length).toBe(0)
    })

    test('should not flag evaluate()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('evaluate'))

      expect(reports.length).toBe(0)
    })

    test('should not flag MyFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('MyFunction'))

      expect(reports.length).toBe(0)
    })

    test('should not flag factory()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('factory'))

      expect(reports.length).toBe(0)
    })

    test('should not flag Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('Promise', 'resolve'))

      expect(reports.length).toBe(0)
    })

    test('should not flag fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('fetch'))

      expect(reports.length).toBe(0)
    })

    test('should not flag document.getElementById()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('document', 'getElementById'))

      expect(reports.length).toBe(0)
    })

    test('should not flag element.addEventListener()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('element', 'addEventListener'))

      expect(reports.length).toBe(0)
    })

    test('should not flag lodash.map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('_', 'map'))

      expect(reports.length).toBe(0)
    })

    test('should not flag new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag obj.customMethod()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'customMethod'))

      expect(reports.length).toBe(0)
    })

    test('should not flag process.exit()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('process', 'exit'))

      expect(reports.length).toBe(0)
    })

    test('should not flag Buffer.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('Buffer', 'from'))

      expect(reports.length).toBe(0)
    })

    test('should not flag url.parse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('url', 'parse'))

      expect(reports.length).toBe(0)
    })

    test('should not flag path.join()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('path', 'join'))

      expect(reports.length).toBe(0)
    })

    test('should not flag fs.readFile()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('fs', 'readFile'))

      expect(reports.length).toBe(0)
    })

    test('should not flag crypto.randomBytes()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('crypto', 'randomBytes'))

      expect(reports.length).toBe(0)
    })

    test('should not flag util.promisify()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('util', 'promisify'))

      expect(reports.length).toBe(0)
    })

    test('should not flag events.on()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('events', 'on'))

      expect(reports.length).toBe(0)
    })

    test('should not flag stream.pipe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('stream', 'pipe'))

      expect(reports.length).toBe(0)
    })

    test('should not flag http.get()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('http', 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not flag new CustomClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'CustomClass' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not flag container.getElementById()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('container', 'getElementById'))

      expect(reports.length).toBe(0)
    })
  })

  describe('violation properties', () => {
    test('should include correct start line in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should include correct start column in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(5, 10))

      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should include end line in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should include end column in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(5, 10))

      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should include callee name in message for eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports[0].message).toContain("'eval'")
    })

    test('should include callee name in message for Function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createFunctionCall())

      expect(reports[0].message).toContain("'Function'")
    })

    test('should include security warning in eval message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports[0].message).toContain('security')
    })

    test('should include suggestion in eval message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports[0].message).toContain('Avoid eval()')
    })

    test('should include suggestion in Function constructor message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createFunctionCall())

      expect(reports[0].message).toContain('Avoid eval()')
    })

    test('should include callee name in message for setTimeout via MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'setTimeout'))

      expect(reports[0].message).toContain("'setTimeout'")
    })

    test('should include callee name in message for execScript via MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('window', 'execScript'))

      expect(reports[0].message).toContain("'execScript'")
    })

    test('should include security warning in new Function message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction())

      expect(reports[0].message).toContain('security')
    })

    test('should include deprecated in with statement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports[0].message).toContain('deprecated')
    })
  })

  describe('edge cases', () => {
    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report other dangerous timer functions (setTimeout without string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'setTimeout' },
        arguments: [{ type: 'ArrowFunctionExpression', body: {} }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in WithStatement', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle numeric node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'eval' },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression callee without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Literal', value: 'eval' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'eval' },
        arguments: [],
        loc: { start: { line: 1 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle WithStatement with null node', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
    })

    test('should handle NewExpression with number node', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.NewExpression(42)).not.toThrow()
    })
  })

  describe('multiple violations', () => {
    test('should report multiple eval calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(1, 0))
      visitor.CallExpression(createEvalCall(3, 4))
      visitor.CallExpression(createEvalCall(7, 2))

      expect(reports.length).toBe(3)
    })

    test('should report mixed eval and Function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createFunctionCall())

      expect(reports.length).toBe(2)
    })

    test('should report eval and with statement together', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(2)
    })

    test('should report all types of violations together', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createFunctionCall())
      visitor.NewExpression(createNewFunction())
      visitor.WithStatement(createWithStatement())
      visitor.CallExpression(createMemberEvalCall('window'))
      visitor.CallExpression(createMemberCall('window', 'setTimeout'))
      visitor.CallExpression(createMemberCall('window', 'execScript'))

      expect(reports.length).toBe(7)
    })

    test('should report eval calls with correct individual locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall(1, 0))
      visitor.CallExpression(createEvalCall(10, 5))
      visitor.CallExpression(createEvalCall(20, 15))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should report multiple with statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement(1, 0))
      visitor.WithStatement(createWithStatement(5, 0))
      visitor.WithStatement(createWithStatement(10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report new Function mixed with eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.NewExpression(createNewFunction())
      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Function')
      expect(reports[1].message).toContain('eval')
    })

    test('should report timer functions alongside eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createMemberCall('window', 'setTimeout'))
      visitor.CallExpression(createMemberCall('window', 'setInterval'))
      visitor.CallExpression(createMemberCall('window', 'setImmediate'))

      expect(reports.length).toBe(4)
    })

    test('should report execScript alongside eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createMemberCall('window', 'execScript'))

      expect(reports.length).toBe(2)
    })

    test('should not count safe calls in total violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createSafeCall())
      visitor.CallExpression(createMemberCall('Math', 'random'))
      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(2)
    })
  })

  describe('options', () => {
    test('should respect allowIndirect option for member expression eval', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))

      expect(reports.length).toBe(0)
    })

    test('should still report direct eval with allowIndirect', () => {
      const { context, reports } = createMockContext({ allowIndirect: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should respect allowWith option', () => {
      const { context, reports } = createMockContext({ allowWith: true })
      const visitor = noEvalRule.create(context)

      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
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

      expect(() => visitor.CallExpression(createEvalCall())).not.toThrow()
    })

    test('should allow both allowIndirect and allowWith simultaneously', () => {
      const { context, reports } = createMockContext({ allowIndirect: true, allowWith: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall('window'))
      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(0)
    })

    test('should still report direct eval with both options true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true, allowWith: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())

      expect(reports.length).toBe(1)
    })

    test('should still report Function constructor with both options true', () => {
      const { context, reports } = createMockContext({ allowIndirect: true, allowWith: true })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createFunctionCall())

      expect(reports.length).toBe(1)
    })

    test('should report everything with both options false', () => {
      const { context, reports } = createMockContext({ allowIndirect: false, allowWith: false })
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createEvalCall())
      visitor.CallExpression(createMemberEvalCall('window'))
      visitor.WithStatement(createWithStatement())

      expect(reports.length).toBe(3)
    })
  })

  describe('valid code - extended', () => {
    test('should not flag myEval()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('myEval'))

      expect(reports.length).toBe(0)
    })

    test('should not flag safeEval()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('safeEval'))

      expect(reports.length).toBe(0)
    })

    test('should not flag evaluateExpression()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('evaluateExpression'))

      expect(reports.length).toBe(0)
    })

    test('should not flag Eval()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('Eval'))

      expect(reports.length).toBe(0)
    })

    test('should not flag myFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('myFunction'))

      expect(reports.length).toBe(0)
    })

    test('should not flag createFunction()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('createFunction'))

      expect(reports.length).toBe(0)
    })

    test('should not flag functionFactory()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createIdentifierCall('functionFactory'))

      expect(reports.length).toBe(0)
    })

    test('should not flag arr.map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('arr', 'map'))

      expect(reports.length).toBe(0)
    })

    test('should not flag arr.filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('arr', 'filter'))

      expect(reports.length).toBe(0)
    })

    test('should not flag arr.reduce()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('arr', 'reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not flag arr.forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('arr', 'forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not flag obj.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'toString'))

      expect(reports.length).toBe(0)
    })

    test('should not flag obj.valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not flag obj.hasOwnProperty()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('obj', 'hasOwnProperty'))

      expect(reports.length).toBe(0)
    })

    test('should not flag str.split()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('str', 'split'))

      expect(reports.length).toBe(0)
    })

    test('should not flag str.replace()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('str', 'replace'))

      expect(reports.length).toBe(0)
    })

    test('should not flag str.trim()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('str', 'trim'))

      expect(reports.length).toBe(0)
    })

    test('should not flag num.toFixed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('num', 'toFixed'))

      expect(reports.length).toBe(0)
    })

    test('should not flag num.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('num', 'toString'))

      expect(reports.length).toBe(0)
    })

    test('should not flag promise.then()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('promise', 'then'))

      expect(reports.length).toBe(0)
    })

    test('should not flag promise.catch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('promise', 'catch'))

      expect(reports.length).toBe(0)
    })

    test('should not flag observable.subscribe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('observable', 'subscribe'))

      expect(reports.length).toBe(0)
    })

    test('should not flag emitter.on()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('emitter', 'on'))

      expect(reports.length).toBe(0)
    })

    test('should not flag emitter.emit()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('emitter', 'emit'))

      expect(reports.length).toBe(0)
    })

    test('should not flag store.dispatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('store', 'dispatch'))

      expect(reports.length).toBe(0)
    })

    test('should not flag store.getState()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('store', 'getState'))

      expect(reports.length).toBe(0)
    })

    test('should not flag react.createElement()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('React', 'createElement'))

      expect(reports.length).toBe(0)
    })

    test('should not flag axios.get()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('axios', 'get'))

      expect(reports.length).toBe(0)
    })

    test('should not flag lodash.filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('_', 'filter'))

      expect(reports.length).toBe(0)
    })

    test('should not flag moment.format()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('moment', 'format'))

      expect(reports.length).toBe(0)
    })

    test('should not flag jquery.css()', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberCall('$', 'css'))

      expect(reports.length).toBe(0)
    })
  })
})
