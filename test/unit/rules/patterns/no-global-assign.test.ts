import { describe, test, expect, vi } from 'vitest'
import { noGlobalAssignRule } from '../../../../src/rules/patterns/no-global-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createAssignmentExpression(leftName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: leftName,
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberAssignment(line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object',
      },
      property: {
        type: 'Identifier',
        name: 'prop',
      },
      computed: false,
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-global-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noGlobalAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noGlobalAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noGlobalAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noGlobalAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noGlobalAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noGlobalAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention global in description', () => {
      expect(noGlobalAssignRule.meta.docs?.description.toLowerCase()).toContain('global')
    })

    test('should mention read-only in description', () => {
      expect(noGlobalAssignRule.meta.docs?.description.toLowerCase()).toContain('read-only')
    })

    test('should have type as string', () => {
      expect(typeof noGlobalAssignRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noGlobalAssignRule.meta.severity).toBe('string')
    })

    test('should have docs object defined', () => {
      expect(noGlobalAssignRule.meta.docs).toBeDefined()
      expect(typeof noGlobalAssignRule.meta.docs).toBe('object')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noGlobalAssignRule.meta.docs?.description).toBe('string')
      expect(noGlobalAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have recommended as boolean true', () => {
      expect(noGlobalAssignRule.meta.docs?.recommended).toBe(true)
      expect(typeof noGlobalAssignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noGlobalAssignRule.meta.docs?.category).toBe('string')
    })

    test('should have meta type property', () => {
      expect(noGlobalAssignRule.meta).toHaveProperty('type')
    })

    test('should have meta severity property', () => {
      expect(noGlobalAssignRule.meta).toHaveProperty('severity')
    })

    test('should have meta docs property', () => {
      expect(noGlobalAssignRule.meta).toHaveProperty('docs')
    })

    test('should have meta schema property', () => {
      expect(noGlobalAssignRule.meta).toHaveProperty('schema')
    })

    test('should have meta fixable property', () => {
      expect(noGlobalAssignRule.meta).toHaveProperty('fixable')
    })

    test('should mention native objects in description', () => {
      expect(noGlobalAssignRule.meta.docs?.description.toLowerCase()).toContain('native')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor1 = noGlobalAssignRule.create(context)
      const visitor2 = noGlobalAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should have AssignmentExpression as only visitor key', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)
      expect(Object.keys(visitor)).toEqual(['AssignmentExpression'])
    })

    test('should produce independent visitors with separate report tracking', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'Object = {};' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'Object = {};' })
      const visitor1 = noGlobalAssignRule.create(ctx1)
      const visitor2 = noGlobalAssignRule.create(ctx2)

      visitor1.AssignmentExpression(createAssignmentExpression('Object'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should accept context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      expect(reports.length).toBe(1)
    })

    test('should accept context with empty source', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      expect(reports.length).toBe(1)
    })

    test('should work with context that has empty options array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.config.options).toEqual([])
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      expect(reports.length).toBe(1)
    })
  })

  describe('reporting read-only global assignments', () => {
    test('should report assignment to undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('undefined'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
      expect(reports[0].message).toContain('Read-only global')
    })

    test('should report assignment to NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('NaN'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
    })

    test('should report assignment to Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Infinity'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Infinity')
    })

    test('should report assignment to Object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object')
    })

    test('should report assignment to Function', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Function'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should report assignment to Array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Array'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Array')
    })

    test('should report assignment to String', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('String'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('String')
    })

    test('should report assignment to Number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Number'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should report assignment to Boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Boolean'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Boolean')
    })

    test('should report assignment to Math', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
    })

    test('should report assignment to Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Date')
    })

    test('should report assignment to RegExp', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('RegExp'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })

    test('should report assignment to JSON', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('JSON'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JSON')
    })

    test('should report assignment to Promise', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Promise'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report assignment to Map', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Map'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Map')
    })

    test('should report assignment to Set', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Set'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Set')
    })

    test('should report assignment to globalThis', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('globalThis'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('globalThis')
    })

    test('should report assignment to console', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('console'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console')
    })

    test('should report assignment to window', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('window'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('window')
    })

    test('should report assignment to Symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Symbol'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Symbol')
    })

    test('should report assignment to BigInt', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('BigInt'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('BigInt')
    })

    test('should report assignment to Reflect', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Reflect'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reflect')
    })

    test('should report assignment to Proxy', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Proxy'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Proxy')
    })

    test('should report assignment to Error', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Error')
    })

    test('should report assignment to WeakMap', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('WeakMap'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('WeakMap')
    })

    test('should report assignment to WeakSet', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('WeakSet'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('WeakSet')
    })

    test('should report assignment to AggregateError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('AggregateError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AggregateError')
    })

    test('should report assignment to EvalError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('EvalError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('EvalError')
    })

    test('should report assignment to RangeError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('RangeError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RangeError')
    })

    test('should report assignment to ReferenceError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('ReferenceError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('ReferenceError')
    })

    test('should report assignment to SyntaxError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('SyntaxError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('SyntaxError')
    })

    test('should report assignment to TypeError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('TypeError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TypeError')
    })

    test('should report assignment to URIError', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('URIError'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('URIError')
    })

    test('should report assignment to document', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('document'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('document')
    })

    test('should report assignment to navigator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('navigator'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('navigator')
    })

    test('should report assignment to Intl', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Intl'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Intl')
    })

    test('should report assignment to WebAssembly', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('WebAssembly'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('WebAssembly')
    })

    test('should report assignment to Atomics', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Atomics'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Atomics')
    })

    test('should report assignment to SharedArrayBuffer', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('SharedArrayBuffer'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('SharedArrayBuffer')
    })

    test('should report correct location for global assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Array'))

      expect(reports[0].message).toBe("Read-only global 'Array' should not be modified.")
    })
  })

  describe('not reporting non-global assignments', () => {
    test('should not report assignment to local variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myLocalVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to custom variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('customObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to property of global', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createMemberAssignment())

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable with underscore prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('_myVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable with dollar sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('$myVar'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to camelCase variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myCustomObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to PascalCase variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('MyCustomClass'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowercased object (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('object'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowercased array (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('array'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowercased math (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('math'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowercased json (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('json'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowercased promise (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('promise'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to uppercased console (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('CONSOLE'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to uppercased window (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('WINDOW'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to name with global as prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('ObjectExtra'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to name with global as suffix', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myObject'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to name containing global substring', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('SetTimeout'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to single character variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('x'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to two character variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('fn'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to SCREAMING_SNAKE_CASE non-global', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('MY_CONSTANT'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to config variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('config'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to result variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('result'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to data variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('data'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to obj variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('obj'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to err variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('err'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named items', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('items'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named index', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('index'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named value', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('value'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named key', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('key'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named count', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('count'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to variable named total', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('total'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment without left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle left side that is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: '' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report multiple global assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('String'))

      expect(reports.length).toBe(3)
    })

    test('should handle number as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      expect(() => visitor.AssignmentExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle left side as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 42,
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle left side as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 'someString',
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle left side as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: [{ type: 'Identifier', name: 'a' }],
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle left side with undefined type but valid name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: undefined, name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      // isIdentifier checks typeof n.name === 'string' which is true
      expect(reports.length).toBe(1)
    })

    test('should handle left side with numeric type but valid name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 123, name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      // isIdentifier checks typeof n.name === 'string' which is true
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty object as left', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {},
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle UpdateExpression node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'Object' },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with left name as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 42 },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with left name as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: true },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with left name as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: null },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with left name as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: { value: 'Object' } },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for global assignment at line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 999, 0))

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report correct location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report correct end column with offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Array', 5, 20))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should include location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('JSON', 3, 4))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location for different globals at different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 1, 0))
      visitor.AssignmentExpression(createAssignmentExpression('Array', 5, 10))
      visitor.AssignmentExpression(createAssignmentExpression('Map', 20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
      expect(reports[2].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.column).toBe(3)
    })

    test('should handle location with zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at line 1 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Date', 1, 50))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
      expect(reports[0].loc?.end.column).toBe(60)
    })

    test('should handle location at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Error', 100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
      }

      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'Array' },
        right: { type: 'Literal', value: 1 },
        loc: null,
      }

      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'Object' },
        right: { type: 'Literal', value: 1 },
        loc: {
          start: { line: 7, column: 3 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle location with numeric string line', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math', 42, 8))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should preserve exact start and end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('console', 15, 7))

      expect(reports[0].loc?.start).toEqual({ line: 15, column: 7 })
      expect(reports[0].loc?.end).toEqual({ line: 15, column: 17 })
    })
  })

  describe('message quality', () => {
    test('should include Read-only global in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports[0].message).toContain('Read-only global')
    })

    test('should include global name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math'))

      expect(reports[0].message).toContain('Math')
    })

    test('should include should not be modified in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Date'))

      expect(reports[0].message).toContain('should not be modified')
    })

    test('should have exact message for Object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports[0].message).toBe("Read-only global 'Object' should not be modified.")
    })

    test('should have exact message for undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('undefined'))

      expect(reports[0].message).toBe("Read-only global 'undefined' should not be modified.")
    })

    test('should have exact message for NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('NaN'))

      expect(reports[0].message).toBe("Read-only global 'NaN' should not be modified.")
    })

    test('should have exact message for Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Infinity'))

      expect(reports[0].message).toBe("Read-only global 'Infinity' should not be modified.")
    })

    test('should have exact message for globalThis', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('globalThis'))

      expect(reports[0].message).toBe("Read-only global 'globalThis' should not be modified.")
    })

    test('should have exact message for console', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('console'))

      expect(reports[0].message).toBe("Read-only global 'console' should not be modified.")
    })

    test('should wrap global name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('JSON'))

      expect(reports[0].message).toContain("'JSON'")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Promise'))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have consistent message format across globals', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('Map'))

      reports.forEach((report) => {
        expect(report.message).toMatch(/^Read-only global '.+' should not be modified\.$/)
      })
    })
  })

  describe('multiple reports', () => {
    test('should report multiple global assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('String'))

      expect(reports.length).toBe(3)
    })

    test('should report same global assigned multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(reports.length).toBe(2)
    })

    test('should report all error types in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Error'))
      visitor.AssignmentExpression(createAssignmentExpression('EvalError'))
      visitor.AssignmentExpression(createAssignmentExpression('RangeError'))
      visitor.AssignmentExpression(createAssignmentExpression('ReferenceError'))
      visitor.AssignmentExpression(createAssignmentExpression('SyntaxError'))
      visitor.AssignmentExpression(createAssignmentExpression('TypeError'))
      visitor.AssignmentExpression(createAssignmentExpression('URIError'))

      expect(reports.length).toBe(7)
    })

    test('should report mixed globals and ignore non-globals', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('myVar'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('customObj'))
      visitor.AssignmentExpression(createAssignmentExpression('JSON'))

      expect(reports.length).toBe(3)
    })

    test('should track reports in order', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      visitor.AssignmentExpression(createAssignmentExpression('Map'))

      expect(reports[0].message).toContain('Object')
      expect(reports[1].message).toContain('Array')
      expect(reports[2].message).toContain('Map')
    })

    test('should report each of 10 globals independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const globals = [
        'Object',
        'Array',
        'String',
        'Number',
        'Boolean',
        'Symbol',
        'BigInt',
        'Math',
        'Date',
        'RegExp',
      ]
      globals.forEach((g) => visitor.AssignmentExpression(createAssignmentExpression(g)))

      expect(reports.length).toBe(10)
    })

    test('should handle alternating valid and invalid assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.AssignmentExpression(createAssignmentExpression('Object'))
        } else {
          visitor.AssignmentExpression(createAssignmentExpression('localVar'))
        }
      }

      expect(reports.length).toBe(10)
    })

    test('should report all 40 known globals', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      const allGlobals = [
        'undefined',
        'NaN',
        'Infinity',
        'Object',
        'Function',
        'Boolean',
        'Symbol',
        'Number',
        'BigInt',
        'Math',
        'Date',
        'String',
        'RegExp',
        'Array',
        'Map',
        'Set',
        'WeakMap',
        'WeakSet',
        'JSON',
        'Promise',
        'Reflect',
        'Proxy',
        'Error',
        'AggregateError',
        'EvalError',
        'RangeError',
        'ReferenceError',
        'SyntaxError',
        'TypeError',
        'URIError',
        'globalThis',
        'console',
        'window',
        'document',
        'navigator',
        'Intl',
        'WebAssembly',
        'Atomics',
        'SharedArrayBuffer',
      ]

      allGlobals.forEach((g) => visitor.AssignmentExpression(createAssignmentExpression(g)))

      expect(reports.length).toBe(allGlobals.length)
    })

    test('should handle rapid repeated calls without issues', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(createAssignmentExpression('Object'))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle single global followed by non-global', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Math'))
      visitor.AssignmentExpression(createAssignmentExpression('myMath'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math')
    })
  })

  describe('context variations', () => {
    test('should work with context returning empty tokens', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.getTokens()).toEqual([])
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      expect(reports.length).toBe(1)
    })

    test('should work with context returning empty comments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.getComments()).toEqual([])
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      expect(reports.length).toBe(1)
    })

    test('should work with context returning null AST', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.getAST()).toBeNull()
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('JSON'))
      expect(reports.length).toBe(1)
    })

    test('should work with logger functions available', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.logger.debug).toBeDefined()
      expect(context.logger.info).toBeDefined()
      expect(context.logger.warn).toBeDefined()
      expect(context.logger.error).toBeDefined()
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Promise'))
      expect(reports.length).toBe(1)
    })

    test('should work with config options array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.config.options).toEqual([])
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Symbol'))
      expect(reports.length).toBe(1)
    })

    test('should work with workspace root set', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      expect(context.workspaceRoot).toBe('/src')
      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Error'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code strings', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Array = [];',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Array'))
      expect(reports.length).toBe(1)
    })

    test('should work with context having additional config properties', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/extra.ts',
        getAST: () => ({ type: 'Program' }),
        getSource: () => 'console.log("test")',
        getTokens: () => [{ type: 'Identifier', value: 'console' }],
        getComments: () => [],
        config: { options: [{ strict: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noGlobalAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('Object'))
      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('Object'))

      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
      expect(reports.length).toBe(1)
    })

    test('should not call logger for non-global assignment', () => {
      const { context } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('myVar'))

      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })
  })

  describe('test.each - all known globals report', () => {
    test.each([
      ['undefined'],
      ['NaN'],
      ['Infinity'],
      ['Object'],
      ['Function'],
      ['Boolean'],
      ['Symbol'],
      ['Number'],
      ['BigInt'],
      ['Math'],
      ['Date'],
      ['String'],
      ['RegExp'],
      ['Array'],
      ['Map'],
      ['Set'],
      ['WeakMap'],
      ['WeakSet'],
      ['JSON'],
      ['Promise'],
      ['Reflect'],
      ['Proxy'],
      ['Error'],
      ['AggregateError'],
      ['EvalError'],
      ['RangeError'],
      ['ReferenceError'],
      ['SyntaxError'],
      ['TypeError'],
      ['URIError'],
      ['globalThis'],
      ['console'],
      ['window'],
      ['document'],
      ['navigator'],
      ['Intl'],
      ['WebAssembly'],
      ['Atomics'],
      ['SharedArrayBuffer'],
    ])('should report assignment to %s via test.each', (globalName) => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(globalName))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(globalName)
      expect(reports[0].message).toContain('Read-only global')
    })
  })

  describe('test.each - non-globals do not report', () => {
    test.each([
      ['myVar'],
      ['customObject'],
      ['_private'],
      ['$jquery'],
      ['foo'],
      ['bar'],
      ['baz'],
      ['temp'],
      ['result'],
      ['data'],
      ['config'],
      ['options'],
      ['settings'],
      ['utils'],
      ['helpers'],
      ['obj'],
      ['arr'],
      ['str'],
      ['num'],
      ['val'],
    ])('should not report assignment to %s via test.each', (varName) => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(varName))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - case sensitivity', () => {
    test.each([
      ['object'],
      ['array'],
      ['string'],
      ['number'],
      ['boolean'],
      ['math'],
      ['date'],
      ['json'],
      ['promise'],
      ['map'],
      ['set'],
      ['weakmap'],
      ['weakset'],
      ['regexp'],
      ['symbol'],
      ['bigint'],
      ['reflect'],
      ['proxy'],
      ['error'],
    ])('should not report assignment to lowercased %s (case-sensitive)', (globalName) => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(globalName))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - exact message format', () => {
    test.each([
      ['Object', "Read-only global 'Object' should not be modified."],
      ['Array', "Read-only global 'Array' should not be modified."],
      ['undefined', "Read-only global 'undefined' should not be modified."],
      ['NaN', "Read-only global 'NaN' should not be modified."],
      ['Infinity', "Read-only global 'Infinity' should not be modified."],
      ['globalThis', "Read-only global 'globalThis' should not be modified."],
      ['console', "Read-only global 'console' should not be modified."],
      ['window', "Read-only global 'window' should not be modified."],
      ['JSON', "Read-only global 'JSON' should not be modified."],
      ['Promise', "Read-only global 'Promise' should not be modified."],
    ])('should have exact message for %s', (globalName, expectedMessage) => {
      const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
      const visitor = noGlobalAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(globalName))

      expect(reports[0].message).toBe(expectedMessage)
    })
  })

  describe('test.each - location at various positions', () => {
    test.each([
      ['Object', 1, 0],
      ['Array', 5, 10],
      ['Math', 100, 50],
      ['JSON', 42, 7],
      ['Date', 999, 0],
      ['Error', 1, 100],
      ['console', 50, 25],
      ['window', 10, 3],
      ['Promise', 200, 80],
      ['Map', 3, 1],
    ] as const)(
      'should report correct location for %s at line %s column %s',
      (globalName, line, column) => {
        const { context, reports } = createMockRuleContext({ source: 'Object = {};' })
        const visitor = noGlobalAssignRule.create(context)

        visitor.AssignmentExpression(createAssignmentExpression(globalName, line, column))

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })
})
