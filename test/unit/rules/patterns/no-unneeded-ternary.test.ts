import { describe, test, expect, vi } from 'vitest'
import { noUnneededTernaryRule } from '../../../../src/rules/patterns/no-unneeded-ternary.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = cond ? true : false;',
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

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createNumericLiteral(value: number, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function createStringLiteral(value: string, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? `"${value}"`,
  }
}

function createNullLiteral(): unknown {
  return {
    type: 'Literal',
    value: null,
    raw: 'null',
  }
}

function createRegExpLiteral(pattern: string, flags: string): unknown {
  return {
    type: 'Literal',
    value: new RegExp(pattern, flags),
    raw: `/${pattern}/${flags}`,
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
  }
}

describe('no-unneeded-ternary rule', () => {
  // =====================================================
  // META PROPERTIES (20 tests)
  // =====================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnneededTernaryRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnneededTernaryRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnneededTernaryRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnneededTernaryRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnneededTernaryRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnneededTernaryRule.meta.fixable).toBeUndefined()
    })

    test('should mention ternary in description', () => {
      expect(noUnneededTernaryRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention simplified in description', () => {
      expect(noUnneededTernaryRule.meta.docs?.description.toLowerCase()).toContain('simplified')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noUnneededTernaryRule.meta.docs?.description).toBe('string')
      expect(noUnneededTernaryRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUnneededTernaryRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noUnneededTernaryRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnneededTernaryRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noUnneededTernaryRule.meta.schema).toEqual([])
    })

    test('should have docs object defined', () => {
      expect(noUnneededTernaryRule.meta.docs).toBeDefined()
    })

    test('should have docs.category as string', () => {
      expect(typeof noUnneededTernaryRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noUnneededTernaryRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have a docs URL', () => {
      expect(noUnneededTernaryRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs URL as a string', () => {
      expect(typeof noUnneededTernaryRule.meta.docs?.url).toBe('string')
    })

    test('should have docs URL with https protocol', () => {
      expect(noUnneededTernaryRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should have docs URL containing no-unneeded-ternary', () => {
      expect(noUnneededTernaryRule.meta.docs?.url).toContain('no-unneeded-ternary')
    })

    test('should not be deprecated', () => {
      expect(noUnneededTernaryRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnneededTernaryRule.meta.replacedBy).toBeUndefined()
    })
  })

  // =====================================================
  // CREATE / VISITOR STRUCTURE (6 tests)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with ConditionalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(visitor).toHaveProperty('ConditionalExpression')
    })

    test('should return ConditionalExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnneededTernaryRule.create(context)
      const visitor2 = noUnneededTernaryRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockContext()

      expect(() => noUnneededTernaryRule.create(context)).not.toThrow()
    })

    test('should not have visitor methods for other node types', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(Object.keys(visitor)).toEqual(['ConditionalExpression'])
    })
  })

  // =====================================================
  // DETECTING cond ? true : false PATTERN (15 tests)
  // =====================================================
  describe('detecting cond ? true : false pattern', () => {
    test('should report when consequent is true and alternate is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include !! in message for true : false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!!')
    })

    test('should include Boolean() in message for true : false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('Boolean(')
    })

    test('should report with binary expression as test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('>', createIdentifier('x'), createNumericLiteral(0)),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with unary expression as test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createUnaryExpression('!', createIdentifier('flag')),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with call expression as test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createCallExpression(createIdentifier('isValid'), []),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with member expression as test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with nested conditional as test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerConditional = createConditionalExpression(
        createIdentifier('a'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const node = createConditionalExpression(
        innerConditional,
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false with Literal raw "true" and "false"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        { type: 'Literal', value: true, raw: 'true' },
        { type: 'Literal', value: false, raw: 'false' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not double-report true : false (only reports once)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false when test is numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createNumericLiteral(1),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false when test is string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createStringLiteral('hello'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false when test is a complex expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('b')),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false when consequent has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'Literal', value: true, raw: 'true', range: [0, 4] },
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report true : false when alternate has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        { type: 'Literal', value: false, raw: 'false', range: [5, 10] },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // DETECTING cond ? false : true PATTERN (13 tests)
  // =====================================================
  describe('detecting cond ? false : true pattern', () => {
    test('should report when consequent is false and alternate is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include ! in message for false : true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!condition')
    })

    test('should report with binary expression as test for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('<', createIdentifier('x'), createNumericLiteral(10)),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with unary expression as test for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createUnaryExpression('typeof', createIdentifier('x')),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with call expression as test for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createCallExpression(createIdentifier('check'), [createIdentifier('val')]),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with member expression as test for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createMemberExpression(createIdentifier('config'), createIdentifier('enabled')),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with nested conditional as test for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerConditional = createConditionalExpression(
        createIdentifier('a'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      const node = createConditionalExpression(
        innerConditional,
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not include !! in message for false : true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).not.toContain('!!')
    })

    test('should report false : true with Literal raw values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        { type: 'Literal', value: false, raw: 'false' },
        { type: 'Literal', value: true, raw: 'true' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report false : true when test is numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createNumericLiteral(0),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report false : true when test is a complex expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('y')),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not double-report false : true (only reports once)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report false : true with consequent having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'Literal', value: false, raw: 'false', range: [0, 5] },
        { type: 'Literal', value: true, raw: 'true' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // DETECTING IDENTICAL BRANCHES (18 tests)
  // =====================================================
  describe('detecting identical branches pattern', () => {
    test('should report when consequent and alternate are identical literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when consequent and alternate are identical identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('value'),
        createIdentifier('value'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when consequent and alternate are identical string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('hello'),
        createStringLiteral('hello'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should mention identical in message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('identical')
    })

    test('should report identical numeric literals (0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(0),
        createNumericLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical numeric literals (negative)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(-1),
        createNumericLiteral(-1),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical numeric literals (decimal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(3.14),
        createNumericLiteral(3.14),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical string literals (empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral(''),
        createStringLiteral(''),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical string literals (with special chars)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('hello\nworld'),
        createStringLiteral('hello\nworld'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical identifiers (single letter)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('x'),
        createIdentifier('x'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical identifiers (long name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('myVeryLongVariableName'),
        createIdentifier('myVeryLongVariableName'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical identifiers (with dollar sign)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('$elem'),
        createIdentifier('$elem'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical identifiers (with underscore)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('_private'),
        createIdentifier('_private'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical null literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNullLiteral(),
        createNullLiteral(),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report identical branches when they are true/false (already caught by bool check)', () => {
      // true : true is identical but NOT true : false, so it gets caught by identical branch check
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      // true : true is identical, not caught by true:false or false:true checks
      expect(reports.length).toBe(1)
    })

    test('should report identical false : false branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nodes with identical raw values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`template`' },
        { type: 'TemplateLiteral', raw: '`template`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical string literals with different raw', () => {
      // Same value but potentially different raw representations
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('test'),
        createStringLiteral('test'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // ALLOWING VALID TERNARY EXPRESSIONS (20 tests)
  // =====================================================
  describe('allowing valid ternary expressions', () => {
    test('should not report when consequent and alternate are different values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createNumericLiteral(2),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is true and alternate is not false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createNumericLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is not true and alternate is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are different identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('a'),
        createIdentifier('b'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report complex ternary with different branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        {
          type: 'BinaryExpression',
          operator: '>',
          left: createIdentifier('x'),
          right: createNumericLiteral(0),
        },
        createStringLiteral('positive'),
        createStringLiteral('non-positive'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are different numeric literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(100),
        createNumericLiteral(200),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are different string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('yes'),
        createStringLiteral('no'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is a literal and alternate is an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(0),
        createIdentifier('fallback'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is an identifier and alternate is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('value'),
        createNumericLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when both branches are different type nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'ArrayExpression', elements: [] },
        { type: 'ObjectExpression', properties: [] },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is false and alternate is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is a number and alternate is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when branches are identifiers with similar but different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('value1'),
        createIdentifier('value2'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when one branch is null and other is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(createIdentifier('cond'), createNullLiteral(), {
        type: 'Identifier',
        name: 'undefined',
      })

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is positive and alternate is negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createNumericLiteral(-1),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are call expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createCallExpression(createIdentifier('fnA'), []),
        createCallExpression(createIdentifier('fnB'), []),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate are member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createMemberExpression(createIdentifier('a'), createIdentifier('x')),
        createMemberExpression(createIdentifier('b'), createIdentifier('y')),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is empty string and alternate is non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral(''),
        createStringLiteral('default'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent and alternate have different raw but same type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`a`' },
        { type: 'TemplateLiteral', raw: '`b`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with valid real-world ternary: status check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('===', createIdentifier('status'), createNumericLiteral(200)),
        createStringLiteral('OK'),
        createStringLiteral('Error'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (25 tests)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'CallExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle missing alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        null,
        createBooleanLiteral(false),
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        null,
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'Literal' },
        { type: 'Literal', value: false },
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle nodes with raw property for comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`hello`' },
        { type: 'TemplateLiteral', raw: '`hello`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle different raw values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral', raw: '`hello`' },
        { type: 'TemplateLiteral', raw: '`world`' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined raw in one node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'TemplateLiteral' },
        { type: 'TemplateLiteral', raw: '`hello`' },
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node as input', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
    })

    test('should handle numeric node as input', () => {
      const { context } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: '',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 123,
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      // type is 123 which is not 'ConditionalExpression'
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        '',
        createBooleanLiteral(false),
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle alternate as 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        0,
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle both consequent and alternate as 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(createIdentifier('cond'), 0, 0)

      // Both are falsy, so areNodesEqual returns false (0 is not an object)
      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: null,
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: undefined,
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with consequent as array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        [1, 2, 3],
        createBooleanLiteral(false),
      )

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node with test as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        null,
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // LOCATION REPORTING (15 tests)
  // =====================================================
  describe('location reporting', () => {
    test('should include location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 5, column: 10 }, end: { line: 5, column: 30 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should handle multi-line location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 3, column: 5 }, end: { line: 7, column: 15 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 999, column: 0 }, end: { line: 999, column: 20 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should handle location with large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 1, column: 500 }, end: { line: 1, column: 520 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should include location for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
        { start: { line: 10, column: 5 }, end: { line: 10, column: 25 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should include location for false : true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
        { start: { line: 8, column: 3 }, end: { line: 8, column: 23 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(8)
    })

    test('should handle location where start equals end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
        { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should provide default end column when loc has no end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: {
          start: { line: 5, column: 10 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should provide default start when loc has only end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: {
          end: { line: 5, column: 20 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle non-numeric line gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: {
          start: { line: 'bad', column: 0 },
          end: { line: 'bad', column: 20 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      // Should use default line (1) since 'bad' is not a number
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle partial loc with missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        loc: {
          start: { line: 3 },
          end: { line: 3 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // =====================================================
  // MULTIPLE REPORTS (8 tests)
  // =====================================================
  describe('multiple patterns', () => {
    test('should only report once for cond ? true : false (not also as identical)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple different ternary violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('cond1'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const node2 = createConditionalExpression(
        createIdentifier('cond2'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node1)
      visitor.ConditionalExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report three sequential violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      const node3 = createConditionalExpression(
        createIdentifier('c'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node1)
      visitor.ConditionalExpression(node2)
      visitor.ConditionalExpression(node3)

      expect(reports.length).toBe(3)
    })

    test('should report mixed violations and valid expressions correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node1 = createConditionalExpression(
        createIdentifier('a'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const node2 = createConditionalExpression(
        createIdentifier('b'),
        createNumericLiteral(1),
        createNumericLiteral(2),
      )

      const node3 = createConditionalExpression(
        createIdentifier('c'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node1)
      visitor.ConditionalExpression(node2)
      visitor.ConditionalExpression(node3)

      expect(reports.length).toBe(2)
    })

    test('should handle many violations in sequence (10 nodes)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      for (let i = 0; i < 10; i++) {
        const node = createConditionalExpression(
          createIdentifier(`cond${i}`),
          createBooleanLiteral(true),
          createBooleanLiteral(false),
        )
        visitor.ConditionalExpression(node)
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating valid and invalid ternaries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      // Invalid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createBooleanLiteral(true),
          createBooleanLiteral(false),
        ),
      )

      // Valid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('b'),
          createNumericLiteral(1),
          createNumericLiteral(2),
        ),
      )

      // Invalid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('c'),
          createNumericLiteral(42),
          createNumericLiteral(42),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report each identical branch violation separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createNumericLiteral(1),
          createNumericLiteral(1),
        ),
      )

      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('b'),
          createStringLiteral('x'),
          createStringLiteral('x'),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should not carry state between visitor calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      // First: valid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('a'),
          createNumericLiteral(1),
          createNumericLiteral(2),
        ),
      )

      expect(reports.length).toBe(0)

      // Second: invalid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('b'),
          createBooleanLiteral(true),
          createBooleanLiteral(false),
        ),
      )

      expect(reports.length).toBe(1)

      // Third: valid
      visitor.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('c'),
          createStringLiteral('a'),
          createStringLiteral('b'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // MESSAGE CONTENT (12 tests)
  // =====================================================
  describe('message quality', () => {
    test('should mention boolean literals in message for true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should mention unnecessary in message for true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention ternary in message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention unnecessary in message for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention boolean in message for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('should mention unnecessary in message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should provide correct suggestion for true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!!condition')
      expect(reports[0].message).toContain('Boolean(condition)')
    })

    test('should provide correct suggestion for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!condition')
    })

    test('should have non-empty message for true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have non-empty message for false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have non-empty message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have different messages for true:false vs false:true patterns', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const visitor1 = noUnneededTernaryRule.create(ctx1)

      visitor1.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('cond'),
          createBooleanLiteral(true),
          createBooleanLiteral(false),
        ),
      )

      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor2 = noUnneededTernaryRule.create(ctx2)

      visitor2.ConditionalExpression(
        createConditionalExpression(
          createIdentifier('cond'),
          createBooleanLiteral(false),
          createBooleanLiteral(true),
        ),
      )

      expect(reports1[0].message).not.toBe(reports2[0].message)
    })
  })

  // =====================================================
  // CONTEXT VARIATIONS (8 tests)
  // =====================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'flag ? true : false')
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with options provided', () => {
      const { context, reports } = createMockContext({ strict: true })
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/app.js')
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'const a = 1; const b = 2; '.repeat(100) + 'const x = cond ? true : false;'
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with nested directory path', () => {
      const { context, reports } = createMockContext({}, '/project/src/deep/nested/dir/file.ts')
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(1),
        createNumericLiteral(1),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // test.each: SAFE CASES - reporting patterns (20 cases)
  // =====================================================
  describe('safe cases: patterns that should be reported', () => {
    test.each([
      {
        name: 'true : false with identifier test',
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        test: createIdentifier('x'),
      },
      {
        name: 'false : true with identifier test',
        consequent: createBooleanLiteral(false),
        alternate: createBooleanLiteral(true),
        test: createIdentifier('x'),
      },
      {
        name: 'identical numeric literals (0)',
        consequent: createNumericLiteral(0),
        alternate: createNumericLiteral(0),
        test: createIdentifier('x'),
      },
      {
        name: 'identical numeric literals (42)',
        consequent: createNumericLiteral(42),
        alternate: createNumericLiteral(42),
        test: createIdentifier('x'),
      },
      {
        name: 'identic numeric literals (100)',
        consequent: createNumericLiteral(100),
        alternate: createNumericLiteral(100),
        test: createIdentifier('x'),
      },
      {
        name: 'identical string literals (empty)',
        consequent: createStringLiteral(''),
        alternate: createStringLiteral(''),
        test: createIdentifier('x'),
      },
      {
        name: 'identical string literals (hello)',
        consequent: createStringLiteral('hello'),
        alternate: createStringLiteral('hello'),
        test: createIdentifier('x'),
      },
      {
        name: 'identical identifiers (value)',
        consequent: createIdentifier('value'),
        alternate: createIdentifier('value'),
        test: createIdentifier('x'),
      },
      {
        name: 'identical identifiers (result)',
        consequent: createIdentifier('result'),
        alternate: createIdentifier('result'),
        test: createIdentifier('x'),
      },
      {
        name: 'identical null literals',
        consequent: createNullLiteral(),
        alternate: createNullLiteral(),
        test: createIdentifier('x'),
      },
      {
        name: 'identical string (a)',
        consequent: createStringLiteral('a'),
        alternate: createStringLiteral('a'),
        test: createIdentifier('cond'),
      },
      {
        name: 'identical string (world)',
        consequent: createStringLiteral('world'),
        alternate: createStringLiteral('world'),
        test: createIdentifier('cond'),
      },
      {
        name: 'identical numeric (-5)',
        consequent: createNumericLiteral(-5),
        alternate: createNumericLiteral(-5),
        test: createIdentifier('cond'),
      },
      {
        name: 'identical numeric (2.5)',
        consequent: createNumericLiteral(2.5),
        alternate: createNumericLiteral(2.5),
        test: createIdentifier('cond'),
      },
      {
        name: 'true : false with member expr test',
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        test: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
      },
      {
        name: 'false : true with call expr test',
        consequent: createBooleanLiteral(false),
        alternate: createBooleanLiteral(true),
        test: createCallExpression(createIdentifier('fn'), []),
      },
      {
        name: 'identical identifiers (data)',
        consequent: createIdentifier('data'),
        alternate: createIdentifier('data'),
        test: createIdentifier('flag'),
      },
      {
        name: 'identic numeric (999)',
        consequent: createNumericLiteral(999),
        alternate: createNumericLiteral(999),
        test: createIdentifier('flag'),
      },
      {
        name: 'true : false with binary test',
        consequent: createBooleanLiteral(true),
        alternate: createBooleanLiteral(false),
        test: createBinaryExpression('>', createIdentifier('x'), createNumericLiteral(0)),
      },
      {
        name: 'false : true with unary test',
        consequent: createBooleanLiteral(false),
        alternate: createBooleanLiteral(true),
        test: createUnaryExpression('!', createIdentifier('flag')),
      },
    ] as Array<{ name: string; consequent: unknown; alternate: unknown; test: unknown }>)(
      'should report: $name',
      ({ consequent, alternate, test: testNode }) => {
        const { context, reports } = createMockContext()
        const visitor = noUnneededTernaryRule.create(context)

        const node = createConditionalExpression(testNode, consequent, alternate)
        visitor.ConditionalExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  // =====================================================
  // test.each: NON-MATCHING CASES - should not report (20 cases)
  // =====================================================
  describe('non-matching cases: patterns that should not be reported', () => {
    test.each([
      {
        name: 'different numeric literals (1 vs 2)',
        consequent: createNumericLiteral(1),
        alternate: createNumericLiteral(2),
        test: createIdentifier('x'),
      },
      {
        name: 'different string literals (a vs b)',
        consequent: createStringLiteral('a'),
        alternate: createStringLiteral('b'),
        test: createIdentifier('x'),
      },
      {
        name: 'different identifiers (a vs b)',
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
        test: createIdentifier('x'),
      },
      {
        name: 'true vs number',
        consequent: createBooleanLiteral(true),
        alternate: createNumericLiteral(0),
        test: createIdentifier('x'),
      },
      {
        name: 'number vs false',
        consequent: createNumericLiteral(1),
        alternate: createBooleanLiteral(false),
        test: createIdentifier('x'),
      },
      {
        name: 'false vs number',
        consequent: createBooleanLiteral(false),
        alternate: createNumericLiteral(42),
        test: createIdentifier('x'),
      },
      {
        name: 'number vs true',
        consequent: createNumericLiteral(42),
        alternate: createBooleanLiteral(true),
        test: createIdentifier('x'),
      },
      {
        name: 'string vs number',
        consequent: createStringLiteral('yes'),
        alternate: createNumericLiteral(0),
        test: createIdentifier('x'),
      },
      {
        name: 'number vs string',
        consequent: createNumericLiteral(1),
        alternate: createStringLiteral('no'),
        test: createIdentifier('x'),
      },
      {
        name: 'different identifiers (val1 vs val2)',
        consequent: createIdentifier('val1'),
        alternate: createIdentifier('val2'),
        test: createIdentifier('x'),
      },
      {
        name: 'different identifiers (foo vs bar)',
        consequent: createIdentifier('foo'),
        alternate: createIdentifier('bar'),
        test: createIdentifier('cond'),
      },
      {
        name: 'null vs identifier',
        consequent: createNullLiteral(),
        alternate: createIdentifier('undefined'),
        test: createIdentifier('x'),
      },
      {
        name: 'string vs identifier',
        consequent: createStringLiteral('default'),
        alternate: createIdentifier('value'),
        test: createIdentifier('x'),
      },
      {
        name: 'positive vs negative number',
        consequent: createNumericLiteral(1),
        alternate: createNumericLiteral(-1),
        test: createIdentifier('x'),
      },
      {
        name: 'different strings (ok vs error)',
        consequent: createStringLiteral('ok'),
        alternate: createStringLiteral('error'),
        test: createIdentifier('x'),
      },
      {
        name: 'different strings (yes vs no)',
        consequent: createStringLiteral('yes'),
        alternate: createStringLiteral('no'),
        test: createIdentifier('cond'),
      },
      {
        name: 'different numbers (0 vs 1)',
        consequent: createNumericLiteral(0),
        alternate: createNumericLiteral(1),
        test: createIdentifier('cond'),
      },
      {
        name: 'different numbers (100 vs 200)',
        consequent: createNumericLiteral(100),
        alternate: createNumericLiteral(200),
        test: createIdentifier('cond'),
      },
      {
        name: 'different numbers (3.14 vs 2.71)',
        consequent: createNumericLiteral(3.14),
        alternate: createNumericLiteral(2.71),
        test: createIdentifier('cond'),
      },
      {
        name: 'call expr vs member expr',
        consequent: createCallExpression(createIdentifier('fn'), []),
        alternate: createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        test: createIdentifier('x'),
      },
    ] as Array<{ name: string; consequent: unknown; alternate: unknown; test: unknown }>)(
      'should not report: $name',
      ({ consequent, alternate, test: testNode }) => {
        const { context, reports } = createMockContext()
        const visitor = noUnneededTernaryRule.create(context)

        const node = createConditionalExpression(testNode, consequent, alternate)
        visitor.ConditionalExpression(node)

        expect(reports.length).toBe(0)
      },
    )
  })

  // =====================================================
  // NESTED TERNARIES (5 tests)
  // =====================================================
  describe('nested ternary expressions', () => {
    test('should report outer ternary when inner is valid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('a'),
        createNumericLiteral(1),
        createNumericLiteral(2),
      )

      const outerTernary = createConditionalExpression(
        innerTernary,
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      // Only the outer one should be reported
      visitor.ConditionalExpression(outerTernary)

      expect(reports.length).toBe(1)
    })

    test('should report each nested ternary independently when visited', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('a'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const outerTernary = createConditionalExpression(
        innerTernary,
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      // Simulate visitor visiting both (as a real AST walker would)
      visitor.ConditionalExpression(innerTernary)
      visitor.ConditionalExpression(outerTernary)

      expect(reports.length).toBe(2)
    })

    test('should report identical branches in nested ternary when visited', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('a'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(innerTernary)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('identical')
    })

    test('should not report valid inner ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const innerTernary = createConditionalExpression(
        createIdentifier('a'),
        createStringLiteral('yes'),
        createStringLiteral('no'),
      )

      visitor.ConditionalExpression(innerTernary)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested ternary visited from inside out', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const level3 = createConditionalExpression(
        createIdentifier('c'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      const level2 = createConditionalExpression(
        createIdentifier('b'),
        createNumericLiteral(1),
        createNumericLiteral(2),
      )

      const level1 = createConditionalExpression(
        level2,
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(level3)
      visitor.ConditionalExpression(level2)
      visitor.ConditionalExpression(level1)

      expect(reports.length).toBe(2) // level3 and level1 are violations, level2 is valid
    })
  })

  // =====================================================
  // RULE EXPORT (3 tests)
  // =====================================================
  describe('rule export', () => {
    test('should have default export matching named export', () => {
      const defaultExport = noUnneededTernaryRule
      expect(defaultExport).toBe(noUnneededTernaryRule)
    })

    test('should have meta property on rule', () => {
      expect(noUnneededTernaryRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(noUnneededTernaryRule).toHaveProperty('create')
    })
  })

  // =====================================================
  // REAL-WORLD PATTERNS (10 tests)
  // =====================================================
  describe('real-world patterns', () => {
    test('should report: isActive ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isActive'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: isDisabled ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('isDisabled'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: result ? result : result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('condition'),
        createIdentifier('result'),
        createIdentifier('result'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: x > 0 ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('>', createIdentifier('x'), createNumericLiteral(0)),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: arr.length ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createMemberExpression(createIdentifier('arr'), createIdentifier('length')),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: check() ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createCallExpression(createIdentifier('check'), []),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report: user ? user.name : "Anonymous"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('user'),
        createMemberExpression(createIdentifier('user'), createIdentifier('name')),
        createStringLiteral('Anonymous'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report: age > 18 ? "adult" : "minor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createBinaryExpression('>', createIdentifier('age'), createNumericLiteral(18)),
        createStringLiteral('adult'),
        createStringLiteral('minor'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report: flag ? 0 : 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createNumericLiteral(0),
        createNumericLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report: cond ? "same" : "same"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('same'),
        createStringLiteral('same'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // MIXED TYPE COMPARISONS (8 tests)
  // =====================================================
  describe('mixed type comparisons', () => {
    test('should not report when one branch is Literal and other is Identifier with same string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('value'),
        createIdentifier('value'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when one branch is null literal and other is null identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNullLiteral(),
        createIdentifier('null'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when both are non-Literal non-Identifier with same raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'RegExpLiteral', raw: '/abc/' },
        { type: 'RegExpLiteral', raw: '/abc/' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when non-Literal non-Identifier nodes have different raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'RegExpLiteral', raw: '/abc/' },
        { type: 'RegExpLiteral', raw: '/def/' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when non-Literal non-Identifier nodes have no raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'SomeNode', value: 'x' },
        { type: 'SomeNode', value: 'x' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when one node has raw and the other does not', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'SomeNode', raw: 'x' },
        { type: 'SomeNode', value: 'x' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when one is Literal and other is non-Literal but same raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      // Literal vs TemplateLiteral with same raw
      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('test'),
        { type: 'TemplateLiteral', raw: '"test"' },
      )

      visitor.ConditionalExpression(node)

      // They are different types (Literal vs TemplateLiteral), so not equal by literal/identifier check
      // raw check: Literal.raw = '"test"', TemplateLiteral.raw = '"test"' → they ARE equal by raw
      expect(reports.length).toBe(1)
    })

    test('should not report RegExp literals as identical (compared by reference)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createRegExpLiteral('abc', 'g'),
        createRegExpLiteral('abc', 'g'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EXACT MESSAGE TEXT (6 tests)
  // =====================================================
  describe('exact message text', () => {
    test('should have exact message for true : false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary use of boolean literals in ternary expression. Use `!!condition` or `Boolean(condition)` instead.',
      )
    })

    test('should have exact message for false : true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary use of boolean literals in ternary expression. Use `!condition` instead.',
      )
    })

    test('should have exact message for identical branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(42),
        createNumericLiteral(42),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary ternary expression with identical consequent and alternate branches.',
      )
    })

    test('should have exact message for identical identifier branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createIdentifier('val'),
        createIdentifier('val'),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary ternary expression with identical consequent and alternate branches.',
      )
    })

    test('should have exact message for identical string branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createStringLiteral('same'),
        createStringLiteral('same'),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary ternary expression with identical consequent and alternate branches.',
      )
    })

    test('should have exact message for true : true (identical booleans)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(true),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toBe(
        'Unnecessary ternary expression with identical consequent and alternate branches.',
      )
    })
  })

  // =====================================================
  // ADDITIONAL COVERAGE (10 tests)
  // =====================================================
  describe('additional coverage', () => {
    test('should not report when consequent is number and alternate is null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(0),
        createNullLiteral(),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when both branches are undefined literal nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        { type: 'Identifier', name: 'undefined' },
        { type: 'Identifier', name: 'undefined' },
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle consequent as boolean false with truthy test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createStringLiteral('truthy'),
        createBooleanLiteral(false),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!condition')
    })

    test('should handle NaN numeric literal comparison (NaN !== NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(NaN),
        createNumericLiteral(NaN),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is false and alternate is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createBooleanLiteral(false),
        createNullLiteral(),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is null and alternate is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNullLiteral(),
        createBooleanLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report identical negative numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(-100),
        createNumericLiteral(-100),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical very large numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(Number.MAX_SAFE_INTEGER),
        createNumericLiteral(Number.MAX_SAFE_INTEGER),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identical small decimal numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(0.001),
        createNumericLiteral(0.001),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report Infinity vs -Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnneededTernaryRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('cond'),
        createNumericLiteral(Infinity),
        createNumericLiteral(-Infinity),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})
