import { describe, test, expect, vi } from 'vitest'
import { noNestedTernaryRule } from '../../../../src/rules/patterns/no-nested-ternary.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMockContextWithSource(
  source: string,
  options: Record<string, unknown> = {},
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
    getFilePath: () => '/src/file.ts',
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

function createConditionalExpression(
  testNode: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: testNode,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createConditionalExpressionWithRange(
  testNode: unknown,
  consequent: unknown,
  alternate: unknown,
  range: [number, number],
): unknown {
  return {
    type: 'ConditionalExpression',
    test: testNode,
    consequent,
    alternate,
    range,
    loc: {
      start: { line: 1, column: range[0] },
      end: { line: 1, column: range[1] },
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

function createIdentifierWithRange(name: string, range: [number, number]): unknown {
  return {
    type: 'Identifier',
    name,
    range,
  }
}

function createLiteral(value: string | number | boolean, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

function createLiteralWithRange(value: unknown, range: [number, number]): unknown {
  return {
    type: 'Literal',
    value,
    range,
  }
}

// Helper for creating a simple nested ternary
function createNestedTernary(
  outerConditionName: string,
  innerConditionName: string,
  branch: 'consequent' | 'alternate',
  line = 1,
  column = 0,
): unknown {
  const innerTernary = createConditionalExpression(
    createIdentifier(innerConditionName, line, column + 4),
    createLiteral(1, line, column + 8),
    createLiteral(2, line, column + 12),
    line,
    column + 4,
  )

  if (branch === 'consequent') {
    return createConditionalExpression(
      createIdentifier(outerConditionName, line, column),
      innerTernary,
      createLiteral(3, line, column + 16),
      line,
      column,
    )
  }
  return createConditionalExpression(
    createIdentifier(outerConditionName, line, column),
    createLiteral(3, line, column + 4),
    innerTernary,
    line,
    column,
  )
}

describe('no-nested-ternary rule', () => {
  // ============================================================
  // META TESTS (20)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noNestedTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noNestedTernaryRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noNestedTernaryRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(noNestedTernaryRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noNestedTernaryRule.meta.schema).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(noNestedTernaryRule.meta.fixable).toBe('code')
    })

    test('should mention ternary in description', () => {
      expect(noNestedTernaryRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention nesting in description', () => {
      expect(noNestedTernaryRule.meta.docs?.description.toLowerCase()).toContain('nest')
    })

    test('should have a docs property', () => {
      expect(noNestedTernaryRule.meta.docs).toBeDefined()
    })

    test('should have description as a non-empty string', () => {
      expect(typeof noNestedTernaryRule.meta.docs?.description).toBe('string')
      expect(noNestedTernaryRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should not be deprecated', () => {
      expect(noNestedTernaryRule.meta.deprecated).toBeFalsy()
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noNestedTernaryRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noNestedTernaryRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noNestedTernaryRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noNestedTernaryRule.meta.schema).toEqual([])
    })

    test('should have fixable as a valid value', () => {
      expect(['code', 'whitespace']).toContain(noNestedTernaryRule.meta.fixable)
    })

    test('should have docs with url property', () => {
      expect(noNestedTernaryRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noNestedTernaryRule.meta.docs?.url).toBe('string')
    })

    test('should mention if-else or switch in description', () => {
      const desc = noNestedTernaryRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('if-else') || desc.includes('switch')).toBe(true)
    })

    test('should not require type checking', () => {
      expect(noNestedTernaryRule.meta.requiresTypeChecking).toBeFalsy()
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8)
  // ============================================================
  describe('create', () => {
    test('should return visitor object', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with ConditionalExpression method', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
    })

    test('ConditionalExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor1 = noNestedTernaryRule.create(context)
      const visitor2 = noNestedTernaryRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      expect(() => noNestedTernaryRule.create(context)).not.toThrow()
    })

    test('should accept context with undefined config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x ? y : z',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => noNestedTernaryRule.create(context)).not.toThrow()
    })

    test('visitor ConditionalExpression should not throw with valid input', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(2),
      )
      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should accept context with various file paths', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;', filePath: '/custom/path.ts' })
      expect(() => noNestedTernaryRule.create(context)).not.toThrow()
    })
  })

  // ============================================================
  // DETECTION TESTS (30)
  // ============================================================
  describe('detecting nested ternary in consequent', () => {
    test('should report ternary nested in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createNestedTernary('x', 'y', 'consequent')
      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nest')
    })

    test('should report deeply nested ternary in consequent (2 levels)', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), level1, createLiteral(3))
      const level3 = createConditionalExpression(createIdentifier('c'), level2, createLiteral(4))

      visitor.ConditionalExpression(level3)

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with identifier consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createIdentifier('a'),
        createIdentifier('b'),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral(3),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with boolean literal consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(true),
        createLiteral(false),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with string literal consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral('a'),
        createLiteral('b'),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral('c'),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number literal consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(0),
        createLiteral(1),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral(2),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with call expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }
      const innerTernary = createConditionalExpression(callExpr, createLiteral(1), createLiteral(2))
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral(3),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with binary expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '>',
        left: createIdentifier('a'),
        right: createLiteral(0),
      }
      const innerTernary = createConditionalExpression(
        binaryExpr,
        createLiteral(1),
        createLiteral(2),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral(3),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting nested ternary in alternate', () => {
    test('should report ternary nested in alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createNestedTernary('x', 'y', 'alternate')
      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nest')
    })

    test('should report deeply nested ternary in alternate (2 levels)', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), createLiteral(3), level1)
      const level3 = createConditionalExpression(createIdentifier('c'), createLiteral(4), level2)

      visitor.ConditionalExpression(level3)

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with identifier alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createIdentifier('a'),
        createIdentifier('b'),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(3),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with boolean literal alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(true),
        createLiteral(false),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with string literal alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral('a'),
        createLiteral('b'),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral('c'),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number literal alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(0),
        createLiteral(1),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(2),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with call expression test in alternate branch', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }
      const innerTernary = createConditionalExpression(callExpr, createLiteral(1), createLiteral(2))
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(3),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with logical expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        operator: '&&',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }
      const innerTernary = createConditionalExpression(
        logicalExpr,
        createLiteral(1),
        createLiteral(2),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(3),
        innerTernary,
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting nested ternary in both branches', () => {
    test('should report ternary nested in both consequent and alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary1 = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(1),
        createLiteral(2),
      )
      const innerTernary2 = createConditionalExpression(
        createIdentifier('z'),
        createLiteral(3),
        createLiteral(4),
      )
      const node = createConditionalExpression(createIdentifier('x'), innerTernary1, innerTernary2)

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with nested ternary having identical conditions', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary1 = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(2),
      )
      const innerTernary2 = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(3),
        createLiteral(4),
      )
      const node = createConditionalExpression(createIdentifier('x'), innerTernary1, innerTernary2)

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting deeply nested ternaries', () => {
    test('should report 3-level deep nesting in consequent chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), level1, createLiteral(3))
      const level3 = createConditionalExpression(createIdentifier('c'), level2, createLiteral(4))
      const level4 = createConditionalExpression(createIdentifier('d'), level3, createLiteral(5))

      visitor.ConditionalExpression(level4)
      expect(reports.length).toBe(1)
    })

    test('should report 3-level deep nesting in alternate chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), createLiteral(3), level1)
      const level3 = createConditionalExpression(createIdentifier('c'), createLiteral(4), level2)
      const level4 = createConditionalExpression(createIdentifier('d'), createLiteral(5), level3)

      visitor.ConditionalExpression(level4)
      expect(reports.length).toBe(1)
    })

    test('should report alternating consequent/alternate nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const inner = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
      const outer = createConditionalExpression(createIdentifier('c'), createLiteral(4), middle)

      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report 5-level deep nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      let current = createConditionalExpression(
        createIdentifier('e'),
        createLiteral(1),
        createLiteral(2),
      )
      for (const name of ['d', 'c', 'b', 'a']) {
        current = createConditionalExpression(createIdentifier(name), current, createLiteral(3))
      }

      visitor.ConditionalExpression(current)
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with mixed expression types', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        {
          type: 'BinaryExpression',
          operator: '===',
          left: createIdentifier('a'),
          right: createLiteral(1),
        },
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
        createIdentifier('value'),
      )

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), innerTernary, createLiteral(5)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with null literal values', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: null },
        createLiteral('default'),
      )
      const node = createConditionalExpression(
        createIdentifier('x'),
        innerTernary,
        createLiteral('fallback'),
      )

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING TESTS (30)
  // ============================================================
  describe('not reporting non-nested ternaries', () => {
    test('should not report simple ternary with literal consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with identifier consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createIdentifier('a'),
          createIdentifier('b'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with binary expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'BinaryExpression',
            operator: '+',
            left: createIdentifier('a'),
            right: createLiteral(1),
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with call expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [],
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report simple ternary with member expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'MemberExpression',
            object: createIdentifier('obj'),
            property: createIdentifier('prop'),
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with array expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ArrayExpression', elements: [createLiteral(1), createLiteral(2)] },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with object expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ObjectExpression', properties: [] },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with function expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with arrow function expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ArrowFunctionExpression', params: [], body: createLiteral(1), expression: true },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with new expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'NewExpression', callee: createIdentifier('MyClass'), arguments: [] },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with template literal consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with unary expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'UnaryExpression', operator: '!', argument: createIdentifier('a') },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with assignment expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'AssignmentExpression',
            operator: '=',
            left: createIdentifier('a'),
            right: createLiteral(1),
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with logical expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'LogicalExpression',
            operator: '&&',
            left: createIdentifier('a'),
            right: createIdentifier('b'),
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with spread element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'SpreadElement', argument: createIdentifier('arr') },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with typeof expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'UnaryExpression', operator: 'typeof', argument: createIdentifier('a') },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with sequence expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'SequenceExpression',
            expressions: [createIdentifier('a'), createIdentifier('b')],
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with update expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'UpdateExpression',
            operator: '++',
            argument: createIdentifier('a'),
            prefix: true,
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with tagged template expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'TaggedTemplateExpression',
            tag: createIdentifier('tag'),
            quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
          },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with yield expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'YieldExpression', argument: null },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with await expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'AwaitExpression', argument: createIdentifier('promise') },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with class expression consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ClassExpression', id: null, body: { type: 'ClassBody', body: [] } },
          createLiteral(0),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with both sides as member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'MemberExpression',
            object: createIdentifier('a'),
            property: createIdentifier('b'),
          },
          {
            type: 'MemberExpression',
            object: createIdentifier('c'),
            property: createIdentifier('d'),
          },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with both sides as call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'CallExpression', callee: createIdentifier('fn1'), arguments: [] },
          { type: 'CallExpression', callee: createIdentifier('fn2'), arguments: [] },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with both sides as binary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '>',
            left: createIdentifier('a'),
            right: createLiteral(0),
          },
          {
            type: 'BinaryExpression',
            operator: '+',
            left: createIdentifier('b'),
            right: createLiteral(1),
          },
          {
            type: 'BinaryExpression',
            operator: '-',
            left: createIdentifier('c'),
            right: createLiteral(2),
          },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with both sides as identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createIdentifier('a'),
          createIdentifier('b'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with both sides as literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with conditional test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '>',
            left: createIdentifier('a'),
            right: createLiteral(5),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with logical expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'LogicalExpression',
            operator: '||',
            left: createIdentifier('a'),
            right: createIdentifier('b'),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with call expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          { type: 'CallExpression', callee: createIdentifier('isTrue'), arguments: [] },
          createLiteral(1),
          createLiteral(2),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report ternary with mixed literal types', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral('hello'),
          createLiteral(42),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES TESTS (25)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression({})).not.toThrow()
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'NotConditionalExpression',
        test: createIdentifier('x'),
        consequent: createConditionalExpression(
          createIdentifier('y'),
          createLiteral(1),
          createLiteral(2),
        ),
        alternate: createLiteral(3),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'y' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        alternate: { type: 'Literal', value: 3 },
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with missing consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        alternate: createLiteral(2),
      }

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(1),
      }

      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: null,
        alternate: createLiteral(2),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(1),
        alternate: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: undefined,
        alternate: createLiteral(2),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(1),
        alternate: undefined,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with string consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: 'not-a-node',
        alternate: createLiteral(2),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with number alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(1),
        alternate: 42,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'condition ? a : b;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNestedTernaryRule.create(context)

      expect(() =>
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier('x'),
            createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
            createLiteral(3),
          ),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createConditionalExpression(
          createIdentifier('y'),
          createLiteral(1),
          createLiteral(2),
        ),
        alternate: createLiteral(3),
        extraProp: 'should not matter',
        anotherProp: 42,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle nested ternary with empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const inner = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(''),
        createLiteral('b'),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('c')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle nested ternary with zero literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const inner = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(0),
        createLiteral(1),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral(2)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle nested ternary with false literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const inner = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(false),
        createLiteral(true),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral(false)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle consequent that is a ConditionalExpression but with falsy type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: { type: '', value: 1 },
        alternate: createLiteral(2),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle alternate that is a ConditionalExpression but with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(1),
        alternate: { type: 'SomethingElse', value: 2 },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION TESTS (15)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for nested ternary', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 10, 5),
        createConditionalExpression(
          createIdentifier('y', 11, 10),
          createLiteral(1, 12, 5),
          createLiteral(2, 12, 10),
        ),
        createLiteral(3, 13, 5),
        10,
        5,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 500, 10),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        500,
        10,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 1, 0),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 3, 80),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        3,
        80,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should report location for nested ternary in alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 5, 2),
        createLiteral(1),
        createConditionalExpression(createIdentifier('y'), createLiteral(2), createLiteral(3)),
        5,
        2,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for both-branches nested', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 7, 4),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createConditionalExpression(createIdentifier('z'), createLiteral(3), createLiteral(4)),
        7,
        4,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 1, 0),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report location for deeply nested ternary', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const inner = createConditionalExpression(
        createIdentifier('a', 20, 10),
        createLiteral(1),
        createLiteral(2),
        20,
        10,
      )
      const middle = createConditionalExpression(
        createIdentifier('b', 15, 5),
        inner,
        createLiteral(3),
        15,
        5,
      )
      const outer = createConditionalExpression(
        createIdentifier('c', 10, 0),
        middle,
        createLiteral(4),
        10,
        0,
      )

      visitor.ConditionalExpression(outer)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location for node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createConditionalExpression(
          createIdentifier('y'),
          createLiteral(1),
          createLiteral(2),
        ),
        alternate: createLiteral(3),
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBeDefined()
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0, 0),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        0,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with large line and column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 9999, 9999),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        9999,
        9999,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should report correct location when only outer has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'y' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        alternate: { type: 'Literal', value: 3 },
        loc: {
          start: { line: 42, column: 7 },
          end: { line: 42, column: 27 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location for alternate-only nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 8, 0),
        createLiteral(1),
        createConditionalExpression(
          createIdentifier('y', 9, 2),
          createLiteral(2),
          createLiteral(3),
        ),
        8,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location from node loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 3, 14),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
        3,
        14,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toEqual({
        start: { line: 3, column: 14 },
        end: { line: 3, column: 34 },
      })
    })
  })

  // ============================================================
  // MESSAGE TESTS (10)
  // ============================================================
  describe('message quality', () => {
    test('should mention nesting in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('nest')
    })

    test('should mention ternary in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention if-else in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('if-else')
    })

    test('should mention switch in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain('switch')
    })

    test('should have a non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have consistent message for consequent nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message).toContain('if-else')
    })

    test('should have consistent message for alternate nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral(3),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        ),
      )

      expect(reports[0].message).toContain('if-else')
    })

    test('should have consistent message for both branches nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createConditionalExpression(createIdentifier('z'), createLiteral(3), createLiteral(4)),
        ),
      )

      expect(reports[0].message).toContain('if-else')
    })

    test('should have message starting with capital letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  // ============================================================
  // MULTIPLE REPORTS TESTS (10)
  // ============================================================
  describe('multiple reports', () => {
    test('should report each level of nesting when visited separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const level1 = createConditionalExpression(
        createIdentifier('a'),
        createLiteral(1),
        createLiteral(2),
      )
      const level2 = createConditionalExpression(createIdentifier('b'), level1, createLiteral(3))
      const level3 = createConditionalExpression(createIdentifier('c'), level2, createLiteral(4))
      const level4 = createConditionalExpression(createIdentifier('d'), level3, createLiteral(5))

      visitor.ConditionalExpression(level2)
      visitor.ConditionalExpression(level3)
      visitor.ConditionalExpression(level4)

      expect(reports.length).toBe(3)
    })

    test('should report two separate nested ternaries', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const nested1 = createConditionalExpression(
        createIdentifier('x'),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
      )

      const nested2 = createConditionalExpression(
        createIdentifier('a'),
        createConditionalExpression(createIdentifier('b'), createLiteral(4), createLiteral(5)),
        createLiteral(6),
      )

      visitor.ConditionalExpression(nested1)
      visitor.ConditionalExpression(nested2)

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier('x'),
            createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
            createLiteral(3),
          ),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should not report for simple ternary mixed with nested ones', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('a'), createLiteral(4), createLiteral(5)),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('z'),
          createLiteral(6),
          createConditionalExpression(createIdentifier('w'), createLiteral(7), createLiteral(8)),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report nested ternary visited after non-nested', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2)),
      )
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(3), createLiteral(4)),
          createLiteral(5),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle visiting same node multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        createLiteral(3),
      )

      visitor.ConditionalExpression(node)
      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report each distinct nested ternary pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      // Consequent nesting
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      // Alternate nesting
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral(3),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
        ),
      )

      // Both branches
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createConditionalExpression(createIdentifier('z'), createLiteral(3), createLiteral(4)),
        ),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.ConditionalExpression(
            createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2)),
          )
        } else {
          visitor.ConditionalExpression(
            createConditionalExpression(
              createIdentifier('x'),
              createConditionalExpression(
                createIdentifier('y'),
                createLiteral(1),
                createLiteral(2),
              ),
              createLiteral(3),
            ),
          )
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should not share state between separate visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'condition ? a : b;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor1 = noNestedTernaryRule.create(ctx1)
      const visitor2 = noNestedTernaryRule.create(ctx2)

      visitor1.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      visitor2.ConditionalExpression(
        createConditionalExpression(createIdentifier('a'), createLiteral(4), createLiteral(5)),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should report 10 consecutive nested ternaries', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ConditionalExpression(
          createConditionalExpression(
            createIdentifier(`x${i}`),
            createConditionalExpression(
              createIdentifier(`y${i}`),
              createLiteral(i),
              createLiteral(i + 1),
            ),
            createLiteral(i + 2),
          ),
        )
      }

      expect(reports.length).toBe(10)
    })
  })

  // ============================================================
  // CONTEXT TESTS (10)
  // ============================================================
  describe('context integration', () => {
    test('should use context.report for reporting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should accept context with custom file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;', filePath: '/project/src/utils/helper.ts' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should accept context with custom source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const result = x ? y ? 1 : 2 : 3;', filePath: '/src/file.ts' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with context that has empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with context that has multiline source', () => {
      const source = `const x = a
  ? b ? 1 : 2
  : 3;`
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createConditionalExpression(createIdentifier('b'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not access context.getAST during detection', () => {
      let astAccessed = false
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => {
          astAccessed = true
          return null
        },
        getSource: () => 'x ? y ? 1 : 2 : 3',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(astAccessed).toBe(false)
    })

    test('should work when context.getComments returns empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work when context.getTokens returns empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/custom/project/file.ts',
        getAST: () => null,
        getSource: () => 'x ? y ? 1 : 2 : 3',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom/project',
      } as unknown as RuleContext

      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with multiple visitors from same context', () => {
      const { context, reports: reports1 } = createMockRuleContext({ source: 'condition ? a : b;' })
      const reports2: ReportDescriptor[] = []

      const context2: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports2.push(d)
        },
        getFilePath: () => '/src/file2.ts',
        getAST: () => null,
        getSource: () => 'a ? b ? 1 : 2 : 3',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor1 = noNestedTernaryRule.create(context)
      const visitor2 = noNestedTernaryRule.create(context2)

      visitor1.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )
      visitor2.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createConditionalExpression(createIdentifier('b'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })
  })

  // ============================================================
  // FIX FUNCTIONALITY TESTS
  // ============================================================
  describe('fix functionality', () => {
    test('should provide fix for nested ternary in consequent with range', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [4, 5]),
        createLiteralWithRange(1, [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        [4, 13],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        innerTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for nested ternary in alternate with range', () => {
      const source = 'x ? 1 : y ? 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        createLiteralWithRange(3, [16, 17]),
        [8, 17],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        createLiteralWithRange(1, [4, 5]),
        innerTernary,
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix for deeply nested ternary with range', () => {
      const source = 'a ? b ? c ? 1 : 2 : 3 : 4'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innermostTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('c', [8, 9]),
        createLiteralWithRange(1, [12, 13]),
        createLiteralWithRange(2, [16, 17]),
        [8, 17],
      )

      const middleTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('b', [4, 5]),
        innermostTernary,
        createLiteralWithRange(3, [20, 21]),
        [4, 21],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('a', [0, 1]),
        middleTernary,
        createLiteralWithRange(4, [24, 25]),
        [0, 25],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('fix should contain if-else replacement text', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [4, 5]),
        createLiteralWithRange(1, [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        [4, 13],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        innerTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.text).toContain('if')
      expect(reports[0].fix?.text).toContain('else')
    })

    test('fix range should cover entire outer ternary', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpressionWithRange(
        createIdentifierWithRange('y', [4, 5]),
        createLiteralWithRange(1, [8, 9]),
        createLiteralWithRange(2, [12, 13]),
        [4, 13],
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        innerTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix?.range[0]).toBe(0)
      expect(reports[0].fix?.range[1]).toBe(17)
    })

    test('should not provide fix when inner node lacks range', () => {
      const source = 'x ? y ? 1 : 2 : 3'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = noNestedTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('y'),
        createLiteral(1),
        createLiteral(2),
      )

      const node = createConditionalExpressionWithRange(
        createIdentifierWithRange('x', [0, 1]),
        innerTernary,
        createLiteralWithRange(3, [16, 17]),
        [0, 17],
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for alternate nesting without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createLiteral(1),
          createConditionalExpression(createIdentifier('y'), createLiteral(2), createLiteral(3)),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ============================================================
  // TEST.EACH - DATA-DRIVEN TESTS (40+)
  // ============================================================
  describe('test.each - detection patterns', () => {
    test('should report nested in consequent with identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createNestedTernary('x', 'y', 'consequent')
      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested in alternate with identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      const node = createNestedTernary('x', 'y', 'alternate')
      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - non-nested expression types in consequent', () => {
    test('should not report when consequent is ArrayExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ArrayExpression', elements: [] },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is ObjectExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'ObjectExpression', properties: [] },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
            expression: false,
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Literal', value: 1 },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'LogicalExpression',
            operator: '&&',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Literal', value: 1 },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
            expressions: [],
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is SpreadElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'SequenceExpression',
            expressions: [
              { type: 'Identifier', name: 'a' },
              { type: 'Identifier', name: 'b' },
            ],
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'UpdateExpression',
            operator: '++',
            argument: { type: 'Identifier', name: 'a' },
            prefix: false,
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is AwaitExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is YieldExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'YieldExpression', argument: null },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is ClassExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          {
            type: 'ClassExpression',
            id: null,
            superClass: null,
            body: { type: 'ClassBody', body: [] },
          },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is plain Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          { type: 'Identifier', name: 'val' },
          createLiteral(0),
        ),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - non-nested expression types in alternate', () => {
    const nonNestedAlternateTypes: Array<{ name: string; node: unknown }> = [
      {
        name: 'ArrayExpression',
        node: { type: 'ArrayExpression', elements: [] },
      },
      {
        name: 'ObjectExpression',
        node: { type: 'ObjectExpression', properties: [] },
      },
      {
        name: 'FunctionExpression',
        node: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      },
      {
        name: 'ArrowFunctionExpression',
        node: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
          expression: false,
        },
      },
      {
        name: 'NewExpression',
        node: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
      },
      {
        name: 'UnaryExpression',
        node: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
      },
      {
        name: 'BinaryExpression',
        node: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 1 },
        },
      },
      {
        name: 'LogicalExpression',
        node: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      },
      {
        name: 'AssignmentExpression',
        node: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 1 },
        },
      },
      {
        name: 'MemberExpression',
        node: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      },
      {
        name: 'CallExpression',
        node: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
      {
        name: 'TemplateLiteral',
        node: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
          expressions: [],
        },
      },
      {
        name: 'Identifier',
        node: { type: 'Identifier', name: 'val' },
      },
    ]

    test.each(nonNestedAlternateTypes)('should not report when alternate is $name', ({ node }) => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), node),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - literal types in nested ternary', () => {
    const literalCases: Array<{ name: string; value: unknown }> = [
      { name: 'number 0', value: 0 },
      { name: 'number 1', value: 1 },
      { name: 'number -1', value: -1 },
      { name: 'number 3.14', value: 3.14 },
      { name: 'string empty', value: '' },
      { name: 'string hello', value: 'hello' },
      { name: 'boolean true', value: true },
      { name: 'boolean false', value: false },
    ]

    test.each(literalCases)(
      'should report nested ternary with $name in consequent',
      ({ value }) => {
        const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
        const visitor = noNestedTernaryRule.create(context)

        const innerTernary = createConditionalExpression(
          createIdentifier('y'),
          { type: 'Literal', value },
          { type: 'Literal', value: 'default' },
        )
        visitor.ConditionalExpression(
          createConditionalExpression(createIdentifier('x'), innerTernary, createLiteral('other')),
        )

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - edge case node inputs', () => {
    const edgeCases: Array<{ name: string; input: unknown }> = [
      { name: 'null', input: null },
      { name: 'undefined', input: undefined },
      { name: 'empty string', input: '' },
      { name: 'number 0', input: 0 },
      { name: 'boolean false', input: false },
      { name: 'empty array', input: [] },
      { name: 'NaN', input: NaN },
    ]

    test.each(edgeCases)('should handle $name input gracefully without throwing', ({ input }) => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(input)).not.toThrow()
    })
  })

  describe('test.each - location at various positions', () => {
    const locationCases = [
      { line: 1, column: 0, desc: 'start of file' },
      { line: 1, column: 50, desc: 'end of first line' },
      { line: 10, column: 0, desc: 'start of line 10' },
      { line: 100, column: 100, desc: 'far into file' },
      { line: 5, column: 3, desc: 'indented code' },
      { line: 1, column: 1, desc: 'second column' },
      { line: 2, column: 0, desc: 'start of second line' },
      { line: 25, column: 40, desc: 'common indentation' },
    ]

    test.each(locationCases)(
      'should report correct location at $desc (line $line, col $column)',
      ({ line, column }) => {
        const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
        const visitor = noNestedTernaryRule.create(context)

        const node = createConditionalExpression(
          createIdentifier('x', line, column),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
          line,
          column,
        )

        visitor.ConditionalExpression(node)

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('test.each - binary operator test expressions', () => {
    const operators = [
      { op: '===', desc: 'strict equality' },
      { op: '!==', desc: 'strict inequality' },
      { op: '==', desc: 'loose equality' },
      { op: '!=', desc: 'loose inequality' },
      { op: '>', desc: 'greater than' },
      { op: '<', desc: 'less than' },
      { op: '>=', desc: 'greater or equal' },
      { op: '<=', desc: 'less or equal' },
      { op: '&&', desc: 'logical and', isLogical: true },
      { op: '||', desc: 'logical or', isLogical: true },
    ]

    test.each(operators)(
      'should not report ternary with $desc ($op) test expression',
      ({ op, isLogical }) => {
        const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
        const visitor = noNestedTernaryRule.create(context)

        const nodeType = isLogical ? 'LogicalExpression' : 'BinaryExpression'
        visitor.ConditionalExpression(
          createConditionalExpression(
            { type: nodeType, operator: op, left: createIdentifier('a'), right: createLiteral(0) },
            createLiteral(1),
            createLiteral(2),
          ),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - message content verification', () => {
    const messageFragments = [
      { fragment: 'nest', desc: 'nesting' },
      { fragment: 'ternary', desc: 'ternary' },
      { fragment: 'if-else', desc: 'if-else' },
      { fragment: 'switch', desc: 'switch' },
    ]

    test.each(messageFragments)('should contain $desc in report message', ({ fragment }) => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('x'),
          createConditionalExpression(createIdentifier('y'), createLiteral(1), createLiteral(2)),
          createLiteral(3),
        ),
      )

      expect(reports[0].message.toLowerCase()).toContain(fragment)
    })
  })

  describe('test.each - meta property values', () => {
    const metaChecks: Array<{ prop: string; expected: unknown; desc: string }> = [
      { prop: 'type', expected: 'suggestion', desc: 'type is suggestion' },
      { prop: 'severity', expected: 'warn', desc: 'severity is warn' },
      { prop: 'fixable', expected: 'code', desc: 'fixable is code' },
    ]

    test.each(metaChecks)('should have $desc', ({ prop, expected }) => {
      const meta = noNestedTernaryRule.meta as Record<string, unknown>
      expect(meta[prop]).toBe(expected)
    })
  })

  describe('test.each - deeply nested levels', () => {
    const nestingLevels = [
      { depth: 2, desc: '2 levels deep' },
      { depth: 3, desc: '3 levels deep' },
      { depth: 4, desc: '4 levels deep' },
      { depth: 5, desc: '5 levels deep' },
    ]

    test.each(nestingLevels)('should report $desc nested ternary', ({ depth }) => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      let current: unknown = createConditionalExpression(
        createIdentifier('inner'),
        createLiteral(1),
        createLiteral(2),
      )

      for (let i = 1; i < depth; i++) {
        current = createConditionalExpression(
          createIdentifier(`level${i}`),
          current,
          createLiteral(3),
        )
      }

      visitor.ConditionalExpression(current)
      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - different nesting patterns', () => {
    const patterns: Array<{ name: string; buildNested: () => unknown }> = [
      {
        name: 'consequent-consequent chain',
        buildNested: () => {
          const inner = createConditionalExpression(
            createIdentifier('c'),
            createLiteral(1),
            createLiteral(2),
          )
          const middle = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
          return createConditionalExpression(createIdentifier('a'), middle, createLiteral(4))
        },
      },
      {
        name: 'alternate-alternate chain',
        buildNested: () => {
          const inner = createConditionalExpression(
            createIdentifier('c'),
            createLiteral(1),
            createLiteral(2),
          )
          const middle = createConditionalExpression(createIdentifier('b'), createLiteral(3), inner)
          return createConditionalExpression(createIdentifier('a'), createLiteral(4), middle)
        },
      },
      {
        name: 'consequent-alternate chain',
        buildNested: () => {
          const inner = createConditionalExpression(
            createIdentifier('c'),
            createLiteral(1),
            createLiteral(2),
          )
          const middle = createConditionalExpression(createIdentifier('b'), createLiteral(3), inner)
          return createConditionalExpression(createIdentifier('a'), middle, createLiteral(4))
        },
      },
      {
        name: 'alternate-consequent chain',
        buildNested: () => {
          const inner = createConditionalExpression(
            createIdentifier('c'),
            createLiteral(1),
            createLiteral(2),
          )
          const middle = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
          return createConditionalExpression(createIdentifier('a'), createLiteral(4), middle)
        },
      },
      {
        name: 'both branches nested',
        buildNested: () =>
          createConditionalExpression(
            createIdentifier('a'),
            createConditionalExpression(createIdentifier('b'), createLiteral(1), createLiteral(2)),
            createConditionalExpression(createIdentifier('c'), createLiteral(3), createLiteral(4)),
          ),
      },
    ]

    test.each(patterns)('should report $name', ({ buildNested }) => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)

      visitor.ConditionalExpression(buildNested())
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ADDITIONAL INDIVIDUAL TESTS
  // ============================================================
  describe('additional non-nested alternate types', () => {
    test('should not report when alternate is ArrayExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'ArrayExpression',
          elements: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is ObjectExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is FunctionExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is ArrowFunctionExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
          expression: false,
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is NewExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is UnaryExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is BinaryExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 1 },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is LogicalExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is AssignmentExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 1 },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is MemberExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is CallExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is TemplateLiteral type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hi', cooked: 'hi' } }],
          expressions: [],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is plain Identifier type', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), createLiteral(0), {
          type: 'Identifier',
          name: 'val',
        }),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('additional literal value tests', () => {
    test('should report nested ternary with number 0 in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: 0 },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number 1 in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number -1 in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: -1 },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with number 3.14 in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: 3.14 },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with empty string in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: '' },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with hello string in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: 'hello' },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with boolean true in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: true },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested ternary with boolean false in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('y'),
        { type: 'Literal', value: false },
        { type: 'Literal', value: 'default' },
      )
      visitor.ConditionalExpression(
        createConditionalExpression(createIdentifier('x'), inner, createLiteral('other')),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('additional edge case inputs', () => {
    test('should handle null input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle empty string input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression('')).not.toThrow()
    })

    test('should handle number 0 input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(0)).not.toThrow()
    })

    test('should handle boolean false input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(false)).not.toThrow()
    })

    test('should handle empty array input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression([])).not.toThrow()
    })

    test('should handle NaN input gracefully', () => {
      const { context } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(NaN)).not.toThrow()
    })
  })

  describe('additional binary operator tests', () => {
    test('should not report ternary with strict equality test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '===',
            left: createIdentifier('a'),
            right: createLiteral(0),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ternary with strict inequality test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '!==',
            left: createIdentifier('a'),
            right: createLiteral(0),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ternary with greater than test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '>',
            left: createIdentifier('a'),
            right: createLiteral(0),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ternary with less than test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'BinaryExpression',
            operator: '<',
            left: createIdentifier('a'),
            right: createLiteral(0),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ternary with logical and test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'LogicalExpression',
            operator: '&&',
            left: createIdentifier('a'),
            right: createIdentifier('b'),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ternary with logical or test', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      visitor.ConditionalExpression(
        createConditionalExpression(
          {
            type: 'LogicalExpression',
            operator: '||',
            left: createIdentifier('a'),
            right: createIdentifier('b'),
          },
          createLiteral(1),
          createLiteral(2),
        ),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('additional meta checks', () => {
    test('should have meta type equal to suggestion', () => {
      expect(noNestedTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have meta severity equal to warn', () => {
      expect(noNestedTernaryRule.meta.severity).toBe('warn')
    })

    test('should have meta fixable equal to code', () => {
      expect(noNestedTernaryRule.meta.fixable).toBe('code')
    })
  })

  describe('additional nesting depth checks', () => {
    test('should report 2 levels deep nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('c'),
        createLiteral(1),
        createLiteral(2),
      )
      const outer = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report 3 levels deep nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('d'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('c'), inner, createLiteral(3))
      const outer = createConditionalExpression(createIdentifier('b'), middle, createLiteral(4))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report 4 levels deep nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('e'),
        createLiteral(1),
        createLiteral(2),
      )
      const mid1 = createConditionalExpression(createIdentifier('d'), inner, createLiteral(3))
      const mid2 = createConditionalExpression(createIdentifier('c'), mid1, createLiteral(4))
      const outer = createConditionalExpression(createIdentifier('b'), mid2, createLiteral(5))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report 5 levels deep nesting', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('f'),
        createLiteral(1),
        createLiteral(2),
      )
      const mid1 = createConditionalExpression(createIdentifier('e'), inner, createLiteral(3))
      const mid2 = createConditionalExpression(createIdentifier('d'), mid1, createLiteral(4))
      const mid3 = createConditionalExpression(createIdentifier('c'), mid2, createLiteral(5))
      const outer = createConditionalExpression(createIdentifier('b'), mid3, createLiteral(6))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })
  })

  describe('additional nesting pattern checks', () => {
    test('should report consequent-consequent chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('c'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
      const outer = createConditionalExpression(createIdentifier('a'), middle, createLiteral(4))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report alternate-alternate chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('c'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('b'), createLiteral(3), inner)
      const outer = createConditionalExpression(createIdentifier('a'), createLiteral(4), middle)
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report consequent-alternate chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('c'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('b'), createLiteral(3), inner)
      const outer = createConditionalExpression(createIdentifier('a'), middle, createLiteral(4))
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report alternate-consequent chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const inner = createConditionalExpression(
        createIdentifier('c'),
        createLiteral(1),
        createLiteral(2),
      )
      const middle = createConditionalExpression(createIdentifier('b'), inner, createLiteral(3))
      const outer = createConditionalExpression(createIdentifier('a'), createLiteral(4), middle)
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report both branches nested', () => {
      const { context, reports } = createMockRuleContext({ source: 'condition ? a : b;' })
      const visitor = noNestedTernaryRule.create(context)
      const outer = createConditionalExpression(
        createIdentifier('a'),
        createConditionalExpression(createIdentifier('b'), createLiteral(1), createLiteral(2)),
        createConditionalExpression(createIdentifier('c'), createLiteral(3), createLiteral(4)),
      )
      visitor.ConditionalExpression(outer)
      expect(reports.length).toBe(1)
    })
  })
})
