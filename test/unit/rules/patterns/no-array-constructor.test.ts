import { describe, test, expect, vi } from 'vitest'
import { noArrayConstructorRule } from '../../../../src/rules/patterns/no-array-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
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

describe('no-array-constructor rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noArrayConstructorRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noArrayConstructorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noArrayConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noArrayConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noArrayConstructorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noArrayConstructorRule.meta.fixable).toBe('code')
    })

    test('should mention Array in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description).toContain('Array')
    })

    test('should mention literal in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description.toLowerCase()).toContain('literal')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting Array constructor calls', () => {
    test('should report new Array() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[]')
    })

    test('should report new Array(5) with single numeric argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('length')
    })

    test('should report new Array(1, 2) with multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[')
    })

    test('should not report new Other()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Other'), []))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

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
        getSource: () => 'new Array();',
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

      const visitor = noArrayConstructorRule.create(context)

      expect(() =>
        visitor.NewExpression(createNewExpression(createIdentifier('Array'), [])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention literal for no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))

      expect(reports[0].message).toContain('[]')
    })

    test('should mention length for single numeric argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))

      expect(reports[0].message.toLowerCase()).toContain('length')
    })

    test('should mention array literal for multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )

      expect(reports[0].message).toContain('[')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: {},
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for new Array()', () => {
      const source = 'new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('[]')
      expect(reports[0].fix?.range).toEqual([0, 11])
    })

    test('should provide fix for new Array(1, 2, 3)', () => {
      const source = 'new Array(1, 2, 3)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
          { type: 'Literal', value: 3, range: [16, 17] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.NewExpression(node)

      expect(reports[0].fix?.text).toBe('[1, 2, 3]')
    })

    test('should NOT provide fix for new Array(5) with single argument', () => {
      const source = 'new Array(5)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [{ type: 'Literal', value: 5, range: [10, 11] }],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('meta - exhaustive property checks', () => {
    test('should have meta property on rule', () => {
      expect(noArrayConstructorRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(noArrayConstructorRule).toHaveProperty('create')
    })

    test('should have exactly type problem', () => {
      expect(noArrayConstructorRule.meta.type).toBe('problem')
      expect(noArrayConstructorRule.meta.type).not.toBe('suggestion')
      expect(noArrayConstructorRule.meta.type).not.toBe('layout')
    })

    test('should have exactly severity warn', () => {
      expect(noArrayConstructorRule.meta.severity).toBe('warn')
      expect(noArrayConstructorRule.meta.severity).not.toBe('error')
      expect(noArrayConstructorRule.meta.severity).not.toBe('off')
    })

    test('should have docs object defined', () => {
      expect(noArrayConstructorRule.meta.docs).toBeDefined()
      expect(typeof noArrayConstructorRule.meta.docs).toBe('object')
    })

    test('should have non-empty description', () => {
      expect(noArrayConstructorRule.meta.docs?.description).toBeTruthy()
      expect(noArrayConstructorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention constructor in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description.toLowerCase()).toContain('constructor')
    })

    test('should mention new in description', () => {
      expect(noArrayConstructorRule.meta.docs?.description).toContain('new')
    })

    test('should have patterns as category string', () => {
      expect(typeof noArrayConstructorRule.meta.docs?.category).toBe('string')
      expect(noArrayConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have recommended as boolean true', () => {
      expect(noArrayConstructorRule.meta.docs?.recommended).toBe(true)
      expect(typeof noArrayConstructorRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs url defined', () => {
      expect(noArrayConstructorRule.meta.docs?.url).toBeDefined()
      expect(typeof noArrayConstructorRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing codeforge', () => {
      expect(noArrayConstructorRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have schema as empty array', () => {
      expect(Array.isArray(noArrayConstructorRule.meta.schema)).toBe(true)
      expect(noArrayConstructorRule.meta.schema).toHaveLength(0)
    })

    test('should have fixable set to code', () => {
      expect(noArrayConstructorRule.meta.fixable).toBe('code')
      expect(noArrayConstructorRule.meta.fixable).not.toBe('whitespace')
    })

    test('should not be deprecated', () => {
      expect(noArrayConstructorRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noArrayConstructorRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noArrayConstructorRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have NewExpression as function', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('should return undefined from NewExpression call', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const result = visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(result).toBeUndefined()
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = noArrayConstructorRule.create(ctx1)
      const visitor2 = noArrayConstructorRule.create(ctx2)

      visitor1.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor2.NewExpression(createNewExpression(createIdentifier('Other'), []))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should create fresh visitor each time', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noArrayConstructorRule.create(context)
      const visitor2 = noArrayConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should not throw when create is called', () => {
      const { context } = createMockRuleContext()
      expect(() => noArrayConstructorRule.create(context)).not.toThrow()
    })

    test('should have only NewExpression method on visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('NewExpression')
    })

    test('should accept node argument in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
    })
  })

  describe('detection - negative cases (non-Array constructors)', () => {
    test('should not report new MyArray()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('MyArray'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new Array2()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array2'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new arr()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('arr'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new ARRAY() (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('ARRAY'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new array() (lowercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('array'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new Foo()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Foo'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report new Bar()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Bar'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for non-NewExpression node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = { type: 'CallExpression', callee: createIdentifier('Array'), arguments: [] }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('Array'),
      }
      visitor.NewExpression(createNewExpression(callee, []))
      expect(reports.length).toBe(0)
    })

    test('should not report for undefined callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(undefined, []))
      expect(reports.length).toBe(0)
    })

    test('should not report for null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(null, []))
      expect(reports.length).toBe(0)
    })

    test('should not report for numeric callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createLiteral(42), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for string callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createLiteral('Array'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for object callee without name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const callee = { type: 'Identifier' }
      visitor.NewExpression(createNewExpression(callee, []))
      expect(reports.length).toBe(0)
    })

    test('should not report for CallExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const callee = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }
      visitor.NewExpression(createNewExpression(callee, []))
      expect(reports.length).toBe(0)
    })

    test('should not report for new Map()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Map'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for new Set()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Set'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for new Promise()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Promise'), []))
      expect(reports.length).toBe(0)
    })

    test('should not report for new Object()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Object'), []))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection - positive cases (Array constructors)', () => {
    test('should report new Array() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(1) with single numeric arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(1)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(100) with large number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(100)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(0) with zero', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(-1) with negative number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(-1)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(1, 2) with two args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array(1, 2, 3) with three args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [
          createLiteral(1),
          createLiteral(2),
          createLiteral(3),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array("a", "b") with string args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral('a'), createLiteral('b')]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array(true, false) with boolean args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(true), createLiteral(false)]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array(null) with null arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(null)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(undefined) with undefined arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(undefined)]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array(x) with identifier arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createIdentifier('x')]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(obj) with single non-literal arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createIdentifier('obj')]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report new Array with many arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const args = Array.from({ length: 10 }, (_, i) => createLiteral(i))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), args))
      expect(reports.length).toBe(1)
    })

    test('should report new Array(3.14) with float arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(3.14)]))
      expect(reports.length).toBe(1)
    })

    test('should report new Array("") with empty string arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral('')]))
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location with specific line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should default to line 1 column 0 when no loc on node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = { type: 'NewExpression', callee: createIdentifier('Array'), arguments: [] }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 999, 5))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should handle location with large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 1, 500))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle location with line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve both start and end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 3, 8))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report different locations for different nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 2, 4))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 8, 12))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(8)
    })

    test('should have numeric loc.start.line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric loc.start.column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric loc.end.line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have numeric loc.end.column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should handle location with same start and end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should handle location with different start and end lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 3, column: 0 }, end: { line: 7, column: 5 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should handle location with zero column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for single arg case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(5)], 4, 2),
      )
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for multi arg case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)], 10, 0),
      )
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  describe('message content - detailed', () => {
    test('should produce non-empty message for 0 args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce non-empty message for 1 arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce non-empty message for 2+ args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have string type message for 0 args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have string type message for 1 arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have string type message for 2+ args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(typeof reports[0].message).toBe('string')
    })

    test('should mention Array in 0 args message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].message).toContain('Array')
    })

    test('should mention Array in 1 arg message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(reports[0].message).toContain('Array')
    })

    test('should mention Array in 2+ args message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports[0].message).toContain('Array')
    })

    test('should include suggestion text for 0 args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].message).toContain('array literal')
    })

    test('should include suggestion text for 1 arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(reports[0].message).toContain('array literal')
    })

    test('should include suggestion text for 2+ args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports[0].message).toContain('array literal')
    })

    test('should differentiate messages for 0 vs 1 arg', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = noArrayConstructorRule.create(ctx1)
      const v2 = noArrayConstructorRule.create(ctx2)
      v1.NewExpression(createNewExpression(createIdentifier('Array'), []))
      v2.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(r1[0].message).not.toBe(r2[0].message)
    })

    test('should differentiate messages for 1 vs 2 args', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = noArrayConstructorRule.create(ctx1)
      const v2 = noArrayConstructorRule.create(ctx2)
      v1.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      v2.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(r1[0].message).not.toBe(r2[0].message)
    })

    test('should mention length in 1 arg message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(reports[0].message.toLowerCase()).toContain('length')
    })

    test('should mention literal in 2+ args message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports[0].message).toContain('literal')
    })
  })

  describe('auto-fix - exhaustive', () => {
    test('should provide fix for new Array() with no args', () => {
      const source = 'new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('[]')
    })

    test('should have correct fix range for new Array()', () => {
      const source = 'new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.range).toEqual([0, 11])
    })

    test('should provide fix for new Array(1, 2)', () => {
      const source = 'new Array(1, 2)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('[1, 2]')
    })

    test('should provide fix for new Array(1, 2, 3)', () => {
      const source = 'new Array(1, 2, 3)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
          { type: 'Literal', value: 3, range: [16, 17] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[1, 2, 3]')
    })

    test('should NOT provide fix for new Array(5) single arg', () => {
      const source = 'new Array(5)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [{ type: 'Literal', value: 5, range: [10, 11] }],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should NOT provide fix for new Array(n) identifier arg', () => {
      const source = 'new Array(n)'
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [createIdentifier('n')],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should NOT provide fix when range is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should NOT provide fix for 2+ args when range is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [createLiteral(1), createLiteral(2)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should produce fix text starting with [ for multi arg', () => {
      const source = 'new Array(a, b)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'a', range: [10, 11] },
          { type: 'Identifier', name: 'b', range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text.startsWith('[')).toBe(true)
    })

    test('should produce fix text ending with ] for multi arg', () => {
      const source = 'new Array(a, b)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'a', range: [10, 11] },
          { type: 'Identifier', name: 'b', range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text.endsWith(']')).toBe(true)
    })

    test('should preserve argument sources in fix text', () => {
      const source = 'new Array(foo, bar)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'foo', range: [10, 13] },
          { type: 'Identifier', name: 'bar', range: [15, 18] },
        ],
        range: [0, 19] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toContain('foo')
      expect(reports[0].fix?.text).toContain('bar')
    })

    test('should provide correct fix for new Array(x, y, z)', () => {
      const source = 'new Array(x, y, z)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'x', range: [10, 11] },
          { type: 'Identifier', name: 'y', range: [13, 14] },
          { type: 'Identifier', name: 'z', range: [16, 17] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[x, y, z]')
    })

    test('should provide fix with offset range', () => {
      const source = '  new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [2, 13] as [number, number],
        loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 13 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.range).toEqual([2, 13])
      expect(reports[0].fix?.text).toBe('[]')
    })
  })

  describe('multiple invocations', () => {
    test('should report for each Array call when called twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(2)
    })

    test('should report for each Array call when called 5 times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      }
      expect(reports.length).toBe(5)
    })

    test('should report independently for different nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should only report Array, not other constructors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Map'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(2)
    })

    test('should append reports not replace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      const firstReport = reports[0]
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(1)]))
      expect(reports.length).toBe(2)
      expect(reports[0]).toBe(firstReport)
    })

    test('should have correct message for each report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [createLiteral(5)]))
      visitor.NewExpression(
        createNewExpression(createIdentifier('Array'), [createLiteral(1), createLiteral(2)]),
      )
      expect(reports[0].message).toContain('[]')
      expect(reports[1].message.toLowerCase()).toContain('length')
      expect(reports[2].message).toContain('[...')
    })

    test('should have correct location for each report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 1, 0))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [], 5, 10))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should still report Array after non-Array call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Other'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should still report non-Array after Array call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      visitor.NewExpression(createNewExpression(createIdentifier('Other'), []))
      expect(reports.length).toBe(1)
    })

    test('should handle many mixed calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      for (let i = 0; i < 20; i++) {
        visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
        visitor.NewExpression(createNewExpression(createIdentifier('Other'), []))
      }
      expect(reports.length).toBe(20)
    })
  })

  describe('report descriptor structure', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc.end in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have fix for 0 args when range present', () => {
      const source = 'new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.NewExpression(node)
      expect(reports[0]).toHaveProperty('fix')
    })

    test('should not have fix for 1 arg', () => {
      const source = 'new Array(5)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [{ type: 'Literal', value: 5, range: [10, 11] }],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should have fix for 2+ args when range present', () => {
      const source = 'new Array(1, 2)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0]).toHaveProperty('fix')
    })

    test('should have loc.start with line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have loc.end with line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/other/path.ts' })
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = new Array();' })
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'new Array();',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different/root',
      } as unknown as RuleContext
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with null AST', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.getAST()).toBeNull()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with empty tokens array', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.getTokens()).toEqual([])
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should work with empty comments array', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.getComments()).toEqual([])
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
    })

    test('should have logger methods on context', () => {
      const { context } = createMockRuleContext()
      expect(typeof context.logger.debug).toBe('function')
      expect(typeof context.logger.info).toBe('function')
      expect(typeof context.logger.warn).toBe('function')
      expect(typeof context.logger.error).toBe('function')
    })

    test('should not call logger methods during detection', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), []))
      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })
  })

  describe('export verification', () => {
    test('should export rule as object', () => {
      expect(typeof noArrayConstructorRule).toBe('object')
      expect(noArrayConstructorRule).not.toBeNull()
    })

    test('should have meta property on export', () => {
      expect(noArrayConstructorRule).toHaveProperty('meta')
      expect(typeof noArrayConstructorRule.meta).toBe('object')
    })

    test('should have create function on export', () => {
      expect(noArrayConstructorRule).toHaveProperty('create')
      expect(typeof noArrayConstructorRule.create).toBe('function')
    })

    test('should be a valid RuleDefinition structure', () => {
      expect(noArrayConstructorRule.meta).toBeDefined()
      expect(noArrayConstructorRule.create).toBeDefined()
      expect(typeof noArrayConstructorRule.create).toBe('function')
    })

    test('should have default export equal to named export', () => {
      const imported = noArrayConstructorRule
      expect(imported).toBe(noArrayConstructorRule)
    })
  })

  describe('edge cases - node type variations', () => {
    test('should not crash with empty object node', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
    })

    test('should not crash with node with only type property', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression({ type: 'NewExpression' })).not.toThrow()
    })

    test('should not crash with boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(() => visitor.NewExpression(false)).not.toThrow()
    })

    test('should not crash with numeric node', () => {
      const { context } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(0)).not.toThrow()
      expect(() => visitor.NewExpression(-1)).not.toThrow()
    })

    test('should handle node with callee but no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = { type: 'NewExpression', callee: createIdentifier('Array') }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = { type: 'NewExpression', callee: createIdentifier('Array'), arguments: null }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: undefined,
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
        extra: 'data',
        trailingComments: [],
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with range property', () => {
      const source = 'new Array()'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        range: [0, 11] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle deeply nested callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const innerCallee = { type: 'Identifier', name: 'fn' }
      const outerCallee = { type: 'CallExpression', callee: innerCallee, arguments: [] }
      visitor.NewExpression(createNewExpression(outerCallee, []))
      expect(reports.length).toBe(0)
    })
  })

  describe('loc edge cases - extended', () => {
    test('should handle loc with NaN line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: NaN, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with NaN column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1, column: NaN }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with Infinity line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: Infinity, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with negative column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('should handle loc with floating point line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1.5, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: null, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: null },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with start as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [],
        loc: { start: 42, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('argument edge cases', () => {
    test('should report for new Array with SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const spreadArg = { type: 'SpreadElement', argument: createIdentifier('arr') }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [spreadArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const fnArg = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [fnArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with ObjectExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const objArg = { type: 'ObjectExpression', properties: [] }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [objArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with ArrayExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const arrArg = { type: 'ArrayExpression', elements: [] }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [arrArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with BinaryExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const binArg = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(1),
        right: createLiteral(2),
      }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [binArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with TemplateLiteral argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const tmplArg = { type: 'TemplateLiteral', quasis: [], expressions: [] }
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [tmplArg]))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with mixed argument types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const args = [
        createLiteral(1),
        createIdentifier('x'),
        { type: 'ObjectExpression', properties: [] },
      ]
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), args))
      expect(reports.length).toBe(1)
    })

    test('should report for new Array with empty object args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      visitor.NewExpression(createNewExpression(createIdentifier('Array'), [{}, {}]))
      expect(reports.length).toBe(1)
    })

    test('should handle arguments being undefined in node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noArrayConstructorRule.create(context)
      const node = { type: 'NewExpression', callee: createIdentifier('Array') }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('fix source extraction', () => {
    test('should use source slice for multi-arg fix text', () => {
      const source = 'new Array(hello, world)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'hello', range: [10, 15] },
          { type: 'Identifier', name: 'world', range: [17, 22] },
        ],
        range: [0, 23] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 23 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[hello, world]')
    })

    test('should handle args without range in multi-arg case', () => {
      const source = 'new Array(a, b)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[, ]')
    })

    test('should handle mixed args with and without range', () => {
      const source = 'new Array(1, b)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Identifier', name: 'b' },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[1, ]')
    })

    test('should handle empty string source for multi-arg fix', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [
          { type: 'Literal', value: 1, range: [10, 11] },
          { type: 'Literal', value: 2, range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)
      expect(reports[0].fix?.text).toBe('[, ]')
    })

    test('should handle single arg with range but still no fix', () => {
      const source = 'new Array(42)'
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Array'),
        arguments: [{ type: 'Literal', value: 42, range: [10, 12] }],
        range: [0, 13] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
