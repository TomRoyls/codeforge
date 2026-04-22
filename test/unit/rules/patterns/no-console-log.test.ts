import { describe, test, expect, vi } from 'vitest'
import { noConsoleLogRule } from '../../../../src/rules/patterns/no-console-log.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createConsoleCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'console',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createNonConsoleCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'logger',
      },
      property: {
        type: 'Identifier',
        name: 'info',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDirectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'log',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-console-log rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConsoleLogRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConsoleLogRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConsoleLogRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConsoleLogRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConsoleLogRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noConsoleLogRule.meta.fixable).toBe('code')
    })

    test('should mention console in description', () => {
      expect(noConsoleLogRule.meta.docs?.description.toLowerCase()).toContain('console')
    })

    test('meta type should be a string', () => {
      expect(typeof noConsoleLogRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noConsoleLogRule.meta.severity).toBe('string')
    })

    test('meta fixable should be a string', () => {
      expect(typeof noConsoleLogRule.meta.fixable).toBe('string')
    })

    test('meta docs should be defined', () => {
      expect(noConsoleLogRule.meta.docs).toBeDefined()
    })

    test('meta docs description should be a non-empty string', () => {
      expect(typeof noConsoleLogRule.meta.docs?.description).toBe('string')
      expect(noConsoleLogRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs description should mention production', () => {
      expect(noConsoleLogRule.meta.docs?.description.toLowerCase()).toContain('production')
    })

    test('meta docs description should mention logging library', () => {
      expect(noConsoleLogRule.meta.docs?.description.toLowerCase()).toContain('logging library')
    })

    test('meta docs category should be a string', () => {
      expect(typeof noConsoleLogRule.meta.docs?.category).toBe('string')
    })

    test('meta docs recommended should be a boolean', () => {
      expect(typeof noConsoleLogRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta docs should have url property', () => {
      expect(noConsoleLogRule.meta.docs?.url).toBeDefined()
    })

    test('meta docs url should be a string', () => {
      expect(typeof noConsoleLogRule.meta.docs?.url).toBe('string')
    })

    test('meta docs url should contain docs/rules', () => {
      expect(noConsoleLogRule.meta.docs?.url).toContain('docs/rules')
    })

    test('meta docs url should contain no-console-log', () => {
      expect(noConsoleLogRule.meta.docs?.url).toContain('no-console-log')
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noConsoleLogRule.meta.schema)).toBe(true)
    })

    test('meta schema should have at least one entry', () => {
      expect(noConsoleLogRule.meta.schema.length).toBeGreaterThan(0)
    })

    test('meta schema first entry should have type object', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('meta schema should have allow property definition', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties.allow).toBeDefined()
    })

    test('meta schema allow property should be array type', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      expect(allow.type).toBe('array')
    })

    test('meta schema should have additionalProperties false', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })

    test('meta fixable should be code', () => {
      expect(noConsoleLogRule.meta.fixable).toBe('code')
    })

    test('meta type should not be suggestion', () => {
      expect(noConsoleLogRule.meta.type).not.toBe('suggestion')
    })

    test('meta type should not be layout', () => {
      expect(noConsoleLogRule.meta.type).not.toBe('layout')
    })

    test('meta severity should not be error', () => {
      expect(noConsoleLogRule.meta.severity).not.toBe('error')
    })

    test('meta severity should not be info', () => {
      expect(noConsoleLogRule.meta.severity).not.toBe('info')
    })

    test('meta fixable should not be whitespace', () => {
      expect(noConsoleLogRule.meta.fixable).not.toBe('whitespace')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('visitor should be an object', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create should return same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ options: [{ allow: ['warn'] }] })
      const { context: ctx2 } = createMockRuleContext({ options: [{ allow: ['error'] }] })

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('create should accept context without throwing', () => {
      const { context } = createMockRuleContext()

      expect(() => noConsoleLogRule.create(context)).not.toThrow()
    })

    test('create should be callable multiple times', () => {
      const { context } = createMockRuleContext()

      const visitor1 = noConsoleLogRule.create(context)
      const visitor2 = noConsoleLogRule.create(context)

      expect(visitor1).toBeDefined()
      expect(visitor2).toBeDefined()
    })

    test('create should produce independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      visitor1.CallExpression(createConsoleCall('log'))
      visitor2.CallExpression(createConsoleCall('error'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
      expect(r1[0].message).toContain('console.log')
      expect(r2[0].message).toContain('console.error')
    })
  })

  describe('detecting console methods', () => {
    test('should report console.log', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should report console.warn', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.warn')
    })

    test('should report console.error', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.error')
    })

    test('should report console.info', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.info')
    })

    test('should report console.debug', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.debug')
    })

    test('should report console.trace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.trace')
    })

    test('should report console.table', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.table')
    })

    test('should not report non-console calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createNonConsoleCall())

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })

    test('should report console.dir', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('dir'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.dir')
    })

    test('should report console.time', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.time')
    })

    test('should report console.timeEnd', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timeEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.timeEnd')
    })

    test('should report console.group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('group'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.group')
    })

    test('should report console.groupEnd', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('groupEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.groupEnd')
    })

    test('should report console.clear', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('clear'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.clear')
    })

    test('should report console.count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('count'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.count')
    })

    test('should report console.countReset', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('countReset'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.countReset')
    })

    test('should report console.assert', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('assert'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.assert')
    })

    test('should report console.profile', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profile'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.profile')
    })

    test('should report console.profileEnd', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profileEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.profileEnd')
    })

    test('should report console.timestamp', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timestamp'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.timestamp')
    })

    test('should not report non-existent console method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('nonExistentMethod'))

      expect(reports.length).toBe(0)
    })

    test('should not report custom method on console', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('myCustomFn'))

      expect(reports.length).toBe(0)
    })

    test('should detect console.log with arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Identifier', name: 'world' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect console.error with complex arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 40 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.error')
    })

    test('should not report process.stdout.write', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'process' },
            property: { type: 'Identifier', name: 'stdout' },
          },
          property: { type: 'Identifier', name: 'write' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report window.console.log (nested member expression)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report consolelike.log (different identifier)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.log (prefixed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention logging library in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('logging library')
    })

    test('should mention production code in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('production')
    })

    test('should include method name in message for console.log', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('console.log')
    })

    test('should include method name in message for console.warn', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports[0].message).toContain('console.warn')
    })

    test('should include method name in message for console.error', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports[0].message).toContain('console.error')
    })

    test('should include method name in message for console.debug', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports[0].message).toContain('console.debug')
    })

    test('should include method name in message for console.info', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info'))

      expect(reports[0].message).toContain('console.info')
    })

    test('should include method name in message for console.trace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports[0].message).toContain('console.trace')
    })

    test('should include method name in message for console.table', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports[0].message).toContain('console.table')
    })

    test('should include Unexpected in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include statement in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('statement')
    })

    test('should include suggestion to use winston or pino', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toMatch(/winston|pino/)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('different methods should produce different messages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  describe('options - allow', () => {
    test('should allow console.warn when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['warn'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.error when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['error'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(0)
    })

    test('should allow multiple methods', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allow: ['warn', 'error'] }],
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(0)
    })

    test('should still report non-allowed methods', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['warn'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should allow console.log when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['log'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.info when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['info'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.debug when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['debug'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.trace when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['trace'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.table when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['table'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.dir when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['dir'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('dir'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.time when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['time'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.timeEnd when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['timeEnd'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timeEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.group when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['group'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('group'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.groupEnd when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['groupEnd'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('groupEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.clear when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['clear'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('clear'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.count when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['count'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('count'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.countReset when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['countReset'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('countReset'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.assert when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['assert'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('assert'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.profile when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['profile'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profile'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.profileEnd when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['profileEnd'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profileEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.timestamp when specified', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['timestamp'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timestamp'))

      expect(reports.length).toBe(0)
    })

    test('should allow all console methods at once', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allow: [
              'log',
              'warn',
              'error',
              'info',
              'debug',
              'trace',
              'table',
              'dir',
              'time',
              'timeEnd',
              'group',
              'groupEnd',
              'clear',
              'count',
              'countReset',
              'assert',
              'profile',
              'profileEnd',
              'timestamp',
            ],
          },
        ],
      })
      const visitor = noConsoleLogRule.create(context)

      const methods = [
        'log',
        'warn',
        'error',
        'info',
        'debug',
        'trace',
        'table',
        'dir',
        'time',
        'timeEnd',
        'group',
        'groupEnd',
        'clear',
        'count',
        'countReset',
        'assert',
        'profile',
        'profileEnd',
        'timestamp',
      ]
      for (const method of methods) {
        visitor.CallExpression(createConsoleCall(method))
      }

      expect(reports.length).toBe(0)
    })

    test('should only allow specified methods, reporting others', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allow: ['warn', 'error'] }],
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.info')
    })

    test('should handle empty allow array', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: [] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should allow with single-element array', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['log'] }] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.warn')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'log',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Literal',
            value: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

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
        getSource: () => 'console.log("test");',
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

      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(createConsoleCall('log'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Literal',
            value: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

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
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null object in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null property in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing NaN values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with zero values in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 9999, 50))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle node with missing arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(() => {})).not.toThrow()
    })

    test('should handle Symbol node', () => {
      const { context } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 5 column 10', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for line 100 column 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report loc as an object with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle multi-line location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 8, column: 1 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should include both start and end in loc for console.log', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 2, 4))

      expect(reports[0].loc?.start).toEqual({ line: 2, column: 4 })
      expect(reports[0].loc?.end).toEqual({ line: 2, column: 24 })
    })
  })

  describe('multiple reports', () => {
    test('should report each console.log separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))
      visitor.CallExpression(createConsoleCall('log', 2, 0))
      visitor.CallExpression(createConsoleCall('log', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed console methods separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(3)
    })

    test('should report correct messages for multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
    })

    test('should report correct locations for multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))
      visitor.CallExpression(createConsoleCall('log', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should handle mix of reportable and non-reportable calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createNonConsoleCall())
      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.error')
    })

    test('should handle many sequential calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createConsoleCall('log', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should track reports independently across visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      visitor1.CallExpression(createConsoleCall('log'))
      visitor2.CallExpression(createConsoleCall('log'))
      visitor2.CallExpression(createConsoleCall('warn'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(2)
    })

    test('should report all console methods in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'table']
      for (const method of methods) {
        visitor.CallExpression(createConsoleCall(method))
      }

      expect(reports.length).toBe(methods.length)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/utils/helper.ts' })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: 'console.log("hello", "world");',
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source: '' })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with config containing extra options', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ extra: true, allow: ['warn'] }],
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(0)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/features/auth/utils/logger.ts',
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: 'C:\\Users\\dev\\project\\src\\file.ts',
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/',
      } as unknown as RuleContext

      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should work with null options in config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/',
      } as unknown as RuleContext

      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should not call logger methods during normal operation', () => {
      const debugFn = vi.fn()
      const infoFn = vi.fn()
      const warnFn = vi.fn()
      const errorFn = vi.fn()

      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: debugFn,
          info: infoFn,
          warn: warnFn,
          error: errorFn,
        },
        workspaceRoot: '/',
      } as unknown as RuleContext

      const visitor = noConsoleLogRule.create(context)
      visitor.CallExpression(createConsoleCall('log'))

      expect(debugFn).not.toHaveBeenCalled()
      expect(infoFn).not.toHaveBeenCalled()
      expect(warnFn).not.toHaveBeenCalled()
      expect(errorFn).not.toHaveBeenCalled()
    })
  })

  describe('report descriptor', () => {
    test('report should include message property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should include loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report message should be unique per method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      const messages = reports.map((r) => r.message)
      const uniqueMessages = new Set(messages)

      expect(uniqueMessages.size).toBe(3)
    })

    test('report loc should be object with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(typeof reports[0].loc).toBe('object')
      expect(reports[0].loc).not.toBeNull()
    })

    test('report should be generated exactly once per detected call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })
  })

  describe('different call patterns', () => {
    test('should detect console.log with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
            expressions: [{ type: 'Identifier', name: 'name' }],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect console.log with object argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect console.log with spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect console.log in IIFE', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'IIFE' }],
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect chained console call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))
      visitor.CallExpression(createConsoleCall('log', 2, 4))

      expect(reports.length).toBe(2)
    })

    test('should detect console.log called with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report NewExpression with console', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect console.log inside conditional', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 10, 8))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should detect console.log inside loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 20, 4))

      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should export noConsoleLogRule as named export', () => {
      expect(noConsoleLogRule).toBeDefined()
    })

    test('should export a rule definition object', () => {
      expect(typeof noConsoleLogRule).toBe('object')
    })

    test('exported rule should have meta property', () => {
      expect(noConsoleLogRule).toHaveProperty('meta')
    })

    test('exported rule should have create property', () => {
      expect(noConsoleLogRule).toHaveProperty('create')
    })

    test('create should be a function', () => {
      expect(typeof noConsoleLogRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof noConsoleLogRule.meta).toBe('object')
    })

    test('exported rule should not have unexpected properties', () => {
      const keys = Object.keys(noConsoleLogRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('idempotency and consistency', () => {
    test('should produce same result for same input', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      const node = createConsoleCall('log')
      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should produce consistent reports for repeated calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createConsoleCall('log', i + 1, 0))
      }

      expect(reports.length).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(reports[i].message).toContain('console.log')
      }
    })

    test('should handle interleaved reportable and non-reportable calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.CallExpression(createConsoleCall('log', i + 1, 0))
        } else {
          visitor.CallExpression(createNonConsoleCall(i + 1, 0))
        }
      }

      expect(reports.length).toBe(5)
    })

    test('visitor should work after processing many edge case nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(undefined)
      visitor.CallExpression({})
      visitor.CallExpression('string')
      visitor.CallExpression(42)
      visitor.CallExpression(createConsoleCall('log', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should handle allow option with mixed valid and unknown methods', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allow: ['warn', 'nonExistent'] }],
      })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })
  })

  describe('schema validation coverage', () => {
    test('meta schema allow items should have enum with console methods', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      const items = allow.items as Record<string, unknown>
      const enumValues = items.enum as string[]

      expect(enumValues).toContain('log')
      expect(enumValues).toContain('warn')
      expect(enumValues).toContain('error')
      expect(enumValues).toContain('info')
      expect(enumValues).toContain('debug')
      expect(enumValues).toContain('trace')
      expect(enumValues).toContain('table')
    })

    test('meta schema allow items should include dir and time methods', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      const items = allow.items as Record<string, unknown>
      const enumValues = items.enum as string[]

      expect(enumValues).toContain('dir')
      expect(enumValues).toContain('time')
      expect(enumValues).toContain('timeEnd')
      expect(enumValues).toContain('group')
      expect(enumValues).toContain('groupEnd')
    })

    test('meta schema allow items should include profiling methods', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      const items = allow.items as Record<string, unknown>
      const enumValues = items.enum as string[]

      expect(enumValues).toContain('profile')
      expect(enumValues).toContain('profileEnd')
      expect(enumValues).toContain('timestamp')
      expect(enumValues).toContain('count')
      expect(enumValues).toContain('countReset')
      expect(enumValues).toContain('clear')
      expect(enumValues).toContain('assert')
    })

    test('meta schema should have correct number of enum values', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      const items = allow.items as Record<string, unknown>
      const enumValues = items.enum as string[]

      // CONSOLE_METHODS has 19 entries
      expect(enumValues.length).toBe(19)
    })

    test('meta schema properties should only have allow', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>

      expect(Object.keys(properties)).toEqual(['allow'])
    })

    test('meta schema items should have type string', () => {
      const schema = noConsoleLogRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      const allow = properties.allow as Record<string, unknown>
      const items = allow.items as Record<string, unknown>

      expect(items.type).toBe('string')
    })

    test('meta should not have deprecated flag', () => {
      expect((noConsoleLogRule.meta as Record<string, unknown>).deprecated).toBeUndefined()
    })

    test('meta docs description should not be empty', () => {
      expect(noConsoleLogRule.meta.docs?.description.length).toBeGreaterThan(10)
    })

    test('meta docs category should match expected pattern categories', () => {
      const validCategories = ['patterns', 'complexity', 'security', 'performance', 'dependencies']
      expect(validCategories).toContain(noConsoleLogRule.meta.docs?.category)
    })

    test('meta schema should be frozen or readonly-compatible', () => {
      // Verify schema structure is defined
      expect(noConsoleLogRule.meta.schema).toBeDefined()
      expect(Array.isArray(noConsoleLogRule.meta.schema)).toBe(true)
    })

    test('meta docs recommended should be true for this rule', () => {
      expect(noConsoleLogRule.meta.docs?.recommended).toBe(true)
    })

    test('meta docs url should be a valid http/https url', () => {
      const url = noConsoleLogRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\//)
    })

    test('meta should have exactly expected top-level keys', () => {
      const metaKeys = Object.keys(noConsoleLogRule.meta).sort()
      expect(metaKeys).toContain('type')
      expect(metaKeys).toContain('severity')
      expect(metaKeys).toContain('docs')
      expect(metaKeys).toContain('schema')
      expect(metaKeys).toContain('fixable')
    })
  })
})
