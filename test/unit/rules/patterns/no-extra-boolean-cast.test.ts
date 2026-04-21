import { describe, test, expect } from 'vitest'
import { noExtraBooleanCastRule } from '../../../../src/rules/patterns/no-extra-boolean-cast.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBooleanCall(line = 1, column = 0, argument?: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: argument ? [argument] : [],
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createBooleanCallWithIdentifierArg(line = 1, column = 0, argName = 'x'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'Identifier',
        name: argName,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + argName.length },
    },
  }
}

function createDoubleBang(line = 1, column = 0, argument?: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: argument || { type: 'Identifier', name: 'x' },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createDoubleBangWithBooleanArg(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'Boolean',
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'x',
          },
        ],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createNonBooleanCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'String',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSingleBang(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'Identifier',
      name: 'x',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createUnaryExpressionWithNonBangArg(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '-',
      prefix: true,
      argument: {
        type: 'Identifier',
        name: 'x',
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 3 },
    },
  }
}

function createBooleanCallWithNoArgs(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createBooleanCallWithMultipleArgs(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      { type: 'Identifier', name: 'x' },
      { type: 'Identifier', name: 'y' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createCallExpressionWithNonIdentifierCallee(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'boolean' },
      computed: false,
    },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonCallExpression(): unknown {
  return {
    type: 'Literal',
    value: true,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 4 },
    },
  }
}

function createNonUnaryExpression(): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 1 },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

function createBooleanCallWithLiteralArg(literalValue: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'Literal',
        value: literalValue,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 12 },
    },
  }
}

function createBooleanCallWithMemberArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 16 },
    },
  }
}

function createBooleanCallWithBinaryArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 18 },
    },
  }
}

function createBooleanCallWithLogicalArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 14 },
    },
  }
}

function createBooleanCallWithUnaryArg(operator: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'UnaryExpression',
        operator,
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createDoubleBangWithIdentifierArg(argName: string, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: { type: 'Identifier', name: argName },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + argName.length + 2 },
    },
  }
}

function createDoubleBangWithBooleanArgWithIdentifier(
  argName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'Boolean',
        },
        arguments: [{ type: 'Identifier', name: argName }],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + argName.length + 11 },
    },
  }
}

function createTripleNestedBoolean(argName = 'x', line = 1, column = 0): unknown {
  const innermost = createBooleanCallWithIdentifierArg(1, 0, argName)
  const middle = createBooleanCall(1, 20, innermost)
  return createBooleanCall(line, column, middle)
}

function createBooleanCallWithConditionalArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBooleanCallWithCallArg(argName = 'x', line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Boolean',
    },
    arguments: [
      {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'foo',
        },
        arguments: [{ type: 'Identifier', name: argName }],
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 16 },
    },
  }
}

