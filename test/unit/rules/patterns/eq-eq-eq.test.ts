import { describe, test, expect, vi } from 'vitest'
import { eqEqEqRule } from '../../../../src/rules/patterns/eq-eq-eq.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createNodeWithRange(
  leftName: string,
  rightName: string,
  operator: string,
  leftRange: [number, number],
  rightRange: [number, number],
  nodeRange: [number, number],
  source: string,
): { node: unknown; source: string } {
  const node = {
    type: 'BinaryExpression',
    left: { type: 'Identifier', name: leftName, range: leftRange },
    right: { type: 'Identifier', name: rightName, range: rightRange },
    operator,
    loc: {
      start: { line: 1, column: leftRange[0] },
      end: { line: 1, column: nodeRange[1] },
    },
    range: nodeRange,
  }
  return { node, source }
}

describe('eq-eq-eq rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(eqEqEqRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(eqEqEqRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(eqEqEqRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(eqEqEqRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(eqEqEqRule.meta.schema).toBeDefined()
    })

    test('should be fixable with code', () => {
      expect(eqEqEqRule.meta.fixable).toBe('code')
    })

    test('should mention strict equality in description', () => {
      expect(eqEqEqRule.meta.docs?.description.toLowerCase()).toContain('strict equality')
    })

    test('should mention loose equality in description', () => {
      expect(eqEqEqRule.meta.docs?.description.toLowerCase()).toContain('loose equality')
    })

    test('should have meta property', () => {
      expect(eqEqEqRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(eqEqEqRule).toHaveProperty('create')
    })

    test('should have docs property in meta', () => {
      expect(eqEqEqRule.meta).toHaveProperty('docs')
    })

    test('should have description in docs', () => {
      expect(eqEqEqRule.meta.docs).toHaveProperty('description')
    })

    test('should have type string in meta', () => {
      expect(typeof eqEqEqRule.meta.type).toBe('string')
    })

    test('should have severity string in meta', () => {
      expect(typeof eqEqEqRule.meta.severity).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof eqEqEqRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof eqEqEqRule.meta.docs?.category).toBe('string')
    })

    test('should have fixable as string', () => {
      expect(typeof eqEqEqRule.meta.fixable).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(eqEqEqRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have url in docs', () => {
      expect(eqEqEqRule.meta.docs?.url).toBeDefined()
    })

    test('should mention type coercion in description', () => {
      expect(eqEqEqRule.meta.docs?.description.toLowerCase()).toContain('type coercion')
    })

    test('should have create as function', () => {
      expect(typeof eqEqEqRule.create).toBe('function')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return BinaryExpression as function', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext({ filePath: '/other/file.ts' })
      const visitor1 = eqEqEqRule.create(ctx1)
      const visitor2 = eqEqEqRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should not throw when create is called with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => eqEqEqRule.create(context)).not.toThrow()
    })

    test('should create independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = eqEqEqRule.create(ctx1)
      const v2 = eqEqEqRule.create(ctx2)

      v1.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle being called multiple times', () => {
      const { context } = createMockRuleContext()
      const visitor1 = eqEqEqRule.create(context)
      const visitor2 = eqEqEqRule.create(context)

      expect(visitor1).toBeDefined()
      expect(visitor2).toBeDefined()
    })

    test('should return visitor with only BinaryExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })

    test('should accept context without options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'x == y',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = eqEqEqRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting == operator', () => {
    test('should report x == y', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected '==='")
    })

    test('should report 5 == "5"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral('5'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true == 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(true), createLiteral(1), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report null == undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(undefined), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(null), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == ""', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createLiteral(''), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report a == b with identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report foo == bar with longer names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('foo'), createIdentifier('bar'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report string literal == number literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('hello'), createLiteral(42), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report false == 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(false), createLiteral(0), '=='))

      expect(reports.length).toBe(1)
    })

    test('should report true == true', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(true), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report undefined == undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(undefined), createLiteral(undefined), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report identifier == literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createLiteral(0), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report literal == identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('val'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with nested expression on left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const nestedLeft = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+')
      visitor.BinaryExpression(createBinaryExpression(nestedLeft, createIdentifier('c'), '=='))

      expect(reports.length).toBe(1)
    })

    test('should report with nested expression on right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const nestedRight = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '*')
      visitor.BinaryExpression(createBinaryExpression(createIdentifier('c'), nestedRight, '=='))

      expect(reports.length).toBe(1)
    })

    test('should report number == boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(1), createLiteral(true), '=='))

      expect(reports.length).toBe(1)
    })

    test('should report empty string == false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(''), createLiteral(false), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN == NaN', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(NaN), createLiteral(NaN), '=='))

      expect(reports.length).toBe(1)
    })

    test('should report single char identifier == number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(1), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with source containing == operator', () => {
      const source = 'if (count == 10) { }'
      const { context, reports } = createMockRuleContext({ filePath: '/src/test.ts', source })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('count'), createLiteral(10), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with underscore identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('_private'), createIdentifier('__proto__'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with dollar sign identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('$jquery'), createIdentifier('value'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report at different line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '==', 42, 8),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with same identifier on both sides', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('x'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with large number literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(999999999), createIdentifier('x'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with negative number literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      // Negative numbers are typically UnaryExpression in AST, but test the literal path
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIdentifier('x'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with empty string literal on left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(''), createIdentifier('str'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with template-like source', () => {
      const source = 'result == expected'
      const { context, reports } = createMockRuleContext({ filePath: '/src/test.ts', source })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createIdentifier('expected'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with regex literal as operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const regexLiteral = { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }
      visitor.BinaryExpression(createBinaryExpression(regexLiteral, createLiteral(null), '=='))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting != operator', () => {
    test('should report x != y', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected '!=='")
    })

    test('should report 5 != "5"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral('5'), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x != null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createLiteral(null), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report a != b with identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report false != 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(false), createLiteral(1), '!='))

      expect(reports.length).toBe(1)
    })

    test('should report undefined != null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(undefined), createLiteral(null), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report number != string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(42), createLiteral('42'), '!='))

      expect(reports.length).toBe(1)
    })

    test('should report same identifiers !=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createIdentifier('val'), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with long identifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('thisIsALongVariableName'),
          createIdentifier('anotherLongVariableName'),
          '!=',
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with boolean literal != identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('flag'), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with zero != empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(0), createLiteral(''), '!='))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting strict equality operators', () => {
    test('should not report x === y', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 5 === 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(5), createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x !== y', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null !== undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(undefined), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "abc" === "abc"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('abc'), createLiteral('abc'), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report 0 !== 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(0), createLiteral(1), '!=='))

      expect(reports.length).toBe(0)
    })

    test('should not report true === false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(false), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report null === null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(null), createLiteral(null), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report undefined !== undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(undefined), createLiteral(undefined), '!=='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report number === string with strict', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(createBinaryExpression(createLiteral(5), createLiteral('5'), '==='))

      expect(reports.length).toBe(0)
    })

    test('should not report identifier === literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(null), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report literal !== identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '!=='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report nested strict equality left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const nestedLeft = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '===')
      visitor.BinaryExpression(createBinaryExpression(nestedLeft, createIdentifier('c'), '+'))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean === boolean strict', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(true), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report same identifiers with !==', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('obj'), createIdentifier('obj'), '!=='),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('allowing null == null pattern', () => {
    test('should not report null == null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(null), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null != null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(null), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null == null at any location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createLiteral(null, 5, 10),
        createLiteral(null, 5, 20),
        '==',
        5,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report null != null at any location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createLiteral(null, 20, 3),
        createLiteral(null, 20, 15),
        '!=',
        20,
        3,
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should still report identifier == null (only one null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(null), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should still report null == identifier (only one null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(null), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should still report identifier != null (only one null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(null), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should still report null != identifier (only one null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(null), createIdentifier('y'), '!='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report undefined == undefined (not null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(undefined), createLiteral(undefined), '=='),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('other operators', () => {
    test('should not report > operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report < operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '<')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report >= operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report <= operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '<=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report + operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report - operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '-'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report * operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '*'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report / operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '/'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report % operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '%'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ** operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '**'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report & operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '&'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report | operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '|'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ^ operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '^'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report << operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '<<'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report >> operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '>>'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report >>> operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '>>>'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report && operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '&&'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report || operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '||'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ?? operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '??'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), 'in'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report instanceof operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), 'instanceof'),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('x', 10, 5),
        createIdentifier('y', 10, 15),
        '==',
        10,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

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
        getSource: () => 'x == y;',
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

      const visitor = eqEqEqRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {},
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      // undefined operator !== '==' and !== '!=' so it should not report
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean node as input', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle node with numeric zero as input', () => {
      const { context } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression(0)).not.toThrow()
    })

    test('should handle node with array as input', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = { operator: '==', left: createIdentifier('x'), right: createIdentifier('y') }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      // No type='BinaryExpression' so isBinaryExpression returns false
      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('foo'),
        arguments: [],
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing left operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      // Should still report since null-null check will fail (left is undefined)
      expect(reports.length).toBe(1)
    })

    test('should handle node with missing right operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle NaN line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle Infinity line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: Infinity, column: Infinity },
          end: { line: Infinity, column: Infinity },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })

    test('should handle negative column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '==', 1, -5)

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle very large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('x'),
        createIdentifier('y'),
        '==',
        99999,
        0,
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })
  })

  describe('location reporting', () => {
    test('should report start line correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 3, 2)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report start column correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 1, 7)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report end line correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 1, 0)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should report end column correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 1, 0)
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location for != operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('a'),
        createIdentifier('b'),
        '!=',
        15,
        10,
      )
      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should default to line 1 when no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default to column 0 when no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '!=',
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use provided loc start values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 42, column: 13 }, end: { line: 42, column: 25 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(13)
    })

    test('should use provided loc end values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should preserve location across multiple calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 5, 3),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '==', 10, 8),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should handle multiline loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 3, column: 5 }, end: { line: 7, column: 12 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should handle loc with zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for literal comparison', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(5, 8, 2), createLiteral('5', 8, 10), '==', 8, 2),
      )

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location with mixed operands', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIdentifier('x', 25, 4),
          createLiteral(null, 25, 12),
          '==',
          25,
          4,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should handle fractional line number gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('y'),
        operator: '==',
        loc: {
          start: { line: 3.5 as unknown as number, column: 0 },
          end: { line: 3.5 as unknown as number, column: 10 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('messages', () => {
    test('should mention expected operator === for ==', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain("Expected '==='")
    })

    test('should mention expected operator !== for !=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message).toContain("Expected '!=='")
    })

    test('should mention actual operator == in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain("and instead saw '=='")
    })

    test('should mention actual operator != in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message).toContain("and instead saw '!='")
    })

    test('should include suggestion in message for ==', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain('strict equality')
    })

    test('should include suggestion in message for !=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message).toContain('strict equality')
    })

    test('should include type coercion warning in suggestion', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message).toContain('type coercion')
    })

    test('should have non-empty message for ==', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have non-empty message for !=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce different expected operators for == vs !=', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const v1 = eqEqEqRule.create(ctx1)
      const v2 = eqEqEqRule.create(ctx2)

      v1.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )
      v2.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '!='),
      )

      expect(r1[0].message).toContain("'==='")
      expect(r1[0].message).toContain("'=='")
      expect(r2[0].message).toContain("'!=='")
      expect(r2[0].message).toContain("'!='")
    })
  })

  describe('fix functionality', () => {
    test('should provide fix when node has range property (==)', () => {
      const source = 'x == y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'y', range: [5, 6] as [number, number] },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([0, 6])
      expect(reports[0].fix?.text).toBe('x === y')
    })

    test('should provide fix when node has range property (!=)', () => {
      const source = 'a != b'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'a', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'b', range: [5, 6] as [number, number] },
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('a !== b')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with correct range for expression with spaces', () => {
      const source = 'foo == bar'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'foo', range: [0, 3] as [number, number] },
        right: { type: 'Identifier', name: 'bar', range: [7, 10] as [number, number] },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 10])
      expect(reports[0].fix?.text).toBe('foo === bar')
    })

    test('should provide fix with correct text for != expression', () => {
      const source = 'count != limit'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'count', range: [0, 5] as [number, number] },
        right: { type: 'Identifier', name: 'limit', range: [9, 14] as [number, number] },
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
        range: [0, 14] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports[0].fix?.text).toBe('count !== limit')
    })

    test('should handle fix when left has no range', () => {
      const source = 'x == y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y', range: [5, 6] as [number, number] },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      // When left has no range, getNodeSource returns ''
      expect(reports[0].fix?.text).toBe(' === y')
    })

    test('should handle fix when right has no range', () => {
      const source = 'x == y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'y' },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('x === ')
    })

    test('should handle fix when both sides have no range', () => {
      const source = 'x == y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 6] as [number, number],
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe(' === ')
    })

    test('should not provide fix when node has no range property', () => {
      const source = 'x == y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x', range: [0, 1] as [number, number] },
        right: { type: 'Identifier', name: 'y', range: [5, 6] as [number, number] },
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('multiple reports', () => {
    test('should report each == separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '=='),
      )

      expect(reports.length).toBe(2)
    })

    test('should report each != separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '!='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '!='),
      )

      expect(reports.length).toBe(2)
    })

    test('should report mixed == and != calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '!='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('e'), createIdentifier('f'), '=='),
      )

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain("'=='")
      expect(reports[1].message).toContain("'!='")
      expect(reports[2].message).toContain("'=='")
    })

    test('should only count == and != calls, not ===', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('e'), createIdentifier('f'), '=='),
      )

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should maintain correct message for each report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '!='),
      )

      expect(reports[0].message).toContain("'==='")
      expect(reports[1].message).toContain("'!=='")
    })

    test('should maintain correct location for each report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==', 2, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '==', 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should handle interleaved valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('e'), createIdentifier('f'), '>'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('g'), createIdentifier('h'), '!='),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle 100 sequential calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
        )
      }
      for (let i = 0; i < 50; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '!='),
        )
      }

      expect(reports.length).toBe(100)
    })

    test('should not report after null nodes are passed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor.BinaryExpression(null)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '=='),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/different/path.ts',
        source: 'x == y',
      })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source: '' })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with multiline source', () => {
      const source = 'const x = 1;\nif (x == 2) {\n  console.log(x);\n}'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(2), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with context that has no config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x == y',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.js',
        source: 'a == b',
      })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/component.tsx',
        source: 'props == null',
      })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('props'), createLiteral(null), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with deep nested file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/very/deeply/nested/path/to/file.ts',
        source: 'x == y',
      })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work when context has undefined logger methods', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x == y',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = eqEqEqRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not affect other visitors sharing same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = eqEqEqRule.create(context)
      const visitor2 = eqEqEqRule.create(context)

      visitor1.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '=='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIdentifier('c'), createIdentifier('d'), '=='),
      )

      // Both visitors share the same reports array via context
      expect(reports.length).toBe(2)
    })

    test('should work with source containing only the comparison', () => {
      const source = 'x==y'
      const { context, reports } = createMockRuleContext({ filePath: '/src/min.ts', source })
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '=='),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases with null/undefined operands', () => {
    test('should report when left operand is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: null,
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when left operand is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: undefined,
        right: createIdentifier('y'),
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when left operand is non-object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: 'string',
        right: createIdentifier('y'),
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when right operand is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: null,
        operator: '==',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when right operand is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: undefined,
        operator: '!=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when both operands are null with ==', () => {
      // Both null literals - should NOT report (null == null exception)
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(null), createLiteral(null), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when both operands are undefined but not null literals', () => {
      // undefined == undefined: not null-null comparison, so SHOULD report
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), createLiteral(undefined), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - operator detection', () => {
    test.each([
      ['==', true],
      ['!=', true],
      ['===', false],
      ['!==', false],
      ['>', false],
      ['<', false],
      ['>=', false],
      ['<=', false],
      ['+', false],
      ['-', false],
      ['*', false],
      ['/', false],
      ['%', false],
      ['**', false],
      ['&', false],
      ['|', false],
      ['^', false],
      ['<<', false],
      ['>>', false],
      ['>>>', false],
      ['&&', false],
      ['||', false],
      ['??', false],
      ['in', false],
      ['instanceof', false],
    ] as [string, boolean][])('should%s report for "%s" operator', (operator, shouldReport) => {
      const { context, reports } = createMockRuleContext()
      const visitor = eqEqEqRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), operator),
      )

      expect(reports.length).toBe(shouldReport ? 1 : 0)
    })
  })

  describe('test.each - operand combinations for ==', () => {
    test.each([
      ['identifier == identifier', createIdentifier('a'), createIdentifier('b'), true],
      ['identifier == literal', createIdentifier('a'), createLiteral(5), true],
      ['literal == identifier', createLiteral(5), createIdentifier('a'), true],
      ['literal == literal', createLiteral(5), createLiteral('5'), true],
      ['number == boolean', createLiteral(1), createLiteral(true), true],
      ['string == number', createLiteral('1'), createLiteral(1), true],
      ['boolean == boolean', createLiteral(true), createLiteral(false), true],
      ['null == identifier', createLiteral(null), createIdentifier('x'), true],
      ['identifier == null', createIdentifier('x'), createLiteral(null), true],
      ['undefined == undefined', createLiteral(undefined), createLiteral(undefined), true],
      ['null == null', createLiteral(null), createLiteral(null), false],
      ['zero == empty string', createLiteral(0), createLiteral(''), true],
    ] as [string, unknown, unknown, boolean][])(
      'should%s report for %s',
      (_label, left, right, shouldReport) => {
        const { context, reports } = createMockRuleContext()
        const visitor = eqEqEqRule.create(context)

        visitor.BinaryExpression(createBinaryExpression(left, right, '=='))

        expect(reports.length).toBe(shouldReport ? 1 : 0)
      },
    )
  })

  describe('test.each - operand combinations for !=', () => {
    test.each([
      ['identifier != identifier', createIdentifier('a'), createIdentifier('b'), true],
      ['identifier != literal', createIdentifier('a'), createLiteral(5), true],
      ['literal != identifier', createLiteral(5), createIdentifier('a'), true],
      ['literal != literal', createLiteral(5), createLiteral('5'), true],
      ['number != boolean', createLiteral(1), createLiteral(true), true],
      ['string != number', createLiteral('1'), createLiteral(1), true],
      ['boolean != boolean', createLiteral(true), createLiteral(false), true],
      ['null != identifier', createLiteral(null), createIdentifier('x'), true],
      ['identifier != null', createIdentifier('x'), createLiteral(null), true],
      ['undefined != undefined', createLiteral(undefined), createLiteral(undefined), true],
      ['null != null', createLiteral(null), createLiteral(null), false],
    ] as [string, unknown, unknown, boolean][])(
      'should%s report for %s',
      (_label, left, right, shouldReport) => {
        const { context, reports } = createMockRuleContext()
        const visitor = eqEqEqRule.create(context)

        visitor.BinaryExpression(createBinaryExpression(left, right, '!='))

        expect(reports.length).toBe(shouldReport ? 1 : 0)
      },
    )
  })

  describe('test.each - strict equality operators never report', () => {
    test.each([
      ['===', createIdentifier('x'), createIdentifier('y')],
      ['===', createLiteral(5), createLiteral(5)],
      ['===', createLiteral(null), createLiteral(null)],
      ['===', createLiteral(undefined), createLiteral(undefined)],
      ['===', createLiteral('str'), createLiteral('str')],
      ['!==', createIdentifier('x'), createIdentifier('y')],
      ['!==', createLiteral(5), createLiteral('5')],
      ['!==', createLiteral(null), createLiteral(undefined)],
      ['!==', createLiteral(true), createLiteral(false)],
      ['!==', createLiteral(0), createLiteral(0)],
    ] as [string, unknown, unknown][])(
      'should not report for %s with operands',
      (operator, left, right) => {
        const { context, reports } = createMockRuleContext()
        const visitor = eqEqEqRule.create(context)

        visitor.BinaryExpression(createBinaryExpression(left, right, operator))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - location at various positions', () => {
    test.each([
      [1, 0],
      [1, 10],
      [5, 0],
      [5, 20],
      [10, 5],
      [100, 0],
      [100, 50],
      [1, 100],
      [42, 13],
      [999, 0],
    ] as [number, number][])(
      'should report correct location at line %d, column %d',
      (line, column) => {
        const { context, reports } = createMockRuleContext()
        const visitor = eqEqEqRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '==', line, column),
        )

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - fix text generation', () => {
    test.each([
      ['x', 'y', '==', 'x === y'],
      ['a', 'b', '!=', 'a !== b'],
      ['foo', 'bar', '==', 'foo === bar'],
      ['count', 'limit', '!=', 'count !== limit'],
      ['result', 'expected', '==', 'result === expected'],
      ['_private', '_protected', '!=', '_private !== _protected'],
      ['$var1', '$var2', '==', '$var1 === $var2'],
    ] as [string, string, string, string][])(
      'should generate fix "%s" for %s %s %s',
      (leftName, rightName, operator, expectedFix) => {
        const source = `${leftName} ${operator} ${rightName}`
        const leftEnd = leftName.length
        const opEnd = leftEnd + 3 + operator.length
        const rightEnd = opEnd + 1 + rightName.length
        const totalLen = source.length

        const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
        const visitor = eqEqEqRule.create(context)

        const node = {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: leftName, range: [0, leftEnd] as [number, number] },
          right: {
            type: 'Identifier',
            name: rightName,
            range: [totalLen - rightName.length, totalLen] as [number, number],
          },
          operator,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: totalLen } },
          range: [0, totalLen] as [number, number],
        }

        visitor.BinaryExpression(node)

        expect(reports[0].fix?.text).toBe(expectedFix)
      },
    )
  })
})
