import { describe, test, expect, vi } from 'vitest'
import { noImplicitCoercionRule } from '../../../../src/rules/patterns/no-implicit-coercion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '+x;',
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

function createUnaryExpression(operator: string, argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, range?: [number, number]): unknown {
  const node: Record<string, unknown> = {
    type: 'Identifier',
    name,
  }
  if (range) {
    node.range = range
  }
  return node
}

function createLiteral(value: unknown, range?: [number, number]): unknown {
  const node: Record<string, unknown> = {
    type: 'Literal',
    value,
  }
  if (range) {
    node.range = range
  }
  return node
}

// ===========================================================================
// 1. META TESTS (20 tests)
// ===========================================================================
describe('no-implicit-coercion rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noImplicitCoercionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noImplicitCoercionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noImplicitCoercionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noImplicitCoercionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noImplicitCoercionRule.meta.schema).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(noImplicitCoercionRule.meta.fixable).toBe('code')
    })

    test('should mention coercion in description', () => {
      expect(noImplicitCoercionRule.meta.docs?.description.toLowerCase()).toContain('coercion')
    })

    test('should have a non-empty description', () => {
      expect(noImplicitCoercionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta property', () => {
      expect(noImplicitCoercionRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noImplicitCoercionRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noImplicitCoercionRule.create).toBe('function')
    })

    test('should have meta type as a string', () => {
      expect(typeof noImplicitCoercionRule.meta.type).toBe('string')
    })

    test('should have meta severity as a string', () => {
      expect(typeof noImplicitCoercionRule.meta.severity).toBe('string')
    })

    test('should have docs object defined', () => {
      expect(noImplicitCoercionRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noImplicitCoercionRule.meta.docs?.description).toBe('string')
    })

    test('should have docs category as string', () => {
      expect(typeof noImplicitCoercionRule.meta.docs?.category).toBe('string')
    })

    test('should have fixable as string', () => {
      expect(typeof noImplicitCoercionRule.meta.fixable).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noImplicitCoercionRule.meta.schema)).toBe(true)
    })

    test('should have docs with url property', () => {
      expect(noImplicitCoercionRule.meta.docs?.url).toBeDefined()
    })

    test('should mention Number in description', () => {
      expect(noImplicitCoercionRule.meta.docs?.description).toContain('Number')
    })
  })

  // ===========================================================================
  // 2. CREATE / VISITOR TESTS (8 tests)
  // ===========================================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return UnaryExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return BinaryExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor object on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noImplicitCoercionRule.create(context)
      const visitor2 = noImplicitCoercionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not return null from create', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should have exactly 2 visitor methods', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should accept context with default options', () => {
      const { context } = createMockContext()
      expect(() => noImplicitCoercionRule.create(context)).not.toThrow()
    })

    test('should accept context with custom options', () => {
      const { context } = createMockContext({ allowNumeric: true })
      expect(() => noImplicitCoercionRule.create(context)).not.toThrow()
    })
  })

  // ===========================================================================
  // 3. DETECTION TESTS (30 tests)
  // ===========================================================================
  describe('detecting number coercion with +x', () => {
    test('should report +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should report +str', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('str'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report +(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('value'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report +obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('obj'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report +result', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('result'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report +inputVal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('inputVal'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting boolean coercion with !!x', () => {
    test('should report !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Boolean')
    })

    test('should report !!value', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('value'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('flag'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!obj', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('obj'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!items', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('items'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!result', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('result'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting string coercion with x + ""', () => {
    test('should report x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('String')
    })

    test('should report "" + x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(''), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report num + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('num'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + num', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(''), createIdentifier('num'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('obj'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + result', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(''), createIdentifier('result'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report value + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('value'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report data + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('data'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + data', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(''), createIdentifier('data'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ===========================================================================
  // 4. NOT REPORTING TESTS (30 tests)
  // ===========================================================================
  describe('not reporting valid patterns', () => {
    test('should not report +0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report +1', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(1))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report !x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('!', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report !flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('!', createIdentifier('flag'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" + "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral('hello'), createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 1 + x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(1), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report -x (negation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('-', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ~x (bitwise not)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('~', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('typeof', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('void', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('delete', createIdentifier('obj'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x - y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x * y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('*', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x / y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('/', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x % y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('%', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x !== y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('!==', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x < y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x <= y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('<=', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x >= y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('>=', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x && y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('&&', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x || y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('||', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report +42 (literal not excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(42))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report +(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerUnary = createUnaryExpression('-', createLiteral(1))
      const node = createUnaryExpression('+', innerUnary)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report x + "hello" (non-empty string right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral('hello'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" + x (non-empty string left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral('hello'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + null', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(null))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ===========================================================================
  // 5. EDGE CASES (25 tests)
  // ===========================================================================
  describe('edge cases', () => {
    test('should handle null node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
    })

    test('should handle non-object node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(42)).not.toThrow()
    })

    test('should handle boolean node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createIdentifier('x'),
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
    })

    test('should handle BinaryExpression without left', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createLiteral(''),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression without right', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(''),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createLiteral(''),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should handle node with type mismatch (wrong type value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '+',
        argument: createIdentifier('x'),
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle +x where x is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const callNode = { type: 'CallExpression', callee: createIdentifier('fn') }
      const node = createUnaryExpression('+', callNode)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle +x where x is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const memberNode = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }
      const node = createUnaryExpression('+', memberNode)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle !!x where x is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const callNode = { type: 'CallExpression', callee: createIdentifier('fn') }
      const innerNot = createUnaryExpression('!', callNode)
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with nested expression left', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const nested = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const node = createBinaryExpression('+', nested, createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with nested expression right', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const nested = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const node = createBinaryExpression('+', createLiteral(''), nested)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ! followed by non-unary expression (!+x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerPlus = createUnaryExpression('+', createIdentifier('x'))
      const node = createUnaryExpression('!', innerPlus)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested !! pattern (!!(!x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      const doubleNot = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(doubleNot)

      expect(reports.length).toBe(1)
    })

    test('should handle +x with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(true))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ===========================================================================
  // 6. LOCATION TESTS (15 tests)
  // ===========================================================================
  describe('location reporting', () => {
    test('should report correct location for +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'), 25, 10)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location for +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'), 5, 3)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'), 10, 5)
      const node = createUnaryExpression('!', innerNot, 10, 5)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(''), 7, 2)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct end location for x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(''), 3, 4)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {},
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property reporting default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('x'),
        right: createLiteral(''),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location for BinaryExpression with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(''), 500, 30)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(30)
    })

    test('should handle location for UnaryExpression at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'), 0, 0)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location coordinates', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'), 42, 17)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start).toEqual({ line: 42, column: 17 })
      expect(reports[0].loc?.end).toEqual({ line: 42, column: 22 })
    })
  })

  // ===========================================================================
  // 7. MESSAGE QUALITY TESTS (10 tests)
  // ===========================================================================
  describe('message quality', () => {
    test('should mention Number for +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message).toContain('Number')
    })

    test('should mention Boolean for !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      expect(reports[0].message).toContain('Boolean')
    })

    test('should mention String for x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )

      expect(reports[0].message).toContain('String')
    })

    test('should mention implicit for number coercion', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message.toLowerCase()).toContain('implicit')
    })

    test('should mention explicit as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message.toLowerCase()).toContain('explicit')
    })

    test('should mention implicit for boolean coercion', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      expect(reports[0].message.toLowerCase()).toContain('implicit')
    })

    test('should mention implicit for string coercion', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )

      expect(reports[0].message.toLowerCase()).toContain('implicit')
    })

    test('should contain +x pattern in number coercion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message).toContain('+x')
    })

    test('should contain !!x pattern in boolean coercion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      expect(reports[0].message).toContain('!!x')
    })

    test('should contain x + "" pattern in string coercion message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )

      expect(reports[0].message).toContain('x + ""')
    })
  })

  // ===========================================================================
  // 8. MULTIPLE REPORTS TESTS (10 tests)
  // ===========================================================================
  describe('multiple reports', () => {
    test('should report separately for multiple +x calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('y')))

      expect(reports.length).toBe(2)
    })

    test('should report separately for !!x and +y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('y')))

      expect(reports.length).toBe(2)
    })

    test('should report separately for x + "" and y + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('y'), createLiteral('')),
      )

      expect(reports.length).toBe(2)
    })

    test('should report separately for mixed coercion types', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      const innerNot = createUnaryExpression('!', createIdentifier('y'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('z'), createLiteral('')),
      )

      expect(reports.length).toBe(3)
    })

    test('should have correct messages for mixed reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      const innerNot = createUnaryExpression('!', createIdentifier('y'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('z'), createLiteral('')),
      )

      expect(reports[0].message).toContain('Number')
      expect(reports[1].message).toContain('Boolean')
      expect(reports[2].message).toContain('String')
    })

    test('should handle interleaved valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))
      visitor.UnaryExpression(createUnaryExpression('-', createIdentifier('y')))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('z')))

      expect(reports.length).toBe(2)
    })

    test('should handle many sequential reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(createUnaryExpression('+', createIdentifier(`v${i}`)))
      }

      expect(reports.length).toBe(10)
    })

    test('should report for +x in different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x'), 1, 0))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('y'), 5, 10))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('z'), 10, 3))

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should not report for valid nodes mixed with invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('-', createIdentifier('x')))
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('y')))
      visitor.UnaryExpression(createUnaryExpression('~', createIdentifier('z')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should handle BinaryExpression interleaved with UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('y'), createLiteral('')),
      )
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('z')))

      expect(reports.length).toBe(3)
    })
  })

  // ===========================================================================
  // 9. CONTEXT TESTS (10 tests)
  // ===========================================================================
  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should work with long source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = +y; const z = !!w;',
      )
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should not call report for valid node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('-', createIdentifier('x')))

      expect(reports.length).toBe(0)
    })

    test('should handle undefined options config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '+x;',
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

      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should use context getSource for fix text', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const result = +val;')
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('val', [16, 19]),
        prefix: true,
        range: [15, 19] as [number, number],
        loc: {
          start: { line: 1, column: 15 },
          end: { line: 1, column: 19 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Number(val)')
    })

    test('should provide fix for boolean coercion when range is available', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const r = !!val;')
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('val', [12, 15]),
          prefix: true,
        },
        prefix: true,
        range: [10, 15] as [number, number],
        loc: {
          start: { line: 1, column: 10 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('Boolean(val)')
    })

    test('should provide fix for string coercion when range is available', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'val + ""')
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('val', [0, 3]),
        right: createLiteral(''),
        range: [0, 8] as [number, number],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 8 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('String(val)')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ===========================================================================
  // 10. PARAMETERIZED TESTS - EXPANDED AS INDIVIDUAL test() CALLS (56+ tests)
  // ===========================================================================
  describe('unary operator coverage', () => {
    test('should report +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should report +value', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('value')))
      expect(reports.length).toBe(1)
    })

    test('should report +str', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('str')))
      expect(reports.length).toBe(1)
    })

    test('should report +num', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('num')))
      expect(reports.length).toBe(1)
    })

    test('should report +data', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('data')))
      expect(reports.length).toBe(1)
    })

    test('should not report !x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report !flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('!', createIdentifier('flag')))
      expect(reports.length).toBe(0)
    })

    test('should not report -x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('-', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report -num', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('-', createIdentifier('num')))
      expect(reports.length).toBe(0)
    })

    test('should not report ~x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('~', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report ~bits', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('~', createIdentifier('bits')))
      expect(reports.length).toBe(0)
    })

    test('should not report typeof x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('typeof', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report void x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('void', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report delete x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('delete', createIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  describe('binary operator coverage', () => {
    test('should report x + "" (concat with empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report x - "" (subtraction)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x * "" (multiplication)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x / "" (division)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x % "" (modulo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('%', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x === "" (strict equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x !== "" (strict inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x == "" (equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x != "" (inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x < "" (less than)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x > "" (greater than)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('>', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x <= "" (less than or equal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x >= "" (greater than or equal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x && "" (logical and)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('&&', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x || "" (logical or)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('||', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x ** "" (exponentiation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x & "" (bitwise and)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('&', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x | "" (bitwise or)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('|', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x ^ "" (bitwise xor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('^', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x << "" (left shift)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('<<', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x >> "" (right shift)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('>>', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x >>> "" (unsigned right shift)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('>>>', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x in "" (in operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('in', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report x instanceof "" (instanceof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('instanceof', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('string coercion operand combinations', () => {
    test('should report Identifier + EmptyString', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report EmptyString + Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(''), createIdentifier('x')),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report Identifier + NonEmptyString', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('hello')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report NonEmptyString + Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral('hello'), createIdentifier('x')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report Identifier + Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral(42)),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report Number + Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(42), createIdentifier('x')),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report Identifier + Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createIdentifier('y')),
      )
      expect(reports.length).toBe(0)
    })

    test('should report EmptyString + EmptyString', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(''), createLiteral('')))
      expect(reports.length).toBe(1)
    })
  })

  describe('number literal exclusions for +operator', () => {
    test('should not report +0 (zero excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(0)))
      expect(reports.length).toBe(0)
    })

    test('should not report +1 (one excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(1)))
      expect(reports.length).toBe(0)
    })

    test('should report +42 (forty-two not excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('should report +(-1) (negative one not excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(-1)))
      expect(reports.length).toBe(1)
    })

    test('should report +(3.14) (pi not excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(3.14)))
      expect(reports.length).toBe(1)
    })

    test('should report +(100) (hundred not excluded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(100)))
      expect(reports.length).toBe(1)
    })

    test('should not report +(-0) (negative zero is zero)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createLiteral(-0)))
      expect(reports.length).toBe(0)
    })
  })

  describe('message content by coercion type', () => {
    test('number coercion message should contain Number', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))
      expect(reports[0].message).toContain('Number')
    })

    test('boolean coercion message should contain Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      const inner = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', inner))
      expect(reports[0].message).toContain('Boolean')
    })

    test('string coercion message should contain String', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )
      expect(reports[0].message).toContain('String')
    })
  })
})
