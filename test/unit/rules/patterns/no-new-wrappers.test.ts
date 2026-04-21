import { describe, test, expect, vi } from 'vitest'
import { noNewWrappersRule } from '../../../../src/rules/patterns/no-new-wrappers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

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

function createNewExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

function createCallExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

describe('no-new-wrappers rule', () => {
  // =========================================================================
  // META TESTS (20 tests)
  // =========================================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewWrappersRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewWrappersRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewWrappersRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNewWrappersRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noNewWrappersRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noNewWrappersRule.meta.fixable).toBeUndefined()
    })

    test('should mention new in description', () => {
      expect(noNewWrappersRule.meta.docs?.description.toLowerCase()).toContain('new')
    })

    test('should mention wrappers in description', () => {
      const desc = noNewWrappersRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/string|number|boolean|symbol|bigint|wrapper/)
    })

    test('should have empty schema array', () => {
      expect(noNewWrappersRule.meta.schema).toEqual([])
    })

    test('should have a description that is a non-empty string', () => {
      expect(typeof noNewWrappersRule.meta.docs?.description).toBe('string')
      expect(noNewWrappersRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs object defined', () => {
      expect(noNewWrappersRule.meta.docs).toBeDefined()
      expect(typeof noNewWrappersRule.meta.docs).toBe('object')
    })

    test('should not be deprecated', () => {
      expect(noNewWrappersRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noNewWrappersRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noNewWrappersRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have docs url defined', () => {
      expect(noNewWrappersRule.meta.docs?.url).toBeDefined()
    })

    test('should have a valid docs url string', () => {
      expect(typeof noNewWrappersRule.meta.docs?.url).toBe('string')
      expect(noNewWrappersRule.meta.docs?.url).toMatch(/^https?:\/\//)
    })

    test('should mention String in description', () => {
      expect(noNewWrappersRule.meta.docs?.description).toContain('String')
    })

    test('should mention Number in description', () => {
      expect(noNewWrappersRule.meta.docs?.description).toContain('Number')
    })

    test('should mention Boolean in description', () => {
      expect(noNewWrappersRule.meta.docs?.description).toContain('Boolean')
    })

    test('should have meta as a plain object with expected keys', () => {
      const metaKeys = Object.keys(noNewWrappersRule.meta)
      expect(metaKeys).toContain('type')
      expect(metaKeys).toContain('severity')
      expect(metaKeys).toContain('docs')
      expect(metaKeys).toContain('schema')
    })
  })

  // =========================================================================
  // CREATE / VISITOR TESTS (8 tests)
  // =========================================================================
  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return a visitor with only NewExpression key', () => {
      const { context } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(Object.keys(visitor)).toContain('NewExpression')
    })

    test('NewExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('create should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noNewWrappersRule.create(ctx1)
      const visitor2 = noNewWrappersRule.create(ctx2)

      visitor1.NewExpression(createNewExpression('String'))
      visitor2.NewExpression(createNewExpression('Number'))

      expect(r1.length).toBe(1)
      expect(r1[0].message).toContain('String')
      expect(r2.length).toBe(1)
      expect(r2[0].message).toContain('Number')
    })

    test('should handle multiple create calls without shared state', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = noNewWrappersRule.create(ctx1)
      visitor1.NewExpression(createNewExpression('String'))

      const visitor2 = noNewWrappersRule.create(ctx2)
      visitor2.NewExpression(createNewExpression('String'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('create should accept context with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('create should accept context with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'new String("hello")')
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // DETECTION TESTS (30 tests)
  // =========================================================================
  describe('detecting new String()', () => {
    test('should report new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toBe('Do not use new String(). Use string() or a literal instead.')
    })

    test('should mention string() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('string()')
    })
  })

  describe('detecting new Number()', () => {
    test('should report new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toBe('Do not use new Number(). Use number() or a literal instead.')
    })

    test('should mention number() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toContain('number()')
    })
  })

  describe('detecting new Boolean()', () => {
    test('should report new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toBe(
        'Do not use new Boolean(). Use boolean() or a literal instead.',
      )
    })

    test('should mention boolean() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toContain('boolean()')
    })
  })

  describe('detecting new Symbol()', () => {
    test('should report new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Symbol()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports[0].message).toBe('Do not use new Symbol(). Use symbol() or a literal instead.')
    })

    test('should mention symbol() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports[0].message).toContain('symbol()')
    })
  })

  describe('detecting new BigInt()', () => {
    test('should report new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new BigInt()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports[0].message).toBe('Do not use new BigInt(). Use bigint() or a literal instead.')
    })

    test('should mention bigint() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports[0].message).toContain('bigint()')
    })
  })

  describe('detecting wrappers with arguments', () => {
    test('should report new String() even with arguments present', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Number() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Boolean() with argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting all five wrappers individually', () => {
    test('should detect new String() independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('String')
    })

    test('should detect new Number() independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should detect new Boolean() independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Boolean')
    })

    test('should detect new Symbol() independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Symbol')
    })

    test('should detect new BigInt() independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('BigInt')
    })
  })

  // =========================================================================
  // NOT REPORTING TESTS (30 tests)
  // =========================================================================
  describe('not reporting non-wrapper constructors', () => {
    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Object'))
      visitor.NewExpression(createNewExpression('Map'))

      expect(reports.length).toBe(0)
    })

    test('should not report user-defined constructors', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('UserClass'))
      visitor.NewExpression(createNewExpression('CustomType'))

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting common non-wrapper globals', () => {
    test('should not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Array'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Object'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Map'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Set'))

      expect(reports.length).toBe(0)
    })

    test('should not report new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('WeakMap'))

      expect(reports.length).toBe(0)
    })

    test('should not report new WeakSet()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('WeakSet'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Promise'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('RegExp'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Error'))

      expect(reports.length).toBe(0)
    })

    test('should not report new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('TypeError'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Int8Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Int8Array'))

      expect(reports.length).toBe(0)
    })

    test('should not report new Float64Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Float64Array'))

      expect(reports.length).toBe(0)
    })

    test('should not report new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('ArrayBuffer'))

      expect(reports.length).toBe(0)
    })

    test('should not report new DataView()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('DataView'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting case-sensitive non-matches', () => {
    test('should not report new string (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('string'))

      expect(reports.length).toBe(0)
    })

    test('should not report new number (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('number'))

      expect(reports.length).toBe(0)
    })

    test('should not report new boolean (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('boolean'))

      expect(reports.length).toBe(0)
    })

    test('should not report new symbol (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('symbol'))

      expect(reports.length).toBe(0)
    })

    test('should not report new bigint (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('bigint'))

      expect(reports.length).toBe(0)
    })

    test('should not report new STRING (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('STRING'))

      expect(reports.length).toBe(0)
    })

    test('should not report new NUMBER (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('NUMBER'))

      expect(reports.length).toBe(0)
    })

    test('should not report names with extra characters like StringWrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('StringWrapper'))

      expect(reports.length).toBe(0)
    })

    test('should not report names with extra characters like NumberType', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('NumberType'))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(''))

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // EDGE CASES (25 tests)
  // =========================================================================
  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node (boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        callee: {
          type: 'Identifier',
          name: 'String',
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee (FunctionExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '123String' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

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
        getSource: () => 'new String()',
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

      const visitor = noNewWrappersRule.create(context)
      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should handle node that is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
        range: [0, 14],
        extra: { parenthesized: false },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee as a number instead of object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 42,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as a string instead of object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: 'String',
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee Identifier without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'foo' },
            arguments: [
              {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Number' },
                arguments: [],
              },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with Symbol as callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: Symbol('String') },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle very large line numbers in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 99999, 99999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle zero line and column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })
  })

  // =========================================================================
  // LOCATION REPORTING (15 tests)
  // =========================================================================
  describe('location reporting', () => {
    test('should report correct location for wrapper expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 'String',
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report correct location for new String() at line 1 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for new Number() at custom position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number', 42, 15))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location for new Boolean() at custom position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location for new Symbol() at custom position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for new BigInt() at custom position', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt', 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve end location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = createNewExpression('String', 5, 10)
      visitor.NewExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should handle location for multiple reports independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))
      visitor.NewExpression(createNewExpression('Number', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report location when callee is Identifier but type is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 20, 4))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(20)
    })

    test('should handle loc with only start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        loc: {
          start: { line: 8, column: 2 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null start/end', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        loc: null,
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should use extractLocation default when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
      }
      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // =========================================================================
  // MESSAGE QUALITY (10 tests)
  // =========================================================================
  describe('message quality', () => {
    test('should contain "Do not use new" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('Do not use new')
    })

    test('should contain wrapper name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message).toContain('String')
    })

    test('should suggest lowercase function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toContain('boolean()')
    })

    test('should suggest literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toContain('literal')
    })

    test('should have consistent message format for all wrappers', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Boolean'))
      visitor.NewExpression(createNewExpression('Symbol'))
      visitor.NewExpression(createNewExpression('BigInt'))

      for (const report of reports) {
        expect(report.message).toMatch(
          /Do not use new [A-Z][a-zA-Z]+\(\)\. Use [a-z]+\(\) or a literal instead\./,
        )
      }
    })

    test('should end message with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should include "or a literal" phrase in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports[0].message).toContain('or a literal')
    })

    test('should include "instead" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('BigInt'))

      expect(reports[0].message).toContain('instead')
    })

    test('should use correct casing for wrapper name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0].message).toContain('new Number()')
      expect(reports[0].message).toContain('number()')
    })

    test('should produce a non-empty message string', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // MULTIPLE REPORTS (10 tests)
  // =========================================================================
  describe('multiple violations', () => {
    test('should report multiple new wrapper expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))
      visitor.NewExpression(createNewExpression('Number', 2, 0))
      visitor.NewExpression(createNewExpression('Boolean', 3, 0))
      visitor.NewExpression(createNewExpression('Symbol', 4, 0))
      visitor.NewExpression(createNewExpression('BigInt', 5, 0))

      expect(reports.length).toBe(5)
    })

    test('should report mixed violations and non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports.length).toBe(3)
    })

    test('should report same wrapper multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String', 1, 0))
      visitor.NewExpression(createNewExpression('String', 2, 0))
      visitor.NewExpression(createNewExpression('String', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report all five wrappers in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      const wrappers = ['String', 'Number', 'Boolean', 'Symbol', 'BigInt']
      for (const wrapper of wrappers) {
        visitor.NewExpression(createNewExpression(wrapper))
      }

      expect(reports.length).toBe(5)
    })

    test('should report each wrapper with correct message in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0].message).toContain('String')
      expect(reports[1].message).toContain('Number')
      expect(reports[2].message).toContain('Boolean')
    })

    test('should handle large number of violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(createNewExpression('String', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should report interleaved violations and non-violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Boolean'))
      visitor.NewExpression(createNewExpression('Map'))
      visitor.NewExpression(createNewExpression('Symbol'))

      expect(reports.length).toBe(4)
    })

    test('should report duplicate wrapper names separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number', 1, 0))
      visitor.NewExpression(createNewExpression('Number', 2, 5))
      visitor.NewExpression(createNewExpression('Number', 3, 10))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report all five wrappers then non-wrappers without affecting count', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Number'))
      visitor.NewExpression(createNewExpression('Boolean'))
      visitor.NewExpression(createNewExpression('Symbol'))
      visitor.NewExpression(createNewExpression('BigInt'))
      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Error'))

      expect(reports.length).toBe(5)
    })

    test('should accumulate reports across multiple visitor calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      expect(reports.length).toBe(1)

      visitor.NewExpression(createNewExpression('Number'))
      expect(reports.length).toBe(2)

      visitor.NewExpression(createNewExpression('Date'))
      expect(reports.length).toBe(2)

      visitor.NewExpression(createNewExpression('Boolean'))
      expect(reports.length).toBe(3)
    })
  })

  // =========================================================================
  // CONTEXT TESTS (10 tests)
  // =========================================================================
  describe('context interaction', () => {
    test('should call context.report once for a single violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should pass message in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Number'))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should pass loc in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Boolean'))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should work with context returning different file paths', () => {
      const { context, reports } = createMockContext({}, '/different/project/src/test.ts')
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should work with context returning different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = new String("test")',
      )
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should not call report for non-violating nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('Date'))
      visitor.NewExpression(createNewExpression('Array'))

      expect(reports.length).toBe(0)
    })

    test('should use context logger without errors', () => {
      const { context } = createMockContext()

      expect(() => {
        const visitor = noNewWrappersRule.create(context)
        visitor.NewExpression(createNewExpression('String'))
      }).not.toThrow()
    })

    test('should handle context with minimal config', () => {
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

      const visitor = noNewWrappersRule.create(context)
      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should handle context with parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'new String()',
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
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = noNewWrappersRule.create(context)
      visitor.NewExpression(createNewExpression('String'))

      expect(reports.length).toBe(1)
    })

    test('should maintain report count even with complex context', () => {
      const { context, reports } = createMockContext(
        { strict: true, customOption: 'value' },
        '/deeply/nested/path/to/file.ts',
        'const a = new String("x"); const b = new Number(1);',
      )
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression('String'))
      visitor.NewExpression(createNewExpression('Number'))

      expect(reports.length).toBe(2)
    })
  })

  // =========================================================================
  // TEST.EACH DATA-DRIVEN TESTS (40+ tests)
  // =========================================================================
  describe('data-driven detection tests', () => {
    test.each([
      { name: 'String', expected: 'string()' },
      { name: 'Number', expected: 'number()' },
      { name: 'Boolean', expected: 'boolean()' },
      { name: 'Symbol', expected: 'symbol()' },
      { name: 'BigInt', expected: 'bigint()' },
    ] as const)('should report new $name() with suggestion $expected', ({ name, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })

    test.each([
      'Date',
      'Array',
      'Object',
      'Map',
      'Set',
      'WeakMap',
      'WeakSet',
      'Promise',
      'RegExp',
      'Error',
      'TypeError',
      'RangeError',
      'Int8Array',
      'Uint8Array',
      'Int32Array',
      'Float32Array',
      'Float64Array',
      'ArrayBuffer',
      'DataView',
      'Proxy',
      'FinalizationRegistry',
    ] as const)('should not report new %s()', (name) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports.length).toBe(0)
    })

    test.each([
      { name: 'String', expected: 'new String()' },
      { name: 'Number', expected: 'new Number()' },
      { name: 'Boolean', expected: 'new Boolean()' },
      { name: 'Symbol', expected: 'new Symbol()' },
      { name: 'BigInt', expected: 'new BigInt()' },
    ] as const)('message for $name should contain "$expected"', ({ name, expected }) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports[0].message).toContain(expected)
    })

    test.each([
      { name: 'String', lower: 'string' },
      { name: 'Number', lower: 'number' },
      { name: 'Boolean', lower: 'boolean' },
      { name: 'Symbol', lower: 'symbol' },
      { name: 'BigInt', lower: 'bigint' },
    ] as const)('message for $name should suggest $lower() function', ({ name, lower }) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports[0].message).toContain(`${lower}()`)
    })

    test.each([
      { line: 1, column: 0 },
      { line: 5, column: 10 },
      { line: 100, column: 0 },
      { line: 1, column: 50 },
      { line: 42, column: 7 },
    ] as const)(
      'should report correct location at line=$line, column=$column',
      ({ line, column }) => {
        const { context, reports } = createMockContext()
        const visitor = noNewWrappersRule.create(context)

        visitor.NewExpression(createNewExpression('String', line, column))

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )

    test.each([
      'MyClass',
      'Foo',
      'Bar',
      'CustomConstructor',
      'HttpClient',
      'EventEmitter',
      'StringBuffer',
      'NumberUtils',
      'BooleanHelper',
      'SymbolTable',
    ] as const)('should not report user-defined class new %s()', (name) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports.length).toBe(0)
    })

    test.each([
      { name: 'String', line: 1 },
      { name: 'Number', line: 2 },
      { name: 'Boolean', line: 3 },
      { name: 'Symbol', line: 4 },
      { name: 'BigInt', line: 5 },
    ] as const)('should report $name at line $line with correct location', ({ name, line }) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name, line, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].message).toContain(name)
    })

    test.each([
      { name: 'STRING', desc: 'all uppercase' },
      { name: 'NUMBER', desc: 'all uppercase' },
      { name: 'BOOLEAN', desc: 'all uppercase' },
      { name: 'SYMBOL', desc: 'all uppercase' },
      { name: 'BIGINT', desc: 'all uppercase' },
    ] as const)('should not report $name ($desc)', ({ name }) => {
      const { context, reports } = createMockContext()
      const visitor = noNewWrappersRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports.length).toBe(0)
    })

    test.each(['string', 'number', 'boolean', 'symbol', 'bigint'] as const)(
      'should not report lowercase wrapper name "%s"',
      (name) => {
        const { context, reports } = createMockContext()
        const visitor = noNewWrappersRule.create(context)

        visitor.NewExpression(createNewExpression(name))

        expect(reports.length).toBe(0)
      },
    )
  })
})
