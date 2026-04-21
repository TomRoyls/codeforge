import { describe, test, expect, vi } from 'vitest'
import { preferSpreadRule } from '../../../../src/rules/patterns/prefer-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'fn.apply(null, args);',
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

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
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

function createThisExpression(): unknown {
  return {
    type: 'ThisExpression',
  }
}

describe('prefer-spread rule', () => {
  // =====================================================
  // META TESTS (20 tests)
  // =====================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferSpreadRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferSpreadRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferSpreadRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferSpreadRule.meta.fixable).toBe('code')
    })

    test('should mention spread in description', () => {
      expect(preferSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention apply in description', () => {
      expect(preferSpreadRule.meta.docs?.description).toContain('apply')
    })

    test('should mention concat in description', () => {
      expect(preferSpreadRule.meta.docs?.description).toContain('concat')
    })

    test('should have a docs url', () => {
      expect(preferSpreadRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing rule name', () => {
      expect(preferSpreadRule.meta.docs?.url).toContain('prefer-spread')
    })

    test('should have meta property as object', () => {
      expect(typeof preferSpreadRule.meta).toBe('object')
    })

    test('should have docs property as object', () => {
      expect(typeof preferSpreadRule.meta.docs).toBe('object')
    })

    test('should have description as string', () => {
      expect(typeof preferSpreadRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(preferSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should not be deprecated', () => {
      expect(preferSpreadRule.meta.deprecated).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(preferSpreadRule.meta.schema).toEqual([])
    })

    test('should have fixable set to code', () => {
      expect(preferSpreadRule.meta.fixable).toBe('code')
    })

    test('should not require type checking', () => {
      expect(preferSpreadRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have severity as warn', () => {
      expect(preferSpreadRule.meta.severity).toBe('warn')
    })
  })

  // =====================================================
  // CREATE / VISITOR TESTS (8 tests)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with CallExpression as function', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferSpreadRule.create(context)
      const visitor2 = preferSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept valid context', () => {
      const { context } = createMockContext()
      expect(() => preferSpreadRule.create(context)).not.toThrow()
    })

    test('should return object with exactly CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)
      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should have create as a function', () => {
      expect(typeof preferSpreadRule.create).toBe('function')
    })

    test('should have meta and create properties', () => {
      expect(preferSpreadRule).toHaveProperty('meta')
      expect(preferSpreadRule).toHaveProperty('create')
    })

    test('visitor CallExpression should not throw for valid node', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)
      const node = createCallExpression(createIdentifier('fn'), [createIdentifier('arg')])
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  // =====================================================
  // DETECTION TESTS (30 tests)
  // =====================================================
  describe('detecting .apply() calls', () => {
    test('should report .apply(null, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .apply(this, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createThisExpression(), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.method.apply()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), 'method'),
        'apply',
      )
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 5 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle member expression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'method' },
        computed: true,
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report Math.max.apply(null, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(createIdentifier('Math'), 'max'),
        'apply',
      )
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report foo.bar.baz.apply(null, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const inner = createMemberExpression(createIdentifier('foo'), 'bar')
      const callee = createMemberExpression(createMemberExpression(inner, 'baz'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report getFn().apply(null, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getFn'), [])
      const callee = createMemberExpression(innerCall, 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report fn.apply(this, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createThisExpression(), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report fn.apply(undefined, args)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [
        createIdentifier('undefined'),
        createIdentifier('args'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fn')
    })

    test('should detect apply on chained calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const chain = createCallExpression(
        createMemberExpression(createIdentifier('obj'), 'getFn'),
        [],
      )
      const callee = createMemberExpression(chain, 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect apply with array literal as args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const arrayArg = {
        type: 'ArrayExpression',
        elements: [createIdentifier('a'), createIdentifier('b')],
      }
      const node = createCallExpression(callee, [createLiteral(null), arrayArg])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting .concat() calls', () => {
    test('should report arr.concat()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr.concat(other)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
      expect(reports[0].message).toContain('concat')
    })

    test('should report arr.concat(other, more)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [
        createIdentifier('other'),
        createIdentifier('more'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include array name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('myArray'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('myArray')
    })

    test('should report [].concat(other)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: { type: 'ArrayExpression', elements: [] },
        property: { type: 'Identifier', name: 'concat' },
      }
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should report arr.concat() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('items'), 'concat')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('items')
    })

    test('should report concat on chained call result', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      const callee = createMemberExpression(innerCall, 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should report concat with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report concat with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createLiteral([1, 2, 3])])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // NOT REPORTING TESTS (30 tests)
  // =====================================================
  describe('not reporting', () => {
    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = createCallExpression(createIdentifier('fn'), [createIdentifier('arg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'push')
      const node = createCallExpression(callee, [createIdentifier('item')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with object as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createIdentifier('obj'), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with undefined thisArg in arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [undefined, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with non-null literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(42), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with string literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [
        createLiteral('not-null'),
        createIdentifier('args'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with boolean literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(true), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report map method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'map')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report filter method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'filter')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reduce method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'reduce')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report forEach method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'forEach')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report join method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'join')
      const node = createCallExpression(callee, [createLiteral(',')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report slice method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'slice')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with object expression as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const objExpr = { type: 'ObjectExpression', properties: [] }
      const node = createCallExpression(callee, [objExpr, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with arrow function as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const arrowFn = { type: 'ArrowFunctionExpression', body: createIdentifier('x') }
      const node = createCallExpression(callee, [arrowFn, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report call method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'call')
      const node = createCallExpression(callee, [createThisExpression()])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report bind method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'bind')
      const node = createCallExpression(callee, [createThisExpression()])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report split method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'split')
      const node = createCallExpression(callee, [createLiteral(',')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report toString method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'toString')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'indexOf')
      const node = createCallExpression(callee, [createIdentifier('item')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report find method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'find')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report includes method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'includes')
      const node = createCallExpression(callee, [createIdentifier('item')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with number literal 0 as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(0), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with array expression as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const arrayExpr = { type: 'ArrayExpression', elements: [] }
      const node = createCallExpression(callee, [arrayExpr, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report .apply() with function expression as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const fnExpr = { type: 'FunctionExpression', id: null }
      const node = createCallExpression(callee, [fnExpr, createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report flat method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'flat')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report pop method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'pop')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report shift method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'shift')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (25 tests)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle call with undefined arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: undefined as unknown as unknown[],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle concat with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: { type: 'ArrayExpression', elements: [] },
        property: { type: 'Identifier', name: 'concat' },
      }
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should handle MemberExpression with non-Identifier property type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('fn'),
        property: { type: 'Literal', value: 'apply' },
        computed: false,
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with undefined property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('fn'),
        property: undefined as unknown as { type: string; name: string },
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined as unknown as Record<string, unknown>,
        arguments: [createLiteral(null), createIdentifier('args')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle apply on non-Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getFn'), [])
      const callee = createMemberExpression(innerCall, 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should handle concat on non-Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      const callee = createMemberExpression(innerCall, 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })

    test('should handle apply with null callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'apply' },
      }
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: null as unknown as unknown[],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with boolean node input', () => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle node with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      visitor.CallExpression({ type: 'ExpressionStatement' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'fn',
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle apply with boolean node as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [
        { type: 'BooleanLiteral', value: true },
        createIdentifier('args'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle concat with empty array literal as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: { type: 'ArrayExpression', elements: [] },
        property: { type: 'Identifier', name: 'concat' },
      }
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested apply', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(
        createMemberExpression(createMemberExpression(createIdentifier('a'), 'b'), 'c'),
        'apply',
      )
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle apply with false literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(false), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle apply with empty string literal as thisArg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(''), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // LOCATION TESTS (15 tests)
  // =====================================================
  describe('location', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')], 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
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
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report apply location at specified line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(
        callee,
        [createLiteral(null), createIdentifier('args')],
        42,
        10,
      )

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')], 3, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')], 9999, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')], 1, 500)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle loc with null start.line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: null as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with null start.column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 1, column: null as unknown as number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with NaN line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with Infinity column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('other')],
        loc: {
          start: { line: 1, column: Infinity },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // MESSAGE TESTS (10 tests)
  // =====================================================
  describe('message quality', () => {
    test('should mention spread in apply message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })

    test('should mention spread in concat message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message.toLowerCase()).toContain('spread')
    })

    test('should mention apply in apply message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message).toContain('apply')
    })

    test('should mention concat in concat message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message).toContain('concat')
    })

    test('should include function name in apply message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('myFunc'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message).toContain('myFunc')
    })

    test('should include array name in concat message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('items'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message).toContain('items')
    })

    test('should mention "prefer" in apply message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message.toLowerCase()).toContain('prefer')
    })

    test('should mention "prefer" in concat message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message.toLowerCase()).toContain('prefer')
    })

    test('should use generic "function" for non-Identifier callee in apply', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getFn'), [])
      const callee = createMemberExpression(innerCall, 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports[0].message).toContain('function')
    })

    test('should use generic "array" for non-Identifier callee in concat', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getArray'), [])
      const callee = createMemberExpression(innerCall, 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports[0].message).toContain('array')
    })
  })

  // =====================================================
  // MULTIPLE REPORTS TESTS (10 tests)
  // =====================================================
  describe('multiple reports', () => {
    test('should report separately for two concat calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('a'), 'concat')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('b')]))

      const callee2 = createMemberExpression(createIdentifier('c'), 'concat')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('d')]))

      expect(reports.length).toBe(2)
    })

    test('should report separately for apply then concat', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const applyCallee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(applyCallee, [createLiteral(null), createIdentifier('args')]),
      )

      const concatCallee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee, [createIdentifier('other')]))

      expect(reports.length).toBe(2)
    })

    test('should report separately for concat then apply', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const concatCallee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee, [createIdentifier('other')]))

      const applyCallee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(applyCallee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports.length).toBe(2)
    })

    test('should report same apply pattern multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      for (let i = 0; i < 5; i++) {
        const callee = createMemberExpression(createIdentifier('fn'), 'apply')
        visitor.CallExpression(
          createCallExpression(callee, [createLiteral(null), createIdentifier('args')], i + 1, 0),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report same concat pattern multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      for (let i = 0; i < 3; i++) {
        const callee = createMemberExpression(createIdentifier('arr'), 'concat')
        visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')], i + 1, 0))
      }

      expect(reports.length).toBe(3)
    })

    test('should not report for non-matching calls interspersed', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const concatCallee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee, [createIdentifier('other')]))

      const pushCallee = createMemberExpression(createIdentifier('arr'), 'push')
      visitor.CallExpression(createCallExpression(pushCallee, [createIdentifier('item')]))

      const concatCallee2 = createMemberExpression(createIdentifier('list'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee2, [createIdentifier('more')]))

      expect(reports.length).toBe(2)
    })

    test('should maintain separate report messages for each call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('first'), 'concat')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('a')]))

      const callee2 = createMemberExpression(createIdentifier('second'), 'concat')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('b')]))

      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
    })

    test('should accumulate reports across different line locations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee1 = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('a')], 5, 0))

      const callee2 = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('b')], 10, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should report each distinct visitor independently', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = preferSpreadRule.create(ctx1)
      const v2 = preferSpreadRule.create(ctx2)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      v1.CallExpression(createCallExpression(callee, [createIdentifier('a')]))
      v2.CallExpression(createCallExpression(callee, [createIdentifier('b')]))
      v2.CallExpression(createCallExpression(callee, [createIdentifier('c')]))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(2)
    })

    test('should handle mix of apply, concat, and non-matching calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      // concat
      const concatCallee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee, [createIdentifier('a')]))

      // non-matching push
      const pushCallee = createMemberExpression(createIdentifier('arr'), 'push')
      visitor.CallExpression(createCallExpression(pushCallee, [createIdentifier('x')]))

      // apply with correct context
      const applyCallee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(applyCallee, [createLiteral(null), createIdentifier('args')]),
      )

      // non-matching apply (wrong context)
      const badApplyCallee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(badApplyCallee, [createIdentifier('obj'), createIdentifier('args')]),
      )

      // concat again
      const concatCallee2 = createMemberExpression(createIdentifier('list'), 'concat')
      visitor.CallExpression(createCallExpression(concatCallee2, [createIdentifier('b')]))

      expect(reports.length).toBe(3)
    })
  })

  // =====================================================
  // CONTEXT TESTS (10 tests)
  // =====================================================
  describe('context handling', () => {
    test('should handle context with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/utils.ts')
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with different source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const result = arr.concat(other);',
      )
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      visitor.CallExpression(
        createCallExpression(callee, [createLiteral(null), createIdentifier('args')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle context with extra options', () => {
      const { context, reports } = createMockContext({ checkApply: true, checkConcat: true })
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with workspace root', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(context.workspaceRoot).toBe('/src')

      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should use getSource from context', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'fn.apply(null, args)')
      expect(context.getSource()).toBe('fn.apply(null, args)')
    })

    test('should use getFilePath from context', () => {
      const { context } = createMockContext({}, '/custom/path.ts')
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('should handle context with null AST', () => {
      const { context, reports } = createMockContext()
      expect(context.getAST()).toBeNull()

      const visitor = preferSpreadRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty tokens', () => {
      const { context, reports } = createMockContext()
      expect(context.getTokens()).toEqual([])

      const visitor = preferSpreadRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })

    test('should handle context with empty comments', () => {
      const { context, reports } = createMockContext()
      expect(context.getComments()).toEqual([])

      const visitor = preferSpreadRule.create(context)
      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      visitor.CallExpression(createCallExpression(callee, [createIdentifier('other')]))

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // FIX FUNCTIONALITY TESTS (12 tests)
  // =====================================================
  describe('fix functionality', () => {
    function createMockContextWithSource(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
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

      return { context, reports }
    }

    function createCallExpressionWithRange(
      callee: unknown,
      args: unknown[],
      range: [number, number],
      line = 1,
      column = 0,
    ): unknown {
      return {
        type: 'CallExpression',
        callee,
        arguments: args,
        range,
        loc: {
          start: { line, column },
          end: { line, column: column + 20 },
        },
      }
    }

    function createIdentifierWithRange(name: string, range: [number, number]): unknown {
      return {
        type: 'Identifier',
        name,
        range,
      }
    }

    function createLiteralWithRange(value: unknown, range: [number, number]): unknown {
      return {
        type: 'Literal',
        value,
        range,
      }
    }

    function createMemberExpressionWithRange(
      object: unknown,
      property: string,
      range: [number, number],
    ): unknown {
      return {
        type: 'MemberExpression',
        object,
        property: {
          type: 'Identifier',
          name: property,
        },
        range,
      }
    }

    test('should provide fix for fn.apply(null, args)', () => {
      const source = 'fn.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 10],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createLiteralWithRange(null, [11, 15]), createIdentifierWithRange('args', [17, 21])],
        [0, 21],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for arr.concat(other)', () => {
      const source = 'arr.concat(other)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('arr', [0, 3]),
        'concat',
        [0, 9],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createIdentifierWithRange('other', [10, 15])],
        [0, 16],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide correct fix text for apply', () => {
      const source = 'fn.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 8],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createLiteralWithRange(null, [9, 13]), createIdentifierWithRange('args', [15, 19])],
        [0, 20],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('fn(...args)')
    })

    test('should provide correct fix text for concat', () => {
      const source = 'arr.concat(other)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('arr', [0, 3]),
        'concat',
        [0, 10],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createIdentifierWithRange('other', [11, 16])],
        [0, 17],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...arr, ...other]')
    })

    test('should provide fix with range matching node range', () => {
      const source = 'fn.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 10],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createLiteralWithRange(null, [11, 15]), createIdentifierWithRange('args', [17, 21])],
        [0, 22],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 22])
    })

    test('should provide fix for apply with this as thisArg', () => {
      const source = 'fn.apply(this, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 8],
      )
      const thisExpr = { type: 'ThisExpression', range: [9, 13] as [number, number] }
      const node = createCallExpressionWithRange(
        callee,
        [thisExpr, createIdentifierWithRange('args', [15, 19])],
        [0, 20],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('fn(...args)')
    })

    test('should provide fix for concat with multiple args', () => {
      const source = 'arr.concat(a, b)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('arr', [0, 3]),
        'concat',
        [0, 10],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createIdentifierWithRange('a', [11, 12]), createIdentifierWithRange('b', [14, 15])],
        [0, 16],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...arr, ...a, ...b]')
    })

    test('should provide fix for concat with no args', () => {
      const source = 'arr.concat()'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('arr', [0, 3]),
        'concat',
        [0, 9],
      )
      const node = createCallExpressionWithRange(callee, [], [0, 12])

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('[...arr]')
    })

    test('should provide fix for apply with undefined as thisArg', () => {
      const source = 'fn.apply(undefined, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createIdentifierWithRange('fn', [0, 2]),
        'apply',
        [0, 8],
      )
      const node = createCallExpressionWithRange(
        callee,
        [
          createIdentifierWithRange('undefined', [9, 18]),
          createIdentifierWithRange('args', [20, 24]),
        ],
        [0, 25],
      )

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('fn(...args)')
    })

    test('should not provide fix when callee object has no range', () => {
      const source = 'fn.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('fn'), 'apply')
      const node = createCallExpressionWithRange(
        callee,
        [createLiteral(null), createIdentifier('args')],
        [0, 21],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix for chained method apply', () => {
      const source = 'obj.method.apply(null, args)'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpressionWithRange(
        createMemberExpressionWithRange(
          createIdentifierWithRange('obj', [0, 3]),
          'method',
          [0, 10],
        ),
        'apply',
        [0, 16],
      )
      const node = createCallExpressionWithRange(
        callee,
        [createLiteralWithRange(null, [17, 21]), createIdentifierWithRange('args', [23, 27])],
        [0, 28],
      )

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })
  })

  // =====================================================
  // TEST.EACH PARAMETERIZED TESTS (40+ tests)
  // =====================================================
  describe('parameterized method detection', () => {
    test.each([
      { method: 'push', expected: 0 },
      { method: 'pop', expected: 0 },
      { method: 'shift', expected: 0 },
      { method: 'unshift', expected: 0 },
      { method: 'map', expected: 0 },
      { method: 'filter', expected: 0 },
      { method: 'reduce', expected: 0 },
      { method: 'forEach', expected: 0 },
      { method: 'find', expected: 0 },
      { method: 'findIndex', expected: 0 },
      { method: 'some', expected: 0 },
      { method: 'every', expected: 0 },
      { method: 'includes', expected: 0 },
      { method: 'indexOf', expected: 0 },
      { method: 'lastIndexOf', expected: 0 },
      { method: 'join', expected: 0 },
      { method: 'slice', expected: 0 },
      { method: 'splice', expected: 0 },
      { method: 'sort', expected: 0 },
      { method: 'reverse', expected: 0 },
      { method: 'flat', expected: 0 },
      { method: 'flatMap', expected: 0 },
      { method: 'fill', expected: 0 },
      { method: 'copyWithin', expected: 0 },
      { method: 'entries', expected: 0 },
      { method: 'keys', expected: 0 },
      { method: 'values', expected: 0 },
      { method: 'toString', expected: 0 },
      { method: 'call', expected: 0 },
      { method: 'bind', expected: 0 },
      { method: 'split', expected: 0 },
    ])('should report $expected reports for .$method() calls', ({ method, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), method)
      const node = createCallExpression(callee, [createIdentifier('arg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized apply thisArg detection', () => {
    test.each([
      { thisArgType: 'Literal', thisArgValue: null, expected: 1 },
      { thisArgType: 'Literal', thisArgValue: undefined, expected: 0 },
      { thisArgType: 'Literal', thisArgValue: 42, expected: 0 },
      { thisArgType: 'Literal', thisArgValue: 'string', expected: 0 },
      { thisArgType: 'Literal', thisArgValue: true, expected: 0 },
      { thisArgType: 'Literal', thisArgValue: false, expected: 0 },
      { thisArgType: 'Literal', thisArgValue: 0, expected: 0 },
      { thisArgType: 'Literal', thisArgValue: '', expected: 0 },
    ])(
      'should report $expected for .apply() with $thisArgType thisArg value=$thisArgValue',
      ({ thisArgType, thisArgValue, expected }) => {
        const { context, reports } = createMockContext()
        const visitor = preferSpreadRule.create(context)

        const callee = createMemberExpression(createIdentifier('fn'), 'apply')
        const thisArg =
          thisArgType === 'Literal' ? createLiteral(thisArgValue) : { type: thisArgType }
        const node = createCallExpression(callee, [thisArg, createIdentifier('args')])

        visitor.CallExpression(node)

        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('parameterized special thisArg types', () => {
    test.each([
      { type: 'ThisExpression', expected: 1 },
      { type: 'Identifier', name: 'undefined', expected: 1 },
      { type: 'Identifier', name: 'obj', expected: 0 },
      { type: 'Identifier', name: 'ctx', expected: 0 },
      { type: 'Identifier', name: 'window', expected: 0 },
      { type: 'Identifier', name: 'self', expected: 0 },
      { type: 'Identifier', name: 'that', expected: 0 },
      { type: 'Identifier', name: 'global', expected: 0 },
    ])(
      'should report $expected for .apply() with $type $name thisArg',
      ({ type, name, expected }) => {
        const { context, reports } = createMockContext()
        const visitor = preferSpreadRule.create(context)

        const callee = createMemberExpression(createIdentifier('fn'), 'apply')
        const thisArg = type === 'ThisExpression' ? createThisExpression() : createIdentifier(name!)
        const node = createCallExpression(callee, [thisArg, createIdentifier('args')])

        visitor.CallExpression(node)

        expect(reports.length).toBe(expected)
      },
    )
  })

  describe('parameterized various identifier names', () => {
    test.each([
      { name: 'arr', expected: 1 },
      { name: 'items', expected: 1 },
      { name: 'list', expected: 1 },
      { name: 'result', expected: 1 },
      { name: 'data', expected: 1 },
      { name: 'collection', expected: 1 },
      { name: 'elements', expected: 1 },
      { name: 'values', expected: 1 },
      { name: 'numbers', expected: 1 },
      { name: 'strings', expected: 1 },
    ])('should report concat for identifier named "$name"', ({ name, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier(name), 'concat')
      const node = createCallExpression(callee, [createIdentifier('other')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(expected)
      if (expected === 1) {
        expect(reports[0].message).toContain(name)
      }
    })
  })

  describe('parameterized various apply identifiers', () => {
    test.each([
      { name: 'fn', expected: 1 },
      { name: 'func', expected: 1 },
      { name: 'callback', expected: 1 },
      { name: 'handler', expected: 1 },
      { name: 'method', expected: 1 },
      { name: 'compute', expected: 1 },
      { name: 'process', expected: 1 },
      { name: 'execute', expected: 1 },
      { name: 'run', expected: 1 },
      { name: 'applyFn', expected: 1 },
    ])('should report apply for identifier named "$name"', ({ name, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const callee = createMemberExpression(createIdentifier(name), 'apply')
      const node = createCallExpression(callee, [createLiteral(null), createIdentifier('args')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(expected)
      if (expected === 1) {
        expect(reports[0].message).toContain(name)
      }
    })
  })

  describe('parameterized falsy/edge node inputs', () => {
    test.each([
      { input: null, description: 'null' },
      { input: undefined, description: 'undefined' },
      { input: '', description: 'empty string' },
      { input: 0, description: 'zero' },
      { input: false, description: 'false' },
      { input: NaN, description: 'NaN' },
    ])('should not throw for $description input', ({ input }) => {
      const { context } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      expect(() => visitor.CallExpression(input)).not.toThrow()
    })
  })

  describe('parameterized concat argument counts', () => {
    test.each([
      { argCount: 0, expected: 1 },
      { argCount: 1, expected: 1 },
      { argCount: 2, expected: 1 },
      { argCount: 3, expected: 1 },
      { argCount: 5, expected: 1 },
      { argCount: 10, expected: 1 },
    ])('should report concat with $argCount arguments', ({ argCount, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = preferSpreadRule.create(context)

      const args = Array.from({ length: argCount }, (_, i) => createIdentifier(`arg${i}`))
      const callee = createMemberExpression(createIdentifier('arr'), 'concat')
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(expected)
    })
  })
})