function createDoubleBangWithMemberArg(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNumberCallWithIdentifierArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Number',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createStringCallWithIdentifierArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'String',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createBigIntBooleanCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'BigInt',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createSymbolBooleanCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'Symbol',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-extra-boolean-cast rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExtraBooleanCastRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noExtraBooleanCastRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noExtraBooleanCastRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noExtraBooleanCastRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention boolean in description', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.toLowerCase()).toContain('boolean')
    })

    test('should mention cast in description', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.toLowerCase()).toContain('cast')
    })

    test('should have empty schema', () => {
      expect(noExtraBooleanCastRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noExtraBooleanCastRule.meta.fixable).toBeUndefined()
    })

    test('should have docs property', () => {
      expect(noExtraBooleanCastRule.meta.docs).toBeDefined()
    })

    test('should have description as a non-empty string', () => {
      expect(typeof noExtraBooleanCastRule.meta.docs?.description).toBe('string')
      expect(noExtraBooleanCastRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a string', () => {
      expect(typeof noExtraBooleanCastRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noExtraBooleanCastRule.meta.severity).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noExtraBooleanCastRule.meta.schema)).toBe(true)
    })

    test('should have description starting with capital letter', () => {
      const desc = noExtraBooleanCastRule.meta.docs?.description
      expect(desc?.[0]).toBe(desc?.[0]?.toUpperCase())
    })

    test('should have description ending with period', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should mention unnecessary in description', () => {
      expect(noExtraBooleanCastRule.meta.docs?.description.toLowerCase()).toContain('unnecessary')
    })

    test('should have recommended as boolean true', () => {
      expect(noExtraBooleanCastRule.meta.docs?.recommended).toBe(true)
      expect(typeof noExtraBooleanCastRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as patterns exactly', () => {
      expect(noExtraBooleanCastRule.meta.docs?.category).toBe('patterns')
    })

    test('should not have fixable set to any value', () => {
      expect(noExtraBooleanCastRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with UnaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return object with only CallExpression and UnaryExpression methods', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['CallExpression', 'UnaryExpression'])
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return UnaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor1 = noExtraBooleanCastRule.create(context)
      const visitor2 = noExtraBooleanCastRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter without error', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })

      expect(() => noExtraBooleanCastRule.create(context)).not.toThrow()
    })

    test('should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })
  })

  describe('detecting redundant Boolean() calls', () => {
    test('should report Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const doubleBang = createDoubleBang(1, 0)
      const boolCall = createBooleanCall(1, 10, doubleBang)

      visitor.CallExpression(boolCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithIdentifierArg(1, 0, 'x'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Boolean call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createNonBooleanCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(5, 10, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report Boolean() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithNoArgs(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean() with multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithMultipleArgs(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report call with non-identifier callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createCallExpressionWithNonIdentifierCallee(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report Boolean(Boolean(Boolean(x)))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const tripleNested = createTripleNestedBoolean('x', 1, 0)
      visitor.CallExpression(tripleNested)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!obj.prop)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const doubleBangMember = createDoubleBangWithMemberArg(1, 0)
      const boolCall = createBooleanCall(1, 10, doubleBangMember)

      visitor.CallExpression(boolCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report Boolean(a === b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithBinaryArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(a && b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLogicalArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(cond ? a : b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithConditionalArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(foo(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithCallArg('x', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(obj.prop)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithMemberArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg(42, 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg(true, 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(false)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg(false, 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg(0, 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean("")', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg('', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg(null, 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(-x) where inner is unary minus', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithUnaryArg('-', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(~x) where inner is bitwise not', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithUnaryArg('~', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(typeof x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithUnaryArg('typeof', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(+x) where inner is unary plus', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithUnaryArg('+', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Number(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerNumber = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [innerBool],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(outerNumber)

      expect(reports.length).toBe(0)
    })

    test('should not report String(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerString = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [innerBool],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(outerString)

      expect(reports.length).toBe(0)
    })

    test('should not report BigInt(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBigInt = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [innerBool],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(outerBigInt)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerSymbol = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [innerBool],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(outerSymbol)

      expect(reports.length).toBe(0)
    })

    test('should report Boolean(Boolean(myVar))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'myVar')
      const outerBool = createBooleanCall(1, 20, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(Boolean(result))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'result')
      const outerBool = createBooleanCall(1, 22, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
    })

    test('should report Boolean(!!flag)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const doubleBangFlag = createDoubleBangWithIdentifierArg('flag', 1, 0)
      const boolCall = createBooleanCall(1, 10, doubleBangFlag)

      visitor.CallExpression(boolCall)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!isEnabled)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const doubleBangEnabled = createDoubleBangWithIdentifierArg('isEnabled', 1, 0)
      const boolCall = createBooleanCall(1, 10, doubleBangEnabled)

      visitor.CallExpression(boolCall)

      expect(reports.length).toBe(1)
    })

    test('should report correct end location for Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(3, 5, 'x')
      const outerBool = createBooleanCall(3, 5, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('should report at different column positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 40, 'x')
      const outerBool = createBooleanCall(1, 40, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports[0].loc?.start.column).toBe(40)
    })

    test('should report at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(100, 0, 'x')
      const outerBool = createBooleanCall(100, 0, innerBool)

      visitor.CallExpression(outerBool)

      expect(reports[0].loc?.start.line).toBe(100)
    })
  })

  describe('detecting redundant double bang with Boolean', () => {
    test('should report !!Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report !!x', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBang(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report !x', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createSingleBang(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report !(-x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithNonBangArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for !!Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report !!Boolean(myVar)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArgWithIdentifier('myVar', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report !!Boolean(flag)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArgWithIdentifier('flag', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report !!Boolean(isEnabled)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArgWithIdentifier('isEnabled', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report !!Number(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: createNumberCallWithIdentifierArg(1, 0),
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })

    test('should not report !!String(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: createStringCallWithIdentifierArg(1, 0),
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })

    test('should not report !!obj.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithMemberArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct end location for !!Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(7, 3))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report at large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should not report triple negation !!!x', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const tripleNeg = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 4 },
        },
      }

      visitor.UnaryExpression(tripleNeg)

      expect(reports.length).toBe(0)
    })

    test('should not report quadruple negation !!!!x', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const quadNeg = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              prefix: true,
              argument: { type: 'Identifier', name: 'x' },
            },
          },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }

      visitor.UnaryExpression(quadNeg)

      expect(reports.length).toBe(0)
    })

    test('should report !!Boolean(obj.prop)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolWithMember = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
            computed: false,
          },
        ],
      }

      const doubleBangBool = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: boolWithMember,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 16 },
        },
      }

      visitor.UnaryExpression(doubleBangBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report !!Boolean(a === b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolWithBinary = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '===',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        ],
      }

      const doubleBangBool = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: boolWithBinary,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 18 },
        },
      }

      visitor.UnaryExpression(doubleBangBool)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null CallExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined CallExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle null UnaryExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined UnaryExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(createNonCallExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-UnaryExpression node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(createNonUnaryExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call expression without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression without argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with non-! operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool) as Record<string, unknown>
      delete outerBool.loc

      expect(() => visitor.CallExpression(outerBool)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node for both methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(() => visitor.UnaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Boolean call with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolCall = createBooleanCall(1, 0, null)
      expect(() => visitor.CallExpression(boolCall)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Boolean call with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolCall = createBooleanCall(1, 0, undefined)
      expect(() => visitor.CallExpression(boolCall)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type for CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.CallExpression({ type: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      expect(() => visitor.UnaryExpression({ type: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee having no name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee name as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 42 },
        arguments: [{ type: 'Identifier', name: 'x' }],
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with undefined operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with null operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: null,
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with void operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with delete operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      expect(() => visitor.UnaryExpression(unary)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle location with missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool) as Record<string, unknown>
      outerBool.loc = { end: { line: 1, column: 27 } }

      expect(() => visitor.CallExpression(outerBool)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle location with missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool) as Record<string, unknown>
      outerBool.loc = { start: { line: 1, column: 15 } }

      expect(() => visitor.CallExpression(outerBool)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle location with null start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerBool = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outerBool = createBooleanCall(1, 15, innerBool) as Record<string, unknown>
      outerBool.loc = { start: null, end: null }

      expect(() => visitor.CallExpression(outerBool)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with non-array arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: 'not-an-array',
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with arguments as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: { 0: { type: 'Identifier', name: 'x' }, length: 1 },
      }

      expect(() => visitor.CallExpression(call)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle double bang with null inner argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: null,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })

    test('should handle double bang with undefined inner argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: undefined,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })

    test('should handle double bang with string inner argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: 'not-an-object',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })

    test('should handle double bang with number inner argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: 42,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.UnaryExpression(unary)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple invocations', () => {
    test('should report each redundant cast separately with multiple CallExpression calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner1 = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const outer1 = createBooleanCall(1, 15, inner1)
      visitor.CallExpression(outer1)

      const inner2 = createBooleanCallWithIdentifierArg(2, 0, 'y')
      const outer2 = createBooleanCall(2, 15, inner2)
      visitor.CallExpression(outer2)

      expect(reports.length).toBe(2)
    })

    test('should report each redundant cast separately with multiple UnaryExpression calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))
      visitor.UnaryExpression(createDoubleBangWithBooleanArg(2, 5))

      expect(reports.length).toBe(2)
    })

    test('should track reports across mixed CallExpression and UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor.CallExpression(createBooleanCall(1, 15, inner))
      visitor.UnaryExpression(createDoubleBangWithBooleanArg(2, 0))

      expect(reports.length).toBe(2)
    })

    test('should not report non-redundant casts between redundant ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor.CallExpression(createBooleanCall(1, 15, inner))
      visitor.CallExpression(createBooleanCallWithIdentifierArg(2, 0, 'y'))
      visitor.UnaryExpression(createDoubleBangWithBooleanArg(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should report nothing when all calls are valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithIdentifierArg(1, 0, 'x'))
      visitor.CallExpression(createBooleanCallWithIdentifierArg(2, 0, 'y'))
      visitor.UnaryExpression(createDoubleBang(3, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle many sequential redundant Boolean(Boolean(x)) calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      for (let i = 0; i < 10; i++) {
        const inner = createBooleanCallWithIdentifierArg(i + 1, 0, 'x')
        const outer = createBooleanCall(i + 1, 15, inner)
        visitor.CallExpression(outer)
      }

      expect(reports.length).toBe(10)
    })

    test('should handle many sequential !!Boolean(x) calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(createDoubleBangWithBooleanArg(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report correctly interleaved valid and redundant casts', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      // Valid
      visitor.CallExpression(createBooleanCallWithIdentifierArg(1, 0, 'x'))
      // Redundant
      const inner = createBooleanCallWithIdentifierArg(2, 0, 'y')
      visitor.CallExpression(createBooleanCall(2, 15, inner))
      // Valid
      visitor.UnaryExpression(createDoubleBang(3, 0))
      // Redundant
      visitor.UnaryExpression(createDoubleBangWithBooleanArg(4, 0))
      // Valid
      visitor.CallExpression(createBooleanCallWithIdentifierArg(5, 0, 'z'))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
    })
  })

  describe('various non-Boolean function calls', () => {
    test('should not report Number(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createNumberCallWithIdentifierArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report String(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createStringCallWithIdentifierArg(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report BigInt(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBigIntBooleanCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createSymbolBooleanCall(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report parseInt(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report parseFloat(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report myFunc(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunc' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.boolean()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createCallExpressionWithNonIdentifierCallee(1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.Boolean()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Boolean' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report window.Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'Boolean' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'Boolean' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report computed member call obj["Boolean"](x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'Boolean' },
          computed: true,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })
  })

  describe('Boolean with various inner expressions', () => {
    test('should not report Boolean(x + y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(x || y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(x > 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'BinaryExpression',
            operator: '>',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 0 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(arr.length)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(arr[0])', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 0 },
            computed: true,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.CallExpression(createBooleanCallWithLiteralArg('hello', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(NaN)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(Infinity)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(new Foo())', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Foo' },
            arguments: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean([1, 2, 3])', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'ArrayExpression',
            elements: [
              { type: 'Literal', value: 1 },
              { type: 'Literal', value: 2 },
              { type: 'Literal', value: 3 },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean({a: 1})', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'ObjectExpression',
            properties: [
              {
                type: 'Property',
                key: { type: 'Identifier', name: 'a' },
                value: { type: 'Literal', value: 1 },
                kind: 'init',
              },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(function(){})', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(() => true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: true },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('should report message containing "Redundant boolean cast" for Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor.CallExpression(createBooleanCall(1, 15, inner))

      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report message containing "Redundant boolean cast" for Boolean(!!x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const dbl = createDoubleBang(1, 0)
      visitor.CallExpression(createBooleanCall(1, 10, dbl))

      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report message containing "Redundant boolean cast" for !!Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))

      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should include location in report for Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor.CallExpression(createBooleanCall(1, 15, inner))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should include location in report for !!Boolean(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have consistent message across all redundant patterns', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const { context: ctx3, reports: reports3 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })

      const v1 = noExtraBooleanCastRule.create(ctx1)
      const v2 = noExtraBooleanCastRule.create(ctx2)
      const v3 = noExtraBooleanCastRule.create(ctx3)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      v1.CallExpression(createBooleanCall(1, 15, inner))

      const dbl = createDoubleBang(1, 0)
      v2.CallExpression(createBooleanCall(1, 10, dbl))

      v3.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))

      expect(reports1[0].message).toBe(reports2[0].message)
      expect(reports2[0].message).toBe(reports3[0].message)
    })
  })

  describe('deeply nested structures', () => {
    test('should report Boolean(Boolean(Boolean(x))) outermost call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const node = createTripleNestedBoolean('x', 1, 0)
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(Boolean(Boolean(Boolean(x))))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const level2 = createBooleanCall(1, 20, inner)
      const level3 = createBooleanCall(1, 30, level2)
      const level4 = createBooleanCall(1, 40, level3)

      visitor.CallExpression(level4)

      expect(reports.length).toBe(1)
    })

    test('should report Boolean(!!Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolCall = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const doubleBangBool = createDoubleBang(1, 0, boolCall)
      const outerBool = createBooleanCall(1, 10, doubleBangBool)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report !!Boolean(Boolean(x))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const middle = createBooleanCall(1, 20, inner)

      const doubleBangOuter = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: middle,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.UnaryExpression(doubleBangOuter)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report !!Boolean(Boolean(x)) via CallExpression for middle node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const middle = createBooleanCall(1, 20, inner)

      // The middle Boolean(Boolean(x)) should still report
      visitor.CallExpression(middle)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!Boolean(x)) via CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const doubleBangBool = createDoubleBang(1, 0, inner)
      const outer = createBooleanCall(1, 10, doubleBangBool)

      visitor.CallExpression(outer)

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor isolation', () => {
    test('should not share reports between different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })

      const visitor1 = noExtraBooleanCastRule.create(ctx1)
      const visitor2 = noExtraBooleanCastRule.create(ctx2)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor1.CallExpression(createBooleanCall(1, 15, inner))
      visitor2.CallExpression(createBooleanCallWithIdentifierArg(1, 0, 'y'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should isolate UnaryExpression reports between contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })

      const visitor1 = noExtraBooleanCastRule.create(ctx1)
      const visitor2 = noExtraBooleanCastRule.create(ctx2)

      visitor1.UnaryExpression(createDoubleBangWithBooleanArg(1, 0))
      visitor2.UnaryExpression(createDoubleBang(1, 0))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should allow creating multiple visitors from same context', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })

      const visitor1 = noExtraBooleanCastRule.create(context)
      const visitor2 = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(1, 0, 'x')
      visitor1.CallExpression(createBooleanCall(1, 15, inner))

      // Both share same reports array via context
      expect(reports.length).toBe(1)
    })
  })

  describe('unary expression with various operators', () => {
    test('should not report unary expression with minus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with plus operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with tilde operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with typeof operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with void operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should not report unary expression with delete operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const unary = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
      }

      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('should handle !Boolean(x) - single negation of Boolean call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const boolArg = createBooleanCallWithIdentifierArg(1, 0, 'x')
      const singleNeg = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: boolArg,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.UnaryExpression(singleNeg)

      // Single ! does not match the double-bang pattern
      expect(reports.length).toBe(0)
    })

    test('should handle !!(x + y) - double bang of binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const binaryArg = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }

      const doubleBang = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: binaryArg,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(doubleBang)

      expect(reports.length).toBe(0)
    })

    test('should handle !!(foo()) - double bang of call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const callArg = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }

      const doubleBang = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: callArg,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(doubleBang)

      expect(reports.length).toBe(0)
    })

    test('should handle !!(!x) - triple negation', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const tripleNeg = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.UnaryExpression(tripleNeg)

      expect(reports.length).toBe(0)
    })
  })

  describe('case sensitivity', () => {
    test('should not report boolean(x) - lowercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report BOOLEAN(x) - uppercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BOOLEAN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should only match exact case Boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      const outerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [innerCall],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(outerCall)

      // Inner is 'boolean' not 'Boolean', so it should NOT be detected as redundant
      expect(reports.length).toBe(0)
    })
  })

  describe('location extraction details', () => {
    test('should preserve exact start line and column from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(10, 20, 'x')
      const outer = createBooleanCall(10, 20, inner)

      visitor.CallExpression(outer)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should preserve exact end line and column from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(10, 20, 'x')
      const outer = createBooleanCall(10, 20, inner)

      visitor.CallExpression(outer)

      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('should handle location at origin (0, 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const inner = createBooleanCallWithIdentifierArg(0, 0, 'x')
      const outer = createBooleanCall(0, 0, inner)

      visitor.CallExpression(outer)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at very large values', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      visitor.UnaryExpression(createDoubleBangWithBooleanArg(9999, 9999))

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should handle missing loc gracefully for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const node = createDoubleBangWithBooleanArg(1, 0) as Record<string, unknown>
      delete node.loc

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      // Should have default location
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('rule definition shape', () => {
    test('should export the rule as default export', () => {
      const defaultExport = noExtraBooleanCastRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should have create as a function', () => {
      expect(typeof noExtraBooleanCastRule.create).toBe('function')
    })

    test('should have meta with all required properties', () => {
      const meta = noExtraBooleanCastRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
    })

    test('should have docs with all required properties', () => {
      const docs = noExtraBooleanCastRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
    })
  })

  describe('Boolean with various argument types not triggering report', () => {
    test('should report Boolean(!!Number(x)) - !! produces boolean, wrapping in Boolean is redundant', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerNumber = createNumberCallWithIdentifierArg(1, 0)
      const dblBang = createDoubleBang(1, 0, innerNumber)
      const outerBool = createBooleanCall(1, 10, dblBang)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should report Boolean(!!String(x)) - !! produces boolean, wrapping in Boolean is redundant', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const innerString = createStringCallWithIdentifierArg(1, 0)
      const dblBang = createDoubleBang(1, 0, innerString)
      const outerBool = createBooleanCall(1, 10, dblBang)

      visitor.CallExpression(outerBool)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Redundant boolean cast')
    })

    test('should not report Boolean(template literal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
            expressions: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(assignment expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(sequence expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'SequenceExpression',
            expressions: [
              { type: 'Literal', value: 1 },
              { type: 'Identifier', name: 'x' },
            ],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(update expression x++)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'UpdateExpression',
            operator: '++',
            prefix: false,
            argument: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(await expr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'promise' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(yield expr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'YieldExpression',
            argument: { type: 'Identifier', name: 'value' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(spread element)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'Identifier', name: 'arr' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(tagged template)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'TaggedTemplateExpression',
            tag: { type: 'Identifier', name: 'tag' },
            quasi: {
              type: 'TemplateLiteral',
              quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
              expressions: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(chain expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'ChainExpression',
            expression: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'prop' },
              computed: false,
              optional: true,
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report Boolean(class expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Boolean(Boolean(x))' })
      const visitor = noExtraBooleanCastRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [
          {
            type: 'ClassExpression',
            id: null,
            superClass: null,
            body: { type: 'ClassBody', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })
  })
})
